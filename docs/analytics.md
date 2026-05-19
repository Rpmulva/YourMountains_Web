# Analytics — what's wired and where

Per Gary Brief Analytics Setup (2026-05-19), AL-2026-05-19-03 + AL-2026-05-19-04.

## 1. Read-only Postgres role on marketing Supabase

Migration: `database/migrations/bi_readonly_role.sql` (audit copy — real password lives in 1Password + Supabase migration history, not in repo).

Role `bi_readonly` has:

- `SELECT` on every public table on `jeukkkxmamedvubookiw` (members, all four survey tables, contact_messages)
- `SELECT` on future tables via `ALTER DEFAULT PRIVILEGES`
- `BYPASSRLS` so analytics queries see all rows
- **No** `INSERT`/`UPDATE`/`DELETE` anywhere — verified via `has_table_privilege` checks
- Login enabled, CONNECT on database `postgres`, USAGE on schema `public`

Looker Studio connection params live in `Beta Readiness/Looker_Studio_Connection.md`.

## 2. GA4 measurement ID

Measurement ID: **`G-YBKS6BDE9N`** (Ryan@yourmountains.life Google account).

The gtag.js loader is installed in the `<head>` of all 6 HTML pages:

- `standalone-deploy/index.html`
- `standalone-deploy/vendor-survey.html`
- `standalone-deploy/influencer-survey.html`
- `standalone-deploy/core-partner-survey.html`
- `standalone-deploy/explorer-survey.html`
- `standalone-deploy/privacy-policy.html`

Loads unconditionally on page load. Enhanced Measurement (page_view, scroll, outbound clicks, etc.) enabled at the GA4 property level.

> **Compliance note:** the index.html cookie banner UI still exists but the GA tag fires regardless of consent state. If you want consent-gated loading later, restore the `loadGA()` pattern that was removed in this PR — see git history.

## 3. Custom events on form submissions

All events fire **only after a successful submission** (`res.ok === true`). No events on failure or network error.

| Form | File | Event | Parameters |
|---|---|---|---|
| Founder's Club signup | `index.html` (handleFoundersSubmit) | `signup_fc` | `segments` (comma-joined string), `member_number` (string or null) |
| Contact Founders | `index.html` (handleContactSubmit) | `contact_form_submit` | none |
| Vendor survey | `vendor-survey.html` (handleSubmit) | `survey_submit_vendor` | none |
| Influencer/Creator survey | `influencer-survey.html` | `survey_submit_influencer` | none |
| Core Partner survey | `core-partner-survey.html` | `survey_submit_core_partner` | none |
| Explorer survey | `explorer-survey.html` | `survey_submit_explorer` | none |

All event calls are guarded by `typeof window.gtag === 'function'` so they no-op if GA hasn't loaded yet (e.g., if a downstream cookie-consent gate is reintroduced).

The `signup_fc` event's `member_number` parameter relies on the response shape from `feature/member-identity-schema` (PR #5). Until that PR merges, the response doesn't include `memberNumber` and the parameter is null. The event still fires.

## 4. To do in GA4 admin (Ryan)

Once events start firing in production, mark each as a Conversion:

1. Open https://analytics.google.com/ → property "YourMountains — yourmountains.life"
2. Admin → Events
3. Find each event (after the first instance lands — typically <24h):
   - `signup_fc`
   - `survey_submit_vendor`
   - `survey_submit_influencer`
   - `survey_submit_core_partner`
   - `survey_submit_explorer`
   - `contact_form_submit`
4. Toggle **Mark as conversion** for each

## 5. DebugView verification

To verify events fire before they show up in standard reports (which can be hours-delayed):

1. Install the **GA Debugger** Chrome extension
2. Enable it on yourmountains.life
3. GA4 → Admin → DebugView
4. Submit a test form (e.g., explorer survey with a recognizable email like `gary-test@yourmountains.life`)
5. DebugView should show `page_view` then `survey_submit_explorer` within seconds

Don't forget to delete test rows from Supabase after verification:

```sql
DELETE FROM explorer_survey_responses WHERE email LIKE 'gary-test%';
```

## 6. Existing `trackEvent` helper

`index.html` has a pre-existing `trackEvent(action, label)` helper at ~line 914 that fires generic events like `gtag('event', 'form_start', { event_label: 'contact' })`. These fire on submit attempts and modal opens — separate signal from the success-only events above. Both coexist; the success events are the conversion-marked ones, the trackEvent calls are informational.
