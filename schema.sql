-- 富士宮まるごと / FUJINOMIYA ONE
-- Supabase SQL Editor で実行してください。

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text,
  created_at timestamptz not null default now()
);

create table if not exists public.places (
  id text primary key,
  name text not null,
  category text not null check (category in ('food','sightseeing','shopping','stay','mobility','life','kids','government','work','safety','events','community')),
  kind text not null default 'place' check (kind in ('place','service')),
  address text,
  phone text,
  site text,
  description text,
  tags text[] not null default '{}',
  lat double precision,
  lng double precision,
  source text,
  is_published boolean not null default true,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint places_coords_pair check ((lat is null and lng is null) or (lat is not null and lng is not null)),
  constraint places_lat_range check (lat is null or (lat between -90 and 90)),
  constraint places_lng_range check (lng is null or (lng between -180 and 180))
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists places_set_updated_at on public.places;
create trigger places_set_updated_at
before update on public.places
for each row execute function public.set_updated_at();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users a
    where a.user_id = auth.uid()
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

alter table public.places enable row level security;
alter table public.admin_users enable row level security;

drop policy if exists "Public can read published places" on public.places;
create policy "Public can read published places"
on public.places for select
to anon, authenticated
using (is_published = true or public.is_admin());

drop policy if exists "Admins can insert places" on public.places;
create policy "Admins can insert places"
on public.places for insert
to authenticated
with check (public.is_admin());

drop policy if exists "Admins can update places" on public.places;
create policy "Admins can update places"
on public.places for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can delete places" on public.places;
create policy "Admins can delete places"
on public.places for delete
to authenticated
using (public.is_admin());

-- admin_users 自体はクライアントから変更不可。SQL Editorで管理します。
-- RPC is_admin() だけを管理画面から利用します。
