# Candidate Recovery OS

MVP SaaS for recruitment agencies to spot candidates going cold, manage document gaps, and keep follow-ups visible.

## Persistence

The production app uses Supabase Auth and Supabase Postgres. The only local browser storage that remains is the unauthenticated demo workspace, which is intentionally isolated from production data.

## Setup

```bash
npm install
npm run dev
```

Open `http://localhost:3000`, create an agency workspace, then add or import candidates. If port `3000` is already in use, Next.js will print the active local URL.

## Environment variables

Copy `.env.example` to `.env.local` when needed.

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4.1-mini
```

`OPENAI_API_KEY` is optional. Without it, follow-up messages use rule-based templates.

## Supabase

Run `supabase/schema.sql` in the Supabase SQL editor before using sign up/login. It creates:

- `agencies`
- `profiles`
- `staff_members`
- `candidates`
- `candidate_notes`

The schema also creates:

- A Supabase Auth trigger that creates an agency, profile, and starter staff member on signup.
- Row-level security policies that scope authenticated reads/writes to the user's agency.
- A public intake insert policy that only allows anonymous form submissions as `stage = 'New'`.
- An `updated_at` trigger for candidates.

## Production setup checklist

1. Create a Supabase project.
2. Run [schema.sql](</Users/amaanarshed/Downloads/Antigravity Project/CRM System/supabase/schema.sql>) in the Supabase SQL editor.
3. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to `.env.local`.
4. Restart the Next.js dev server.
5. Sign up from the app. The database trigger creates the agency workspace automatically.
6. Use Settings to copy the public intake form link.
