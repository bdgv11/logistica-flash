-- Logística Flash — Supabase schema
-- Run this once in the Supabase SQL Editor (Project > SQL Editor > New query) for a fresh project.
-- Safe to re-run: every statement is idempotent (IF NOT EXISTS / OR REPLACE / DROP ... IF EXISTS).

create extension if not exists pgcrypto;

-- ── messengers ──────────────────────────────────────────────────────────────
create table if not exists public.messengers (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  phone      text not null,
  zones      text[] not null default '{}',
  created_at timestamptz not null default now()
);

-- ── clients ──────────────────────────────────────────────────────────────────
create table if not exists public.clients (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  phone      text not null,
  address    text not null default '',
  zone       text not null default '',
  created_at timestamptz not null default now()
);

-- ── packages ─────────────────────────────────────────────────────────────────
create table if not exists public.packages (
  id            uuid primary key default gen_random_uuid(),
  tracking      text not null,
  weight        numeric(8,2) not null,
  cost          numeric(10,2) not null,
  client_id     uuid references public.clients(id) on delete set null,
  arrived       boolean not null default false,
  assigned_date date,
  created_at    timestamptz not null default now()
);

create index if not exists packages_client_id_idx on public.packages (client_id);
create index if not exists packages_assigned_date_idx on public.packages (assigned_date);

-- When a client is deleted, its packages fall back to "sin identificar" instead
-- of silently keeping a stale "assigned today" date with no client attached.
create or replace function public.clear_assigned_date_on_client_delete()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.packages set assigned_date = null where client_id = old.id;
  return old;
end;
$$;

drop trigger if exists trg_clear_assigned_date_on_client_delete on public.clients;
create trigger trg_clear_assigned_date_on_client_delete
before delete on public.clients
for each row execute function public.clear_assigned_date_on_client_delete();

-- ── Row Level Security ───────────────────────────────────────────────────────
-- Only the 2 admins (created as Supabase Auth users) sign in, and every signed-in
-- user shares the exact same data — there's no per-row ownership in this app, so
-- policies simply require "you are logged in" for every operation.

alter table public.messengers enable row level security;
alter table public.clients    enable row level security;
alter table public.packages   enable row level security;

drop policy if exists "authenticated read messengers"   on public.messengers;
drop policy if exists "authenticated write messengers"  on public.messengers;
drop policy if exists "authenticated update messengers" on public.messengers;
drop policy if exists "authenticated delete messengers" on public.messengers;
create policy "authenticated read messengers"   on public.messengers for select to authenticated using (true);
create policy "authenticated write messengers"  on public.messengers for insert to authenticated with check (true);
create policy "authenticated update messengers" on public.messengers for update to authenticated using (true) with check (true);
create policy "authenticated delete messengers" on public.messengers for delete to authenticated using (true);

drop policy if exists "authenticated read clients"   on public.clients;
drop policy if exists "authenticated write clients"  on public.clients;
drop policy if exists "authenticated update clients" on public.clients;
drop policy if exists "authenticated delete clients" on public.clients;
create policy "authenticated read clients"   on public.clients for select to authenticated using (true);
create policy "authenticated write clients"  on public.clients for insert to authenticated with check (true);
create policy "authenticated update clients" on public.clients for update to authenticated using (true) with check (true);
create policy "authenticated delete clients" on public.clients for delete to authenticated using (true);

drop policy if exists "authenticated read packages"   on public.packages;
drop policy if exists "authenticated write packages"  on public.packages;
drop policy if exists "authenticated update packages" on public.packages;
drop policy if exists "authenticated delete packages" on public.packages;
create policy "authenticated read packages"   on public.packages for select to authenticated using (true);
create policy "authenticated write packages"  on public.packages for insert to authenticated with check (true);
create policy "authenticated update packages" on public.packages for update to authenticated using (true) with check (true);
create policy "authenticated delete packages" on public.packages for delete to authenticated using (true);

-- ── Optional: sample data ────────────────────────────────────────────────────
-- Uncomment to preload the same example data the design prototype shipped with.
-- Safe to run once on an empty database only (it doesn't check for existing rows).
--
-- insert into public.messengers (name, phone, zones) values
--   ('Mensajero 1', '8880-1111', array['Heredia','Alajuela']),
--   ('Mensajero 2', '8880-2222', array['San José']),
--   ('Mensajero 3', '8880-3333', array['Cartago']);
--
-- insert into public.clients (name, phone, address, zone) values
--   ('María Fernández Solís', '8888-1234', 'https://waze.com/ul/hd12345', 'Heredia'),
--   ('Carlos Ramírez Vargas', '8712-4455', 'https://waze.com/ul/al56789', 'Alajuela'),
--   ('Ana Sofía Chaves',      '8399-2210', 'https://maps.app.goo.gl/sanjose01', 'San José');
