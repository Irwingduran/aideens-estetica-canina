-- ============================================================
-- 002_clients_dogs.sql
-- Tablas: clients, dogs
-- Función helper: is_admin()
-- Trigger en auth.users: handle_new_auth_user()
-- ============================================================

-- Función helper: verifica si el usuario autenticado es admin
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.clients
    where auth_user_id = auth.uid()
      and role = 'admin'
  );
$$;

-- ============================================================
-- clients
-- ============================================================
create table if not exists public.clients (
  id            uuid default gen_random_uuid() primary key,
  auth_user_id  uuid unique references auth.users(id) on delete cascade,
  name          text not null,
  phone         text,
  email         text,
  role          text not null default 'cliente'
                  check (role in ('cliente', 'admin')),
  avatar_url    text,
  archived      boolean not null default false,
  archived_at   timestamptz,
  created_at    timestamptz not null default now(),
  last_seen     timestamptz
);

-- ============================================================
-- dogs
-- ============================================================
create table if not exists public.dogs (
  id            uuid default gen_random_uuid() primary key,
  client_id     uuid not null references public.clients(id) on delete cascade,
  name          text not null,
  breed         text,
  size          text check (size in ('chico', 'mediano', 'grande', 'xl')),
  birth_date    date,
  notes         text,
  avatar_url    text,
  created_at    timestamptz not null default now()
);

-- ============================================================
-- Trigger: crear cliente automáticamente al registrarse
-- ============================================================
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_client_id uuid;
  v_phone     text;
begin
  insert into public.clients (auth_user_id, name, phone, email)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      new.phone,
      split_part(new.email, '@', 1),
      'Usuario'
    ),
    new.phone,
    new.email
  )
  on conflict (auth_user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_auth_user();
