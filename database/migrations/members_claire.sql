-- ─────────────────────────────────────────────────────────────────────────────
-- members_claire.sql
--
-- Project: Claire app (ref sbjaqhsexlwqfowckddk)
-- Brief:   Member identity schema + multi-segment normalization
--          (Claudia, 2026-05-18 — schema work parallel to FC Welcome Experience)
-- Scope:   Creates the `members` table fresh in Claire with identical schema
--          to marketing. No seed data — initial seed lives in marketing tonight,
--          dual-project sync mechanism TBD per Brief §6 Open Question.
--
-- Pre-flight verified 2026-05-18:
--   - no members table exists in this project
--   - no fc_member_seq, no random_alphanumeric_6, no assign_member_number
--   - no naming collision with profiles/partners/invite_codes tables
--
-- Companion: members_marketing.sql (full migration with seed for marketing).
-- ─────────────────────────────────────────────────────────────────────────────

BEGIN;

-- 1. Create table ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.members (
  id            uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  email         text          NOT NULL,
  segments      text[]        NOT NULL DEFAULT '{}',
  member_number text          UNIQUE,
  tier          text          NOT NULL DEFAULT 'founder'
                              CHECK (tier IN ('founder', 'member')),
  created_at    timestamptz   NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_members_email_lower
  ON public.members (LOWER(email));

ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

-- Match marketing-side policy. service_role bypasses RLS regardless;
-- this is hygiene + documentation.
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

-- 3. Random 6-char alphanumeric helper ───────────────────────────────────────

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

-- 4. Number assignment trigger ───────────────────────────────────────────────
-- Identical behavior to marketing-side trigger — see members_marketing.sql
-- for design notes on TOCTOU and retry budget.

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
      candidate := EXTRACT(YEAR FROM NOW())::text || '-' || public.random_alphanumeric_6();
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

-- 5. UPSERT RPC ──────────────────────────────────────────────────────────────
-- Identical to marketing-side. App can call this when reading/writing members
-- once the cross-project sync mechanism is decided.

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

COMMIT;
