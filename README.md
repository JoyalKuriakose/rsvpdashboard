# RSVP Dashboard — Jikku & Lena

A private dashboard to watch RSVPs come in live, search them, and export everything to Excel. Connects to the **same Supabase project** as your wedding invitation site — no new database needed.

## What it does

- Live stat cards: Total Responses, Attending, Declined, Guests Coming — these update **instantly** when a new guest submits, no refresh needed.
- A searchable table of every response (name, status, guest count, message, submitted time).
- **Download Excel** button — exports everything currently loaded into a `.xlsx` file.
- No login — open the link and you're in.

## One-time setup

### 1. Add dashboard access to your Supabase project

Go to your Supabase project (the same one your invitation site already uses) → **SQL Editor → New query**, paste in the contents of `supabase_dashboard_setup.sql`, and click **Run**.

This lets the dashboard read every response and get live updates, without touching your existing guest-facing RSVP setup (guests still can only submit, never read, through the main invitation site).

### 2. Environment variables

Copy `.env.example` to `.env.local` and fill in the same `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` values you used for the invitation site (Supabase → Project Settings → API).

### 3. Run it locally to check

```
npm install
npm run dev
```

Open the local URL it gives you — you should see your RSVP table (empty until guests start responding, or already full if they have).

## Deploying (as its own Vercel project)

1. Push this folder to its own GitHub repo (separate from the invitation site — keeps the two cleanly apart).
2. Vercel → **New Project** → import that repo. Vercel auto-detects it as a Vite app — no config changes needed.
3. Before deploying, expand **Environment Variables** and add the same two values from step 3 above.
4. Deploy.
5. Bookmark the URL it gives you — that's your private dashboard. Share it with no one but yourself (or whoever else is helping plan).

## Notes

- There's no login, so treat the URL itself as the access control — don't post it publicly or link it from the invitation site. Anyone with the link can *view* every guest's name/RSVP/message; they cannot edit or delete anything (that's still locked down at the database level).
- The table only shows what's currently loaded when the page opened, *plus* anything new that arrives while it's open live. If you've had it open a long time, refresh once in a while just to be safe — though new entries do appear live automatically.
- "Guests Coming" only counts guests from RSVPs marked **Attending** — declined responses always count as 0, enforced by the database itself (not just this dashboard).
