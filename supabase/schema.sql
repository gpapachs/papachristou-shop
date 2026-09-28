-- Τρέξε αυτό ΜΙΑ ΦΟΡΑ στο Supabase: SQL Editor → New query → επικόλλησε → Run.

create table if not exists menu (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

-- Το site διαβάζει/γράφει αυτόν τον πίνακα μόνο μέσω του server (service role key),
-- ποτέ απευθείας από τον browser, οπότε κλειδώνουμε τη δημόσια πρόσβαση:
alter table menu enable row level security;
