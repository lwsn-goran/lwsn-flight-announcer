-- Base schema
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text default '',
  phone text,
  category text check (category in ('UL','PPL','BUSINESS','GUEST','DRONE','PARACHUTE','GLIDER')),
  is_admin boolean default false,
  created_at timestamptz default now()
);
create table if not exists public.flights (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete set null,
  aircraft_registration text not null,
  aircraft_type text,
  purpose text,
  status text check (status in ('PLANNED','AIRBORNE','LANDED','DIVERTED','CANCELLED','OVERDUE')) default 'PLANNED',
  created_at timestamptz default now()
);
create table if not exists public.legs (
  id uuid primary key default gen_random_uuid(),
  flight_id uuid references public.flights(id) on delete cascade,
  op_type text check (op_type in ('ARRIVAL','DEPARTURE')) not null,
  origin text,
  destination text,
  etd text,
  eta text,
  atd text,
  ata text,
  status text check (status in ('PLANNED','AIRBORNE','COMPLETED','CANCELLED','DIVERTED','OVERDUE')) default 'PLANNED'
);
create table if not exists public.runway_in_use (
  id uuid primary key default gen_random_uuid(),
  runway text check (runway in ('30','12')) not null,
  active boolean default true,
  created_at timestamptz default now()
);
create table if not exists public.notams (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  active boolean default true,
  created_at timestamptz default now()
);
create table if not exists public.special_announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  active boolean default true,
  expires_at timestamptz null,
  created_at timestamptz default now()
);

-- Public dashboard view (no PII)
create or replace view public.flights_public_view as
select f.id, f.created_at, f.status, f.aircraft_registration,
  (select string_agg(l.op_type || ': ' || coalesce(l.origin,'') || ' → ' || coalesce(l.destination,'') || ' (' || coalesce(l.etd,l.eta,'') || ')', ' | ')
   from public.legs l where l.flight_id = f.id) as summary
from public.flights f
where f.status != 'CANCELLED';

-- RLS
alter table public.profiles enable row level security;
alter table public.flights enable row level security;
alter table public.legs enable row level security;
alter table public.notams enable row level security;
alter table public.runway_in_use enable row level security;
alter table public.special_announcements enable row level security;

-- Profiles
create policy if not exists "own-profile" on public.profiles for select using (auth.uid() = id);
create policy if not exists "admin-all-profiles" on public.profiles for all using (exists(select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

-- Flights
create policy if not exists "read-own-flights" on public.flights for select using (profile_id = auth.uid());
create policy if not exists "insert-own-flights" on public.flights for insert with check (profile_id = auth.uid());
create policy if not exists "admin-all-flights" on public.flights for all using (exists(select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

-- Legs
create policy if not exists "read-own-legs" on public.legs for select using (exists(select 1 from public.flights f where f.id = flight_id and f.profile_id = auth.uid()));
create policy if not exists "insert-own-legs" on public.legs for insert with check (exists(select 1 from public.flights f where f.id = flight_id and f.profile_id = auth.uid()));
create policy if not exists "admin-all-legs" on public.legs for all using (exists(select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

-- NOTAMs (read all, write admin)
create policy if not exists "read-notams" on public.notams for select using (true);
create policy if not exists "write-notams-admin" on public.notams for all using (exists(select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

-- Runway (read all, write admin)
create policy if not exists "read-runway" on public.runway_in_use for select using (true);
create policy if not exists "write-runway-admin" on public.runway_in_use for all using (exists(select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

-- Specials (read all, write admin)
create policy if not exists "read-specials" on public.special_announcements for select using (true);
create policy if not exists "write-specials-admin" on public.special_announcements for all using (exists(select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));
