-- ─────────────────────────────────────────────────────────────────────────────
-- members_marketing.sql
--
-- Project: yourmountains-marketing (ref jeukkkxmamedvubookiw)
-- Brief:   Member identity schema + multi-segment normalization
--          (Claudia, 2026-05-18; README update 2026-05-19)
-- Scope:   Schema only — renames founders_club_signups → members, restructures,
--          installs trigger-based number assignment + UPSERT RPC.
--          Seed lives in 08_final_seed_sql.sql (45 rows), applied separately
--          immediately after this migration per the prepared bundle.
--
-- Pre-flight verified 2026-05-18:
--   - founders_club_signups row_count = 0 (safe to ALTER in place)
--   - no members table, no fc_member_seq, no helper functions in this project
--
-- Companion: members_claire.sql (DDL-only mirror for the Claire app project).
-- Transaction management is handled by Supabase apply_migration — no explicit
-- BEGIN/COMMIT here.
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Rename + restructure ────────────────────────────────────────────────────

ALTER TABLE public.founders_club_signups RENAME TO members;

ALTER TABLE public.members
  DROP COLUMN role,
  ADD COLUMN first_name    text,
  ADD COLUMN last_name     text,
  ADD COLUMN segments      text[]      NOT NULL DEFAULT '{}',
  ADD COLUMN member_number text        UNIQUE,
  ADD COLUMN tier          text        NOT NULL DEFAULT 'founder'
    CHECK (tier IN ('founder', 'member'));

-- Email is the canonical identity once this migration lands.
ALTER TABLE public.members
  ALTER COLUMN email SET NOT NULL;

-- One row per user, case-insensitive on email.
CREATE UNIQUE INDEX IF NOT EXISTS idx_members_email_lower
  ON public.members (LOWER(email));

-- Re-target the RLS policy to the new table name.
DROP POLICY IF EXISTS service_role_insert_founders_club_signups ON public.members;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='members' AND policyname='service_role_insert_members') THEN
    CREATE POLICY service_role_insert_members
      ON public.members FOR INSERT TO service_role
      WITH CHECK (true);
  END IF;
END $$;

-- 2. Founder sequence ────────────────────────────────────────────────────────

CREATE SEQUENCE IF NOT EXISTS public.fc_member_seq START WITH 1;

-- 3. Helpers ─────────────────────────────────────────────────────────────────

-- Random 6-char alphanumeric for tier='member' suffix.
CREATE OR REPLACE FUNCTION public.random_alphanumeric_6()
RETURNS text
LANGUAGE plpgsql
VOLATILE
AS $$
DECLARE
  chars  text := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result text := '';
BEGIN
  FOR i IN 1..6 LOOP
    result := result || substr(chars, floor(random() * length(chars))::int + 1, 1);
  END LOOP;
  RETURN result;
END;
$$;

-- Year-to-Roman-numeral converter. Member-tier numbers use ROMAN-XXXXXX per
-- README 2026-05-19: e.g. 2026 → 'MMXXVI', 2027 → 'MMXXVII'.
CREATE OR REPLACE FUNCTION public.year_to_roman(p_year int)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  numerals int[]  := ARRAY[1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
  symbols  text[] := ARRAY['M', 'CM', 'D', 'CD', 'C', 'XC', 'L', 'XL', 'X', 'IX', 'V', 'IV', 'I'];
  result   text   := '';
  i        int;
  n        int    := p_year;
BEGIN
  IF n <= 0 THEN
    RAISE EXCEPTION 'year_to_roman expects positive year, got %', p_year;
  END IF;
  FOR i IN 1..array_length(numerals, 1) LOOP
    WHILE n >= numerals[i] LOOP
      result := result || symbols[i];
      n := n - numerals[i];
    END LOOP;
  END LOOP;
  RETURN result;
END;
$$;

-- 4. Number assignment trigger ───────────────────────────────────────────────
--
-- - Explicit member_number on insert (seed / backfill) → preserved
-- - tier='founder' without member_number → next FC-XXXXXX from fc_member_seq
-- - tier='member' without member_number → ROMAN-XXXXXX (year in Roman),
--   retry up to 10 on collision. README §7 test 4 expects 'MMXXVI-XXXXXX'
--   for 2026.

CREATE OR REPLACE FUNCTION public.assign_member_number()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  candidate text;
  attempt   int := 0;
BEGIN
  IF NEW.member_number IS NOT NULL THEN
    RETURN NEW;
  END IF;

  IF NEW.tier = 'founder' THEN
    NEW.member_number := 'FC-' || LPAD(nextval('public.fc_member_seq')::text, 6, '0');
  ELSE
    LOOP
      attempt := attempt + 1;
      candidate := public.year_to_roman(EXTRACT(YEAR FROM NOW())::int)
                || '-' || public.random_alphanumeric_6();
      EXIT WHEN NOT EXISTS (
        SELECT 1 FROM public.members WHERE member_number = candidate
      );
      IF attempt > 10 THEN
        RAISE EXCEPTION 'member_number collision retry exhausted (attempt=%, candidate=%)', attempt, candidate;
      END IF;
    END LOOP;
    NEW.member_number := candidate;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_assign_member_number ON public.members;
CREATE TRIGGER trg_assign_member_number
  BEFORE INSERT ON public.members
  FOR EACH ROW EXECUTE FUNCTION public.assign_member_number();

-- 5. UPSERT RPC (atomic, segments-union semantics) ───────────────────────────
--
-- form-submission.mjs calls this via POST /rest/v1/rpc/upsert_member_segments.
-- On conflict, segments are merged as DISTINCT union; member_number and
-- created_at are preserved. Returns the canonical row so the function can
-- surface memberNumber in its response.

CREATE OR REPLACE FUNCTION public.upsert_member_segments(
  p_email     text,
  p_segments  text[]
)
RETURNS TABLE(member_number text, segments text[], created_at timestamptz, was_new boolean)
LANGUAGE plpgsql
AS $$
DECLARE
  existing_id uuid;
BEGIN
  SELECT id INTO existing_id
    FROM public.members
    WHERE LOWER(email) = LOWER(p_email);

  IF FOUND THEN
    RETURN QUERY
      UPDATE public.members m
      SET segments = (
        SELECT COALESCE(array_agg(DISTINCT s ORDER BY s), '{}')
        FROM unnest(m.segments || COALESCE(p_segments, '{}')) AS s
        WHERE s IS NOT NULL AND s <> ''
      )
      WHERE m.id = existing_id
      RETURNING m.member_number, m.segments, m.created_at, false;
  ELSE
    RETURN QUERY
      INSERT INTO public.members (email, segments, tier)
      VALUES (p_email, COALESCE(p_segments, '{}'), 'founder')
      RETURNING members.member_number, members.segments, members.created_at, true;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.upsert_member_segments(text, text[]) TO service_role;
