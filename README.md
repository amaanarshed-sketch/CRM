# LeadLoop

LeadLoop is a simple follow-up CRM that helps small sales teams track leads, follow-ups, notes, and conversions without relying on messy spreadsheets or memory.

## Persistence

The production app uses Supabase Auth and Supabase Postgres. The only local browser storage that remains is the unauthenticated demo workspace, which is intentionally isolated from production data.

## Setup

```bash
npm install
npm run dev
```

Open `http://localhost:3000`, create a workspace, then add or import leads. If port `3000` is already in use, Next.js will print the active local URL.

## Environment variables

Copy `.env.example` to `.env.local` when needed.

```bash
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SUPPORT_EMAIL=
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4.1-mini
```

`OPENAI_API_KEY` is optional. Without it, follow-up messages use rule-based templates.

## Supabase

Run `supabase/schema.sql` in the Supabase SQL editor before using sign up/login. It creates:

- `agencies`
- `profiles`
- `staff_members`
- `leads`
- `lead_notes`

The schema also creates:

- A Supabase Auth trigger that creates a workspace, profile, and starter staff member on signup.
- Row-level security policies that scope authenticated reads/writes to the user's workspace.
- A public intake insert policy that only allows anonymous form submissions as `stage = 'New'`.
- An `updated_at` trigger for leads.

If you already created the schema before the import upgrade, run:

```sql
alter table public.leads add column if not exists company text;
alter table public.agencies add column if not exists onboarding_completed boolean not null default false;
```

## Production setup checklist

1. Create a Supabase project.
2. Run [schema.sql](</Users/amaanarshed/Downloads/Antigravity Project/CRM System/supabase/schema.sql>) in the Supabase SQL editor.
3. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to `.env.local`.
4. Restart the Next.js dev server.
5. Sign up from the app. The database trigger creates the workspace automatically.
6. Use Settings to copy the public lead form link.

## Launch smoke test

Use [LAUNCH_RUNBOOK.md](</Users/amaanarshed/Downloads/Antigravity Project/CRM System/LAUNCH_RUNBOOK.md>) for the full production launch process.

Run these checks before sharing the production URL:

```bash
npm run typecheck
npm run test
npm run build
```

Then verify these flows on the deployed app:

1. Create a new workspace with Supabase Auth.
2. Log out and log back in.
3. Add a lead manually, update stage, update follow-up date, and mark contacted.
4. Import the sample CSV from the Import page and confirm duplicate handling.
5. Confirm dashboard, Follow-ups, Stale Leads, and Weekly Report counts match the lead data.
6. Open a lead and generate a follow-up message. Confirm it is draft-only and copyable.
7. Copy the public lead form link from Settings, submit a test lead, and confirm it appears in the workspace.
8. Create a second workspace and confirm it cannot see the first workspace's data.
9. Confirm demo workspace loads without login and does not mix with real workspace data.
10. Confirm `/privacy`, `/terms`, `/contact`, `/support`, `/robots.txt`, and `/sitemap.xml` load.

## Deployment notes

- Set `NEXT_PUBLIC_APP_URL` to the production URL so metadata, sitemap, and robots output use the live domain.
- Add the production domain and local dev URL to Supabase Auth redirect URLs.
- Keep service-role keys out of Vercel client env vars. The app only needs the public anon key.
- Public intake currently uses Supabase RLS and the anon key. For heavier traffic, put intake behind a server route with CAPTCHA or provider-level rate limiting.
- The follow-up message API has an in-memory per-IP rate limit for basic abuse protection. For multi-region/high-traffic production, move rate limiting to Vercel Firewall, Upstash, or another shared store.
- Vercel Analytics is installed through `@vercel/analytics`.
- Replace the MVP Privacy/Terms text with reviewed legal copy before paid or broad public launch.

## Launch status

- Real workspace data uses Supabase Auth and Supabase Postgres.
- Browser `localStorage` is only used to remember the unauthenticated demo workspace.
- Public intake submissions insert leads into Supabase through the public intake policy.
- CSV/XLSX imports save leads into the signed-in workspace.
- New real workspaces see a short onboarding panel for workspace name, staff names, stale threshold, and follow-up timing.
