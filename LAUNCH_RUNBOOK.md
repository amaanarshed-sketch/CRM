# LeadLoop Launch Runbook

Use this runbook for each production or beta launch.

## 1. Production Environment

- Deploy the latest `main` branch to Vercel.
- Configure environment variables:
  - `NEXT_PUBLIC_APP_URL`
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `NEXT_PUBLIC_SUPPORT_EMAIL`
  - `OPENAI_API_KEY` if OpenAI-generated messages should be enabled
  - `OPENAI_MODEL`, default `gpt-4.1-mini`
- Add the production domain and local dev URL in Supabase Auth redirect settings.
- Confirm `/privacy`, `/terms`, `/contact`, `/support`, `/robots.txt`, and `/sitemap.xml` load on the production domain.

## 2. Supabase Verification

- Run `supabase/schema.sql` in the production Supabase project.
- Run `supabase/migrations/20260510_add_lead_company.sql` only if upgrading an older database.
- Run `supabase/migrations/20260510_add_onboarding_completed.sql` only if upgrading an older database.
- Run `supabase/launch_checks.sql` and confirm:
  - RLS is enabled for `agencies`, `profiles`, `staff_members`, `leads`, and `lead_notes`.
  - Workspace-scoped read/write policies exist.
  - Public intake can only insert `New` leads from the public intake form policy.
  - Auth signup trigger and lead `updated_at` trigger exist.

## 3. Smoke QA

- Create Workspace A, complete onboarding, add a lead, update stage, update follow-up dates, and generate a draft message.
- Import the sample CSV and verify mapping, preview, duplicate handling, and import summary.
- Submit the public lead form for Workspace A and confirm the lead appears in that workspace.
- Create Workspace B and confirm it cannot see Workspace A leads, staff, reports, settings, or intake submissions.
- Confirm demo mode works without login and does not affect real workspace data.
- Confirm dashboard, Follow-ups, Stale Leads, and Reports counts match the underlying leads.

## 4. Reliability And Support

- Vercel Analytics is installed through `@vercel/analytics`.
- The follow-up message API has basic in-memory per-IP rate limiting.
- For higher traffic, add Vercel Firewall, CAPTCHA, or shared-store rate limiting to public intake and message generation.
- Configure Supabase database backups before onboarding real customers.
- Replace MVP Privacy/Terms text with reviewed legal copy before paid or broad public launch.
- Set `NEXT_PUBLIC_SUPPORT_EMAIL` to the real support inbox.

## 5. Supabase Email Template Copy

Use LeadLoop branding in Supabase Auth emails:

- Subject: `Confirm your LeadLoop workspace`
- Button text: `Open LeadLoop`
- Body: `Welcome to LeadLoop. Confirm your email to open your follow-up CRM workspace and start tracking leads, follow-ups, and notes.`
