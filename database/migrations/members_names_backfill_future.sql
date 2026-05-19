-- Name backfill UPDATE — apply only if 08_final_seed_sql.sql has already been fired.
-- Adds names that arrived AFTER the initial seed.

UPDATE members SET last_name = 'Pallaoro'
  WHERE member_number = 'FC-000009';

-- Still pending (NULL until Ryan provides):
--   FC-000013 (rgv103@gmail.com) — first + last name
--   FC-000017 (andrewtr2006@protonmail.com) — last name (first = Andrew)
--   FC-000018 (mustardmade2010@outlook.com) — first + last name
--   FC-000034 (rockymountainmindset@outlook.com) — first + last name
