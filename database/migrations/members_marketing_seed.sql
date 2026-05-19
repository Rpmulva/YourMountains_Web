-- ============================================================
-- YourMountains members seed — FINAL (rev 2: FC-000009 name added)
-- Generated 2026-05-19 by Claudia. All values locked.
-- 4 co-founders + 38 historical + 3 Partners = 45 founders
-- ============================================================

-- Co-founders (Nov 17, 2025 — YM founding date)
INSERT INTO members (member_number, email, first_name, last_name, segments, tier, created_at) VALUES
  ('FC-000001', 'Ryan@YourMountains.Life', 'Ryan', 'Mulvaney', ARRAY['Explorers'], 'founder', '2025-11-17 00:00:00'),
  ('FC-000002', 'Rachel@YourMountains.Life', 'Rachel', 'Mulvaney', ARRAY['Explorers'], 'founder', '2025-11-17 00:00:00'),
  ('FC-000003', 'Owen@YourMountains.Life', 'Owen', 'Mulvaney', ARRAY['Explorers'], 'founder', '2025-11-17 00:00:00'),
  ('FC-000004', 'jillwindrum@gmail.com', 'Jill', 'Windrum', ARRAY['Explorers'], 'founder', '2025-11-17 00:00:00');

-- 38 historical members (FC-000005..FC-000042 — chronological by actual signup)
INSERT INTO members (member_number, email, first_name, last_name, segments, tier, created_at) VALUES
  ('FC-000005', 'Gtmwiggy@hotmail.com', 'Greg', 'Meyer', ARRAY['Explorers'], 'founder', '2025-12-16 04:31:04'),
  ('FC-000006', 'parkskrx@gmail.com', 'Chase', 'Parks', ARRAY['Explorers'], 'founder', '2025-12-16 11:29:56'),
  ('FC-000007', 'gaughan.matthew@yahoo.com', 'Matt', 'Gaughan', ARRAY['Explorers'], 'founder', '2025-12-16 16:40:06'),
  ('FC-000008', 'Kaitlynwright42@gmail.com', 'Kaitlyn', 'Wright', ARRAY['Explorers'], 'founder', '2025-12-16 20:03:18'),
  ('FC-000009', 'eliving27@gmail.com', 'John', 'Pallaoro', ARRAY['Explorers'], 'founder', '2025-12-17 09:37:32'),
  ('FC-000010', 'jackdesigns@gmail.com', 'Jackie', 'Smith', ARRAY['Explorers'], 'founder', '2025-12-17 20:31:32'),
  ('FC-000011', 'benraker80@gmail.com', 'Ben', 'Raker', ARRAY['Explorers'], 'founder', '2025-12-24 08:05:16'),
  ('FC-000012', 'walker.conolly@gmail.com', 'Walker', 'Conolly', ARRAY['Explorers'], 'founder', '2026-01-05 20:18:50'),
  ('FC-000013', 'rgv103@gmail.com', NULL, NULL, ARRAY['Explorers'], 'founder', '2026-01-06 20:20:57'),
  ('FC-000014', 'natalie_steinberg79@hotmail.com', 'Natalie', 'Steinberg', ARRAY['Explorers'], 'founder', '2026-01-13 08:57:11'),
  ('FC-000015', 'seancolliermail@gmail.com', 'Sean', 'Collier', ARRAY['Explorers'], 'founder', '2026-01-18 06:58:47'),
  ('FC-000016', 'mbkulin@yahoo.com', 'Mary Beth', 'Kulin', ARRAY['Explorers'], 'founder', '2026-01-19 15:18:20'),
  ('FC-000017', 'andrewtr2006@protonmail.com', 'Andrew', NULL, ARRAY['Explorers'], 'founder', '2026-01-19 22:01:04'),
  ('FC-000018', 'mustardmade2010@outlook.com', NULL, NULL, ARRAY['Explorers'], 'founder', '2026-01-19 22:08:33'),
  ('FC-000019', 'michael.garel@utexas.edu', 'Michael', 'Garel', ARRAY['Explorers'], 'founder', '2026-01-20 19:07:46'),
  ('FC-000020', 'duck@gearx.com', 'Marc', 'Sherman', ARRAY['Vendor Partners'], 'founder', '2026-01-20 20:30:18'),
  ('FC-000021', 'andymarshall17@gmail.com', 'Andy', 'Marshall', ARRAY['Explorers'], 'founder', '2026-01-22 17:11:54'),
  ('FC-000022', 'Phillipmknight@gmail.com', 'Phil', 'Knight', ARRAY['Explorers'], 'founder', '2026-01-22 17:16:51'),
  ('FC-000023', 'm_leslie_5@yahoo.com', 'Matt', 'Leslie', ARRAY['Explorers'], 'founder', '2026-01-23 13:18:55'),
  ('FC-000024', 'tlgoldschmidt@gmail.com', 'Tamara', 'Goldschmidt', ARRAY['Explorers'], 'founder', '2026-01-26 12:29:24'),
  ('FC-000025', 'raffi@kotikian.com', 'Raffi', 'Kotikian', ARRAY['Explorers'], 'founder', '2026-01-27 18:34:49'),
  ('FC-000026', 'krkahnweiler@gmail.com', 'Kyle', 'Khanweiler', ARRAY['Explorers'], 'founder', '2026-01-29 13:17:03'),
  ('FC-000027', 'wicker68@yahoo.com', 'Adam', 'Wick', ARRAY['Explorers'], 'founder', '2026-02-10 17:57:59'),
  ('FC-000028', 'Stephaniebmchenry@gmail.com', 'Stephanie', 'McHenry', ARRAY['Explorers'], 'founder', '2026-02-10 18:29:41'),
  ('FC-000029', 'Marie.mcintyre115@gmail.com', 'Marie', 'Mcintyre', ARRAY['Explorers'], 'founder', '2026-02-10 18:48:19'),
  ('FC-000030', 'julio.kuok@gmail.com', 'Julio', 'Kuok', ARRAY['Explorers'], 'founder', '2026-02-10 19:38:07'),
  ('FC-000031', 'Derrick@ibddesignstudio.com', 'Derek', 'Packer', ARRAY['Explorers'], 'founder', '2026-02-10 20:49:38'),
  ('FC-000032', 'jonw1124@gmail.com', 'Jon', 'Weiner', ARRAY['Explorers'], 'founder', '2026-02-11 01:15:08'),
  ('FC-000033', 'johnstonj551@yahoo.com', 'John', 'Johnton', ARRAY['Explorers'], 'founder', '2026-02-11 01:17:58'),
  ('FC-000034', 'rockymountainmindset@outlook.com', NULL, NULL, ARRAY['Explorers'], 'founder', '2026-02-11 01:30:40'),
  ('FC-000035', 'jalgie8@gmail.com', 'John', 'Algie', ARRAY['Explorers'], 'founder', '2026-02-11 09:46:27'),
  ('FC-000036', 'Ajbelletti@gmail.com', 'Adam', 'Belletti', ARRAY['Explorers'], 'founder', '2026-02-11 10:34:37'),
  ('FC-000037', 'nkspano84@gmail.com', 'Nick', 'Spanodakis', ARRAY['Explorers'], 'founder', '2026-02-11 13:59:46'),
  ('FC-000038', 'eisenhowerbenjamin@gmail.com', 'Ben', 'Eisenhower', ARRAY['Explorers'], 'founder', '2026-02-12 00:35:02'),
  ('FC-000039', 'joshuatscott@gmail.com', 'Josh', 'Scott', ARRAY['Explorers'], 'founder', '2026-02-12 07:45:10'),
  ('FC-000040', 'mcdonough.patrick@gmail.com', 'Pat', 'McDonough', ARRAY['Explorers'], 'founder', '2026-02-13 20:38:02'),
  ('FC-000041', 'cm_adams@hotmail.com', 'Chris', 'Adams', ARRAY['Explorers'], 'founder', '2026-02-25 22:57:22'),
  ('FC-000042', 'kurzj37@gmail.com', 'Josh', 'Kurz', ARRAY['Explorers'], 'founder', '2026-02-27 20:59:26');

-- Three Partners (FC-000043..FC-000045 — direct-outreach agreement dates)
INSERT INTO members (member_number, email, first_name, last_name, segments, tier, created_at) VALUES
  ('FC-000043', 'maddie@FDRD.org', 'Maddie', 'Retrosi', ARRAY['Community Anchors'], 'founder', '2026-04-10 00:00:00'),
  ('FC-000044', 'seth@sosoutreach.org', 'Seth', 'Ehrlich', ARRAY['Community Anchors'], 'founder', '2026-05-13 00:00:00'),
  ('FC-000045', 'paul@WalkingMountains.org', 'Paul', 'Abling', ARRAY['Community Anchors'], 'founder', '2026-05-15 00:00:00');

-- Advance sequence past the seeded numbers — next organic signup gets FC-000046
SELECT setval('fc_member_seq', 45);
