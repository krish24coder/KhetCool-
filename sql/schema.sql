-- ============================================================
-- KhetCool database schema — run this in Supabase SQL Editor
-- (Project → SQL Editor → New query → paste all → Run)
-- ============================================================

-- 1. Cold-storage units --------------------------------------
create table if not exists units (
  id text primary key,                 -- e.g. 'U-BHP-01'
  village text not null,
  district text not null,
  capacity_t numeric not null,         -- total tonnage capacity
  temp_c numeric not null default 4,   -- current cold-room temperature
  utilization numeric not null default 0, -- 0.0–1.0 (% of capacity used)
  crops text[] not null default '{}', -- crops this unit typically stores
  created_at timestamptz not null default now()
);

-- 2. Bookings (one row per real booking made through the app) -
create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  booking_code text not null unique,   -- e.g. 'KC4821'
  unit_id text not null references units(id),
  crop text not null,
  qty_tonnes numeric not null,
  days integer not null,
  cost_inr numeric not null,
  status text not null default 'confirmed',
  created_at timestamptz not null default now()
);

-- 3. Seed the 4 demo units -------------------------------------
insert into units (id, village, district, capacity_t, temp_c, utilization, crops) values
  ('U-SHR-01', 'Sehore Cluster A', 'Sehore, MP', 8, 4, 0.78, array['Tomato','Onion']),
  ('U-SHR-02', 'Ashta Panchayat', 'Sehore, MP', 6, 5, 0.61, array['Onion','Leafy Greens']),
  ('U-BHP-01', 'Berasia Road', 'Bhopal, MP', 10, 3, 0.85, array['Tomato','Leafy Greens']),
  ('U-VID-01', 'Vidisha Cluster', 'Vidisha, MP', 5, 5, 0.42, array['Onion'])
on conflict (id) do nothing;

-- 4. Row Level Security ----------------------------------------
-- This is a public demo app with no login, so we allow the
-- anonymous (public) key to read units and read/insert bookings.
-- Do NOT do this for an app handling sensitive/private data.

alter table units enable row level security;
alter table bookings enable row level security;

drop policy if exists "public can read units" on units;
drop policy if exists "public can read bookings" on bookings;
drop policy if exists "public can insert bookings" on bookings;

create policy "public can read units"
  on units for select
  to anon
  using (true);

create policy "public can read bookings"
  on bookings for select
  to anon
  using (true);

create policy "public can insert bookings"
  on bookings for insert
  to anon
  with check (true);

-- 5. Keep unit utilization in sync when a booking is made -------
create or replace function bump_unit_utilization()
returns trigger as $$
begin
  update units
  set utilization = least(1, utilization + (new.qty_tonnes::numeric / capacity_t))
  where id = new.unit_id;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_booking_created on bookings;
create trigger on_booking_created
  after insert on bookings
  for each row execute function bump_unit_utilization();
