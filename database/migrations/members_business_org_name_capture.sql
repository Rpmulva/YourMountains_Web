-- ─────────────────────────────────────────────────────────────────────────────
-- members_business_org_name_capture.sql
--
-- Brief:   G-2026-05-20-FC-NAMES (Claudia) — capture business_name (Vendor
--          Partners) and org_name (Community Anchors) at FC signup.
-- Scope:   Schema additions on both Supabase projects (marketing + Claire),
--          backfill 3 Community Anchor org_names (marketing only — Claire is
--          empty), extend upsert_member_segments RPC signature, drop old
--          2-param overload to avoid PostgREST ambiguity.
--
-- Applied:
--   - jeukkkxmamedvubookiw (marketing) — schema + backfill + RPC + drop-overload
--   - sbjaqhsexlwqfowckddk (Claire)     — schema + RPC + drop-overload
--     (backfill UPDATEs are no-ops on Claire's 0-row table; kept for parity)
--
-- Source data for Vendor Partner business_name backfill: surveyed all 5 raw
-- CSVs in gary_member_migration_inputs/. None contain a business_name field.
-- Only Vendor Partner in seed is FC-000020 (Marc Sherman, duck@gearx.com);
-- per brief §6, NULL preserved rather than guessing from the email domain.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.members
  ADD COLUMN IF NOT EXISTS business_name TEXT,
  ADD COLUMN IF NOT EXISTS org_name      TEXT;

COMMENT ON COLUMN public.members.business_name IS
  'Captured at FC signup for Vendor Partner segment only. Proper-noun, case-preserved.';
COMMENT ON COLUMN public.members.org_name IS
  'Captured at FC signup for Community Anchor segment only. Proper-noun, case-preserved.';

-- Backfill: Community Anchor founders (marketing project)
UPDATE public.members SET org_name = 'Friends of the Dillon Ranger District'
  WHERE member_number = 'FC-000043';
UPDATE public.members SET org_name = 'SOS Outreach'
  WHERE member_number = 'FC-000044';
UPDATE public.members SET org_name = 'Walking Mountains'
  WHERE member_number = 'FC-000045';

-- CREATE OR REPLACE can't change a function's signature (adding parameters
-- creates an overload). Drop the old 2-param version before installing the
-- 4-param replacement.
DROP FUNCTION IF EXISTS public.upsert_member_segments(text, text[]);

CREATE OR REPLACE FUNCTION public.upsert_member_segments(
  p_email          text,
  p_segments       text[],
  p_business_name  text DEFAULT NULL,
  p_org_name       text DEFAULT NULL
)
RETURNS TABLE(
  member_number text,
  segments      text[],
  business_name text,
  org_name      text,
  created_at    timestamptz,
  was_new       boolean
)
LANGUAGE plpgsql
AS $func$
DECLARE
  existing_id uuid;
BEGIN
  SELECT id INTO existing_id
    FROM public.members
    WHERE LOWER(email) = LOWER(p_email);

  IF FOUND THEN
    -- COALESCE-protect existing names: don't overwrite a case-correct value
    -- already in place. If user wants to change it, they email Ryan.
    RETURN QUERY
      UPDATE public.members m
      SET segments = (
            SELECT COALESCE(array_agg(DISTINCT s ORDER BY s), '{}')
            FROM unnest(m.segments || COALESCE(p_segments, '{}')) AS s
            WHERE s IS NOT NULL AND s <> ''
          ),
          business_name = COALESCE(m.business_name, NULLIF(p_business_name, '')),
          org_name      = COALESCE(m.org_name,      NULLIF(p_org_name, ''))
      WHERE m.id = existing_id
      RETURNING m.member_number, m.segments, m.business_name, m.org_name, m.created_at, false;
  ELSE
    RETURN QUERY
      INSERT INTO public.members (email, segments, tier, business_name, org_name)
      VALUES (
        p_email,
        COALESCE(p_segments, '{}'),
        'founder',
        NULLIF(p_business_name, ''),
        NULLIF(p_org_name, '')
      )
      RETURNING members.member_number, members.segments, members.business_name, members.org_name, members.created_at, true;
  END IF;
END;
$func$;

GRANT EXECUTE ON FUNCTION public.upsert_member_segments(text, text[], text, text) TO service_role;
