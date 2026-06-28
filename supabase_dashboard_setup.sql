-- Run this once in the SAME Supabase project as your wedding invitation
-- (Supabase → SQL Editor → New query → paste → Run).
-- This adds dashboard access on top of your existing rsvps table —
-- it does not remove or change anything guests already use.

-- Let anyone with the dashboard's link read every response — there's no
-- login on the dashboard, so this is open to whoever has the URL.
-- Guests still cannot read through the main invitation site itself; this
-- policy only matters for whoever opens the dashboard app specifically.
-- (Insert-only access for guests, from your original setup, is untouched.)
create policy "Anyone can view all rsvps"
  on public.rsvps
  for select
  to anon, authenticated
  using (true);

-- Turn on live updates for this table, so the dashboard's "Live" counters
-- update instantly when a new RSVP comes in, with no page refresh needed.
alter publication supabase_realtime add table public.rsvps;
