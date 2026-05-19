-- ─────────────────────────────────────────────────────────────────────────────
-- members_marketing.sql
--
-- Project: yourmountains-marketing (ref jeukkkxmamedvubookiw)
-- Brief:   Member identity schema + multi-segment normalization
--          (Claudia, 2026-05-18 — schema work parallel to FC Welcome Experience)
-- Scope:   Renames founders_club_signups → members in marketing,
--          restructures schema, installs trigger-based number assignment,
--          seeds FC-000001..FC-000004 (co-founders), seeds historical FC
--          signups, then Three Partners. Sequence advanced past last assigned.
--
-- Pre-flight verified 2026-05-18:
--   - founders_club_signups row_count = 0 (safe to ALTER in place)
--   - no members table exists in this project
--   - no fc_member_seq exists in this project
--
-- Companion: members_claire.sql (DDL-only mirror for Claire app project).
-- ─────────────────────────────────────────────────────────────────────────────

BEGIN;

-- 1. Rename + restructure ────────────────────────────────────────────────────

ALTER TABLE public.founders_club_signups RENAME TO members;

ALTER TABLE public.members
  DROP COLUMN role,
  ADD COLUMN segments      text[]                  NOT NULL DEFAULT '{}',
  ADD COLUMN member_number text                    UNIQUE,
  ADD COLUMN tier          text                    NOT NULL DEFAULT 'founder'
    CHECK (tier IN ('founder', 'member'));

-- Email must be present once we treat it as the canonical identity.
-- Existing rows pass (table is empty) — defensive guard for future inserts.
ALTER TABLE public.members
  ALTER COLUMN email SET NOT NULL;

-- One row per user, case-insensitive on email.
CREATE UNIQUE INDEX IF NOT EXISTS idx_members_email_lower
  ON public.members (LOWER(email));

-- Rename existing RLS policy to match new table name.
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
--
-- - Explicit member_number on insert (seed / backfill) → preserved
-- - tier='founder' without member_number → next FC-XXXXXX from fc_member_seq
-- - tier='member' without member_number → YYYY-XXXXXX, retry up to 10 on collision
--
-- Note on TOCTOU: the EXISTS check + INSERT isn't atomic; the UNIQUE constraint
-- on member_number is the actual safety. At ~10k members, collision probability
-- per insert is ~5e-6 against the 36^6 candidate space, so 10 retries is overkill.

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

-- 5. UPSERT RPC for the function (atomic, segments-union semantics) ──────────
--
-- form-submission.mjs calls this via POST /rest/v1/rpc/upsert_member_segments.
-- Returns the canonical row (member_number, segments, created_at, was_new)
-- so the function can surface memberNumber in its response.

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

-- Allow service_role to call the RPC (it bypasses RLS but PostgREST checks
-- function execute privilege).
GRANT EXECUTE ON FUNCTION public.upsert_member_segments(text, text[]) TO service_role;

-- 6. Co-founders seed (FC-000001..FC-000004) ─────────────────────────────────
-- All 'Explorers'. created_at uniform at BETA_LAUNCH_DATE.
-- @TODO[BETA_LAUNCH_DATE]: replace the placeholder timestamp before running.

INSERT INTO public.members (email, segments, tier, member_number, created_at)
VALUES
  ('Ryan@YourMountains.Life',    ARRAY['Explorers'], 'founder', 'FC-000001', '__BETA_LAUNCH_DATE__'::timestamptz),
  ('Rachel@YourMountains.Life',  ARRAY['Explorers'], 'founder', 'FC-000002', '__BETA_LAUNCH_DATE__'::timestamptz),
  ('Owen@YourMountains.Life',    ARRAY['Explorers'], 'founder', 'FC-000003', '__BETA_LAUNCH_DATE__'::timestamptz),
  ('jillwindrum@gmail.com',      ARRAY['Explorers'], 'founder', 'FC-000004', '__BETA_LAUNCH_DATE__'::timestamptz);

-- 7. Historical FC signups (FC-000005..FC-0000NN) ────────────────────────────
-- @TODO[historical]: replaced by import-prep script output.
-- Source merge: SharePoint List "YM Signup List" ∪ MS Forms FC opt-ins.
-- Dedupe by LOWER(email), sort by earliest signup_date ascending.
-- Role normalization: explorer→['Explorers'], vendor→['Vendor Partners'],
-- both→['Explorers','Vendor Partners'].
-- Preserves original signup_date as created_at.
--
-- INSERT INTO public.members (email, segments, tier, member_number, created_at) VALUES
--   ('historical-1@example.com',  ARRAY['Explorers'],                      'founder', 'FC-000005', '2026-04-12 14:23:00+00'::timestamptz),
--   ('historical-2@example.com',  ARRAY['Vendor Partners'],                'founder', 'FC-000006', '2026-04-13 09:11:00+00'::timestamptz),
--   ('historical-3@example.com',  ARRAY['Explorers','Vendor Partners'],    'founder', 'FC-000007', '2026-04-14 18:02:00+00'::timestamptz);

-- 8. Three Partners seed (appended after historical) ─────────────────────────
-- @TODO[partner-emails]: replace placeholders with real contact addresses.
-- @TODO[FC-XXXXXX]: replace with sequential numbers continuing past historical NN.
--
-- INSERT INTO public.members (email, segments, tier, member_number, created_at) VALUES
--   ('__FDRD_EMAIL__',              ARRAY['Community Anchors'], 'founder', 'FC-XXXXXX', '__BETA_LAUNCH_DATE__'::timestamptz),
--   ('__SOS_OUTREACH_EMAIL__',      ARRAY['Community Anchors'], 'founder', 'FC-XXXXXX', '__BETA_LAUNCH_DATE__'::timestamptz),
--   ('__WALKING_MOUNTAINS_EMAIL__', ARRAY['Community Anchors'], 'founder', 'FC-XXXXXX', '__BETA_LAUNCH_DATE__'::timestamptz);

-- 9. Advance sequence past last explicitly-assigned number ───────────────────
-- @TODO[setval]: pass the highest assigned FC number after seeds.
-- Form `SELECT setval('public.fc_member_seq', N, true)` — `true` means
-- next nextval() returns N+1.
--
-- After co-founders only (no historical, no partners):
--   SELECT setval('public.fc_member_seq', 4, true);
-- After full seed:
--   SELECT setval('public.fc_member_seq', __LAST_FC_NUMBER__, true);

COMMIT;
