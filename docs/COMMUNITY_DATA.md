# COMMUNITY_DATA — Suggestions & Consent-Based Updates

## Purpose
Provide a maintainable way for users to:
1. Send product suggestions, bug reports and content corrections to the developer.
2. Explicitly opt in to occasional Easeur feature/app launch emails.
3. Unsubscribe at any time.

Public UI: `/contact` (linked in the footer).

## Architecture
```
/contact client forms
   ├─ POST /api/feedback ──> feedback_submissions (PostgreSQL)
   ├─ POST /api/subscribe ─> marketing_subscribers (PostgreSQL, email unique)
   └─ POST /api/unsubscribe -> subscriber status/consent update
                                  │
                                  └─ optional COMMUNITY_WEBHOOK_URL
                                     (Excel/Power Automate/Zapier/Make later)
```
PostgreSQL is the source of truth. Webhook failure never loses a submission.

## Tables
### feedback_submissions
- `type`: suggestion | bug | content | other
- `name`, `email`: optional
- `message`: required, 10–3,000 characters
- `page_path`: where the feedback originated
- `status`: new → reviewed → planned → resolved / declined
- `created_at`

### marketing_subscribers
- `email`: unique
- `consent`: explicit boolean
- `consent_text`: exact language accepted at submission time
- `source`: acquisition point (`contact-page` now)
- `status`: subscribed | unsubscribed
- `created_at`, `updated_at`

## Consent & User Expectations
Marketing email is NOT bundled with feedback. The update form requires a checkbox
with the exact `MARKETING_CONSENT_TEXT` in `src/lib/community.ts`. Re-submitting an
email updates/resubscribes one row; it does not duplicate it. The contact page has
an unsubscribe form. API responses avoid revealing whether an address exists.

Before sending real campaigns, Easeur should add its formal privacy policy URL,
company contact details and legally required email-footer/unsubscribe text for the
jurisdictions served.

## Validation & Spam Controls
- Email normalization/format validation.
- Required consent for subscription.
- Message length limits.
- Hidden honeypot field on both public forms.
- No public list/read API.
- Client receives generic database errors.
- Future public-scale recommendation: add edge rate limiting / Turnstile if abuse
  appears; do not add CAPTCHA preemptively.

## Excel / Spreadsheet Workflow
### Option A — Manual CSV export (available now)
```bash
node scripts/export-community.mjs
# outputs:
# exports/feedback.csv
# exports/subscribers.csv (active + consented only)
```
Both files open directly in Excel. A custom output directory can be passed as the
first argument.

### Option B — Live Power Automate / Excel sync (framework ready)
Configure server secrets:
```
COMMUNITY_WEBHOOK_URL=https://...
COMMUNITY_WEBHOOK_SECRET=optional-bearer-secret
```
Each stored event is mirrored as JSON:
- `feedback.created`
- `subscriber.subscribed`
- `subscriber.unsubscribed`

Power Automate can receive the HTTP event and append/update a row in an Excel
table on OneDrive/SharePoint. Zapier, Make, Apps Script or an Easeur backend can
use the same event contract. Database remains authoritative.

## Developer Review Workflow
Suggested lightweight weekly process:
1. Export/open feedback or query new rows.
2. Change `status` to reviewed.
3. Link accepted items into the product backlog; set planned.
4. After shipping, set resolved and optionally reply if an email was provided.
5. Never add optional feedback emails to marketing subscribers.

## Relevant Files
- `src/db/schema.ts`
- `src/app/contact/page.tsx`
- `src/app/contact/ContactForms.tsx`
- `src/app/api/feedback/route.ts`
- `src/app/api/subscribe/route.ts`
- `src/app/api/unsubscribe/route.ts`
- `src/lib/community.ts`
- `scripts/export-community.mjs`
