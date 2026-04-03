# Data Deletion Request — Operational Checklist

**Owner:** Chase  
**SLA:** Respond within 5 business days, complete within 30 days  
**Trigger:** Email to policy@yourmountains.life with subject "Data Deletion Request"

---

## Step 1 — Acknowledge

Reply to the requester within 5 business days:

> "Hi [Name], we received your data deletion request on [date]. We will complete deletion within 30 days and confirm when done. — YourMountains Team"

---

## Step 2 — Delete from Supabase (Marketing DB)

**Project:** `yourmountains-marketing`  
**Host:** `jeukkkxmamedvubookiw.supabase.co`  
**Access:** Supabase dashboard → SQL Editor

Run the following for each table (replace `[email]` with the requester's email):

```sql
-- Founders Club / waitlist signups
DELETE FROM waitlist_signups WHERE email = '[email]';

-- Explorer survey responses
DELETE FROM explorer_survey_responses WHERE email = '[email]';

-- Vendor Partner survey responses
DELETE FROM vendor_survey_responses WHERE email = '[email]';

-- Membership interest (if table exists)
DELETE FROM membership_interest WHERE email = '[email]';

-- Ambassador applications (if table exists)
DELETE FROM ambassador_applications WHERE email = '[email]';

-- Contact/message submissions
DELETE FROM contact_submissions WHERE email = '[email]';
```

> **Note:** Run `SELECT * FROM <table> WHERE email = '[email]'` first to confirm what exists before deleting.

---

## Step 3 — Delete from Supabase (App DB)

**Project:** `sbjaqhsexlwqfowckddk` (main CAC/YourMountains app)  
**Access:** Supabase dashboard → SQL Editor

Find the user's `id` first:

```sql
SELECT id, email FROM auth.users WHERE email = '[email]';
```

Then delete from app tables using the `user_id`:

```sql
-- User profile
DELETE FROM profiles WHERE id = '[user_id]';

-- Social posts
DELETE FROM social_posts WHERE user_id = '[user_id]';

-- Gear locker items
DELETE FROM user_gear WHERE user_id = '[user_id]';

-- Gear swap listings
DELETE FROM gear_listings WHERE user_id = '[user_id]';

-- User adventures / motion diary
DELETE FROM user_adventures WHERE user_id = '[user_id]';

-- Events (created by user)
DELETE FROM events WHERE created_by = '[user_id]';

-- Auth user (do this last)
-- Use Supabase dashboard: Authentication → Users → find user → delete
-- Or via SQL: DELETE FROM auth.users WHERE id = '[user_id]';
```

> **Warning:** Deleting from `auth.users` is permanent and cannot be undone. Confirm all other deletions first.

---

## Step 4 — Delete from Netlify Forms

1. Go to [app.netlify.com](https://app.netlify.com) → Site: `874ce89a-2a55-4cac-9569-d60d88099fc6`
2. Navigate to **Forms** in the left sidebar
3. Click each form name and search for the requester's email
4. Select the matching submission(s)
5. Click **Delete** (the delete button is in the submission detail view)

Forms to check:
- `founders-signup`
- `contact`
- `form-vendor-survey`
- `form-explorer-survey` (when live)

---

## Step 5 — Delete from Microsoft SharePoint

1. Open the relevant SharePoint list (YM Signup List or YM Messages)
2. Search/filter by the requester's email
3. Select and delete the row(s)
4. If Power Automate has stored data elsewhere, check those destinations too

---

## Step 6 — Google Analytics

GA4 does not store personally identifiable information by default. However, if needed:

1. Go to [analytics.google.com](https://analytics.google.com) → Select the YourMountains GA4 property
2. Navigate to **Admin** → **Data Deletion**
3. Submit a **Data Deletion Request** specifying the date range and any user identifiers (GA does not support email-based deletion — deletion is by date range or user property)

> **Note:** GA4 data is aggregated and anonymized. In most cases, no GA4 deletion action is needed for standard deletion requests.

---

## Step 7 — Confirm to Requester

Once all steps are complete, email the requester:

> "Hi [Name], we have completed deletion of your personal data from all YourMountains systems as of [date]. If you have any questions, reply to this email or contact policy@yourmountains.life."

---

## Summary Table

| System | Table/Location | Delete by | Done? |
|--------|---------------|-----------|-------|
| Supabase Marketing | `waitlist_signups` | email | ☐ |
| Supabase Marketing | `explorer_survey_responses` | email | ☐ |
| Supabase Marketing | `vendor_survey_responses` | email | ☐ |
| Supabase Marketing | `contact_submissions` | email | ☐ |
| Supabase App | `profiles` | user_id | ☐ |
| Supabase App | `social_posts` | user_id | ☐ |
| Supabase App | `user_gear` | user_id | ☐ |
| Supabase App | `gear_listings` | user_id | ☐ |
| Supabase App | `user_adventures` | user_id | ☐ |
| Supabase App | `events` | user_id | ☐ |
| Supabase App | `auth.users` | user_id | ☐ |
| Netlify Forms | All forms | manual | ☐ |
| SharePoint | YM Signup List / YM Messages | manual | ☐ |
| Google Analytics | Data Deletion Request | date range | ☐ |
| Confirm to user | Email reply | — | ☐ |

---

*This checklist was created April 3, 2026. Update as new tables and services are added.*  
*Chase is the designated owner of this process. Questions: policy@yourmountains.life*
