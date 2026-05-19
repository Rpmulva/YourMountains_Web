-- ─────────────────────────────────────────────────────────────────────────────
-- bi_readonly_role.sql
--
-- Project: yourmountains-marketing (ref jeukkkxmamedvubookiw)
-- Brief:   Gary Brief — Analytics Setup (2026-05-19), AL-2026-05-19-03
-- Scope:   Read-only Postgres role for BI tools (Looker Studio primary,
--          Metabase fallback). SELECT on all public tables now + future
--          via DEFAULT PRIVILEGES. BYPASSRLS so RLS doesn't suppress
--          analytics queries. INSERT/UPDATE/DELETE are NOT granted —
--          verified via has_table_privilege post-apply.
--
-- Password handling: the real password was generated locally and embedded in
-- the migration apply'd via Supabase MCP. This repo copy uses a placeholder.
-- The plaintext password lives in:
--   1. Supabase migration history (one-time, project admins only)
--   2. Ryan's 1Password entry (long-term)
-- Rotate via SQL Editor if you want the migration-history copy gone:
--   ALTER ROLE bi_readonly PASSWORD '<new>';
-- ─────────────────────────────────────────────────────────────────────────────

CREATE ROLE bi_readonly LOGIN PASSWORD '<replace-with-generated-strong-password>';

ALTER ROLE bi_readonly BYPASSRLS;

GRANT CONNECT ON DATABASE postgres TO bi_readonly;
GRANT USAGE ON SCHEMA public TO bi_readonly;

GRANT SELECT ON ALL TABLES IN SCHEMA public TO bi_readonly;
GRANT SELECT ON ALL SEQUENCES IN SCHEMA public TO bi_readonly;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT ON TABLES TO bi_readonly;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT ON SEQUENCES TO bi_readonly;
