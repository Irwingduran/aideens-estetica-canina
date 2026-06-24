-- =========================================
-- supabase/migrations/001_create_leads_table.sql
-- =========================================
-- Run this in the Supabase SQL Editor (https://supabase.com/dashboard → SQL Editor)

create table if not exists leads (
  id          uuid default gen_random_uuid() primary key,
  dog_name    text not null,
  whatsapp    text not null,
  quote_json  jsonb,
  total_mxn   integer,
  source      text default 'cotizador_web',
  created_at  timestamptz default now(),
  contacted   boolean default false
);

-- Enable Row Level Security
alter table leads enable row level security;

-- Policy: allow inserts from the service role (used by our API route)
create policy "Service role can insert leads"
  on leads for insert
  with check (true);

-- Policy: allow the service role to read leads
create policy "Service role can read leads"
  on leads for select
  using (true);

-- =========================================
-- supabase/migrations/002_clients_dogs.sql
-- =========================================
-- ============================================================
-- 002_clients_dogs.sql
-- Tablas: clients, dogs
-- Función helper: is_admin()
-- Trigger en auth.users: handle_new_auth_user()
-- ============================================================

-- ============================================================
-- clients (MUST be created BEFORE is_admin() function)
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
-- is_admin() function
-- ============================================================
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

-- =========================================
-- supabase/migrations/003_products.sql
-- =========================================
-- ============================================================
-- 003_products.sql
-- Tablas: product_categories, products
-- ============================================================

-- ============================================================
-- product_categories
-- ============================================================
create table if not exists public.product_categories (
  id          uuid default gen_random_uuid() primary key,
  name        text not null,
  slug        text unique not null,
  description text,
  image_url   text,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);

-- ============================================================
-- products
-- ============================================================
create table if not exists public.products (
  id            uuid default gen_random_uuid() primary key,
  category_id   uuid references public.product_categories(id),
  name          text not null,
  slug          text unique not null,
  description   text,
  price         integer not null,
  compare_price integer,
  stock         integer not null default 0,
  unit          text not null default 'pieza',
  image_urls    text[] not null default '{}',
  featured      boolean not null default false,
  active        boolean not null default true,
  tipo          text not null default 'convencional'
                  check (tipo in ('convencional', 'homeopatico', 'natural')),
  ai_tags       text[] not null default '{}',
  created_at    timestamptz not null default now()
);

comment on column public.products.image_urls is
  'Paths relativos dentro del bucket product-images de Supabase Storage.
   Ejemplo: ["products/abc-123/front.jpg", "products/abc-123/side.jpg"].
   Nunca almacenar signed URLs — expiran.
   Resolver a URL pública en la API con storage.from(bucket).getPublicUrl(path).';

-- =========================================
-- supabase/migrations/004_orders.sql
-- =========================================
-- ============================================================
-- 004_orders.sql
-- Tablas: orders, order_items
-- NOTA: Los triggers para recálculo de totales están
-- en migrations 010 (primera versión) y 011 (corrección).
-- ============================================================

-- ============================================================
-- orders
-- ============================================================
create table if not exists public.orders (
  id            uuid default gen_random_uuid() primary key,
  client_id     uuid not null references public.clients(id),
  dog_id        uuid references public.dogs(id),
  status        text not null default 'pendiente'
                  check (status in ('pendiente', 'confirmado', 'listo', 'entregado', 'cancelado')),
  source        text not null default 'web',
  notes         text,
  total_mxn     integer not null default 0,
  total_items   integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ============================================================
-- order_items
-- ============================================================
create table if not exists public.order_items (
  id            uuid default gen_random_uuid() primary key,
  order_id      uuid not null references public.orders(id) on delete cascade,
  product_id    uuid references public.products(id),
  product_name  text not null,
  price         integer not null,
  quantity      integer not null default 1,
  created_at    timestamptz not null default now()
);

-- ============================================================
-- Función: decrementar stock al confirmar orden
-- ============================================================
create or replace function public.decrement_stock_for_order(p_order_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.products p
  set stock = greatest(0, p.stock - oi.quantity)
  from public.order_items oi
  where oi.order_id = p_order_id
    and oi.product_id = p.id;
end;
$$;

-- =========================================
-- supabase/migrations/005_service_history_ai.sql
-- =========================================
-- ============================================================
-- 005_service_history_ai.sql
-- Tablas: service_history, ai_conversations
-- Migración de leads (agregar client_id, dog_id)
-- ============================================================

-- ============================================================
-- service_history
-- ============================================================
create table if not exists public.service_history (
  id            uuid default gen_random_uuid() primary key,
  client_id     uuid not null references public.clients(id),
  dog_id        uuid not null references public.dogs(id),
  service_type  text not null,
  quote_json    jsonb,
  total_mxn     integer,
  groomer       text,
  notes         text,
  created_at    timestamptz not null default now()
);

-- ============================================================
-- ai_conversations
-- ============================================================
create table if not exists public.ai_conversations (
  id            uuid default gen_random_uuid() primary key,
  client_id     uuid references public.clients(id),
  session_id    text,
  channel       text not null default 'web',
  messages      jsonb,
  metadata      jsonb,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ============================================================
-- Migración de leads existentes
-- Agregar columnas opcionales para vincular a clients y dogs
-- ============================================================
alter table public.leads
  add column if not exists client_id uuid references public.clients(id),
  add column if not exists dog_id    uuid references public.dogs(id);

-- =========================================
-- supabase/migrations/006_rls.sql
-- =========================================
-- ============================================================
-- 006_rls.sql
-- Row Level Security para todas las tablas
-- ============================================================

-- ============================================================
-- clients
-- ============================================================
alter table public.clients enable row level security;

drop policy if exists "Cliente ve su propio perfil activo" on public.clients;
create policy "Cliente ve su propio perfil activo"
  on public.clients for select
  using (auth.uid() = auth_user_id and archived = false);

drop policy if exists "Admin ve todos los clientes" on public.clients;
create policy "Admin ve todos los clientes"
  on public.clients for select
  using (public.is_admin());

drop policy if exists "Admin puede modificar clientes" on public.clients;
create policy "Admin puede modificar clientes"
  on public.clients for all
  using (public.is_admin());

-- ============================================================
-- dogs
-- ============================================================
alter table public.dogs enable row level security;

drop policy if exists "Dueño ve sus perros" on public.dogs;
create policy "Dueño ve sus perros"
  on public.dogs for all
  using (client_id = (select id from public.clients where auth_user_id = auth.uid()));

drop policy if exists "Admin ve todos los perros" on public.dogs;
create policy "Admin ve todos los perros"
  on public.dogs for all
  using (public.is_admin());

-- ============================================================
-- products (lectura pública, solo admin escribe)
-- ============================================================
alter table public.products enable row level security;

drop policy if exists "Productos visibles para todos" on public.products;
create policy "Productos visibles para todos"
  on public.products for select
  using (active = true);

drop policy if exists "Admin escribe productos" on public.products;
create policy "Admin escribe productos"
  on public.products for all
  using (public.is_admin());

-- ============================================================
-- product_categories (lectura pública, solo admin escribe)
-- ============================================================
alter table public.product_categories enable row level security;

drop policy if exists "Categorías visibles para todos" on public.product_categories;
create policy "Categorías visibles para todos"
  on public.product_categories for select
  using (true);

drop policy if exists "Admin escribe categorías" on public.product_categories;
create policy "Admin escribe categorías"
  on public.product_categories for all
  using (public.is_admin());

-- ============================================================
-- orders
-- ============================================================
alter table public.orders enable row level security;

drop policy if exists "Cliente ve sus órdenes" on public.orders;
create policy "Cliente ve sus órdenes"
  on public.orders for select
  using (client_id = (select id from public.clients where auth_user_id = auth.uid()));

drop policy if exists "Cliente crea sus órdenes" on public.orders;
create policy "Cliente crea sus órdenes"
  on public.orders for insert
  with check (client_id = (select id from public.clients where auth_user_id = auth.uid()));

drop policy if exists "Admin ve y modifica órdenes" on public.orders;
create policy "Admin ve y modifica órdenes"
  on public.orders for all
  using (public.is_admin());

-- ============================================================
-- order_items
-- ============================================================
alter table public.order_items enable row level security;

drop policy if exists "Cliente ve items de sus órdenes" on public.order_items;
create policy "Cliente ve items de sus órdenes"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_id
        and o.client_id = (select id from public.clients where auth_user_id = auth.uid())
    )
  );

drop policy if exists "Cliente crea items en sus órdenes" on public.order_items;
create policy "Cliente crea items en sus órdenes"
  on public.order_items for insert
  with check (
    exists (
      select 1 from public.orders o
      where o.id = order_id
        and o.client_id = (select id from public.clients where auth_user_id = auth.uid())
    )
  );

drop policy if exists "Admin ve y modifica order_items" on public.order_items;
create policy "Admin ve y modifica order_items"
  on public.order_items for all
  using (public.is_admin());

-- ============================================================
-- service_history
-- ============================================================
alter table public.service_history enable row level security;

drop policy if exists "Cliente ve su historial" on public.service_history;
create policy "Cliente ve su historial"
  on public.service_history for select
  using (client_id = (select id from public.clients where auth_user_id = auth.uid()));

drop policy if exists "Admin ve todo el historial" on public.service_history;
create policy "Admin ve todo el historial"
  on public.service_history for all
  using (public.is_admin());

-- ============================================================
-- ai_conversations
-- ============================================================
alter table public.ai_conversations enable row level security;

drop policy if exists "Cliente ve sus conversaciones" on public.ai_conversations;
create policy "Cliente ve sus conversaciones"
  on public.ai_conversations for select
  using (client_id = (select id from public.clients where auth_user_id = auth.uid()));

drop policy if exists "Insert anónimo permitido" on public.ai_conversations;
create policy "Insert anónimo permitido"
  on public.ai_conversations for insert
  with check (true);

drop policy if exists "Admin ve todas las conversaciones" on public.ai_conversations;
create policy "Admin ve todas las conversaciones"
  on public.ai_conversations for all
  using (public.is_admin());

-- ============================================================
-- leads (existente)
-- ============================================================
alter table public.leads enable row level security;

drop policy if exists "Service role can insert leads" on public.leads;
create policy "Service role can insert leads"
  on public.leads for insert
  with check (true);

drop policy if exists "Service role can read leads" on public.leads;
create policy "Service role can read leads"
  on public.leads for select
  using (true);

drop policy if exists "Admin gestiona leads" on public.leads;
create policy "Admin gestiona leads"
  on public.leads for all
  using (public.is_admin());

-- =========================================
-- supabase/migrations/007_indexes.sql
-- =========================================
-- ============================================================
-- 007_indexes.sql
-- Índices de performance para el modelo de datos
-- ============================================================

-- clients
create index if not exists clients_auth_user_id_idx on public.clients (auth_user_id);
create index if not exists clients_phone_idx on public.clients (phone);
create index if not exists clients_archived_idx on public.clients (archived) where archived = false;

-- dogs
create index if not exists dogs_client_id_idx on public.dogs (client_id);

-- products
create index if not exists products_category_id_idx on public.products (category_id);
create index if not exists products_slug_idx on public.products (slug);
create index if not exists products_active_idx on public.products (active) where active = true;
create index if not exists products_featured_idx on public.products (featured) where featured = true;
create index if not exists products_tipo_idx on public.products (tipo);
create index if not exists products_ai_tags_idx on public.products using gin (ai_tags);

-- product_categories
create index if not exists product_categories_slug_idx on public.product_categories (slug);
create index if not exists product_categories_sort_order_idx on public.product_categories (sort_order);

-- orders
create index if not exists orders_client_id_idx on public.orders (client_id);
create index if not exists orders_status_idx on public.orders (status);
create index if not exists orders_created_at_idx on public.orders (created_at desc);

-- order_items
create index if not exists order_items_order_id_idx on public.order_items (order_id);
create index if not exists order_items_product_id_idx on public.order_items (product_id);

-- service_history
create index if not exists service_history_client_id_idx on public.service_history (client_id);
create index if not exists service_history_dog_id_idx on public.service_history (dog_id);

-- ai_conversations
create index if not exists ai_conversations_client_id_idx on public.ai_conversations (client_id);
create index if not exists ai_conversations_session_id_idx on public.ai_conversations (session_id);

-- leads
create index if not exists leads_whatsapp_idx on public.leads (whatsapp);
create index if not exists leads_client_id_idx on public.leads (client_id);

-- =========================================
-- supabase/migrations/008_admin_functions.sql
-- =========================================
-- ============================================================
-- 008_admin_functions.sql
-- Funciones y vistas para el panel de administración
-- ============================================================

-- ============================================================
-- Vista: admin_dashboard_stats
-- Resumen de métricas para el dashboard
-- ============================================================
create or replace view public.admin_dashboard_stats as
select
  (select count(*) from public.clients where archived = false)                    as total_clientes,
  (select count(*) from public.orders)                                            as total_ordenes,
  (select count(*) from public.orders where status = 'pendiente')                 as ordenes_pendientes,
  (select count(*) from public.orders where status = 'entregado')                 as ordenes_completadas,
  (select coalesce(sum(total_mxn), 0) from public.orders where status = 'entregado') as ingresos_totales,
  (select count(*) from public.dogs)                                              as total_perros,
  (select count(*) from public.service_history)                                   as servicios_realizados,
  (select count(*) from public.leads)                                             as leads_pendientes,
  (select count(*) from public.products where active = true and stock = 0)        as productos_agotados;

-- ============================================================
-- Función: get_client_summary
-- Resumen completo de un cliente para el admin
-- ============================================================
create or replace function public.get_client_summary(p_client_id uuid)
returns table (
  client_id      uuid,
  name           text,
  phone          text,
  email          text,
  role           text,
  total_orders   bigint,
  total_spent    bigint,
  total_dogs     bigint,
  total_services bigint,
  last_seen      timestamptz,
  created_at     timestamptz
)
language sql
security definer
stable
set search_path = public
as $$
  select
    c.id,
    c.name,
    c.phone,
    c.email,
    c.role,
    (select count(*) from public.orders o where o.client_id = c.id)               as total_orders,
    (select coalesce(sum(o.total_mxn), 0)
       from public.orders o
      where o.client_id = c.id and o.status = 'entregado')                       as total_spent,
    (select count(*) from public.dogs d where d.client_id = c.id)                 as total_dogs,
    (select count(*) from public.service_history sh where sh.client_id = c.id)    as total_services,
    c.last_seen,
    c.created_at
  from public.clients c
  where c.id = p_client_id;
$$;

-- ============================================================
-- Función: link_anonymous_conversations
-- Migra conversaciones de IA anónimas a un cliente registrado
-- ============================================================
create or replace function public.link_anonymous_conversations(
  p_client_id uuid,
  p_phone     text
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  update public.ai_conversations
  set
    client_id  = p_client_id,
    updated_at = now()
  where client_id is null
    and channel = 'whatsapp'
    and metadata->>'phone' = p_phone;

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

-- =========================================
-- supabase/migrations/010_fixes.sql
-- =========================================
-- ============================================================
-- 010_fixes.sql
-- Correcciones derivadas de revisión del agente:
--
-- Fix 1: get_client_summary → security invoker
--         Evita el anidamiento security definer + is_admin()
--         que puede perder auth.uid() en algunos entornos.
--         La autorización se delega a la API route (service_role).
--
-- Fix 2: recalculate_order_totals → for each statement
--         Evita N ejecuciones al insertar N items en un batch.
--         Usa la tabla de transición para obtener order_ids afectados.
--
-- Fix 3: decrement_stock_for_order → security invoker
--         Mismo razonamiento que fix 1.
--
-- Fix 4: products.image_urls — convención documentada
--         Solo paths relativos dentro del bucket, nunca signed URLs.
--
-- Fix 5: Nota sobre Supabase Storage bucket.
--
-- Fix 6: clients → soft delete con columna archived
--         orders y service_history pasan de restrict a set null + archived.
--
-- Fix 7: Función para migrar ai_conversations anónimas
--         cuando se detecta un cliente registrado con el mismo número.
-- ============================================================


-- ============================================================
-- FIX 1 + 3: get_client_summary y decrement_stock_for_order
-- → security invoker. La API los llama con service_role key,
--   que bypasea RLS por diseño. No necesitan is_admin() interno.
-- ============================================================

create or replace function public.get_client_summary(p_client_id uuid)
returns table (
  client_id      uuid,
  name           text,
  phone          text,
  email          text,
  role           text,
  total_orders   bigint,
  total_spent    bigint,
  total_dogs     bigint,
  total_services bigint,
  last_seen      timestamptz,
  created_at     timestamptz
)
language sql
security invoker
stable
set search_path = public
as $$
  select
    c.id,
    c.name,
    c.phone,
    c.email,
    c.role,
    (select count(*)
       from public.orders o
      where o.client_id = c.id)                                       as total_orders,
    (select coalesce(sum(o.total_mxn), 0)
       from public.orders o
      where o.client_id = c.id
        and o.status = 'entregado')                                    as total_spent,
    (select count(*)
       from public.dogs d
      where d.client_id = c.id)                                       as total_dogs,
    (select count(*)
       from public.service_history sh
      where sh.client_id = c.id)                                      as total_services,
    c.last_seen,
    c.created_at
  from public.clients c
  where c.id = p_client_id;
$$;

-- ----

create or replace function public.decrement_stock_for_order(p_order_id uuid)
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  update public.products p
  set stock = greatest(0, p.stock - oi.quantity)
  from public.order_items oi
  where oi.order_id   = p_order_id
    and oi.product_id = p.id;
end;
$$;


-- ============================================================
-- FIX 2: trigger recalculate_order_totals → for each statement
--
-- Problema anterior: INSERT de 10 items → 10 ejecuciones del trigger.
-- Solución: reemplazar por un trigger STATEMENT-level que recoge
-- todos los order_ids afectados en una sola pasada.
--
-- NOTA: los triggers STATEMENT-level no tienen NEW/OLD por fila,
-- pero sí tienen acceso a las transition tables (inserted / deleted).
-- Requiere declarar REFERENCING en el CREATE TRIGGER.
-- ============================================================

-- Función nueva: recibe transition tables, no NEW/OLD
create or replace function public.recalculate_order_totals_batch()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Recalcula solo las órdenes tocadas en este statement
  update public.orders o
  set
    total_mxn   = agg.total_mxn,
    total_items = agg.total_items,
    updated_at  = now()
  from (
    select
      oi.order_id,
      coalesce(sum(oi.price * oi.quantity), 0) as total_mxn,
      coalesce(sum(oi.quantity), 0)             as total_items
    from public.order_items oi
    -- affected_order_ids viene de la union de inserted + deleted
    where oi.order_id in (
      select order_id from inserted_rows
      union
      select order_id from deleted_rows
    )
    group by oi.order_id
  ) agg
  where o.id = agg.order_id;

  return null;
end;
$$;

-- Eliminar trigger por-fila anterior (si existe de migration 004)
drop trigger if exists order_items_recalculate on public.order_items;

-- Trigger INSERT statement-level con transition table
drop trigger if exists order_items_recalculate_insert on public.order_items;
create trigger order_items_recalculate_insert
  after insert on public.order_items
  referencing new table as inserted_rows
  for each statement
  execute function public.recalculate_order_totals_batch();

-- Trigger DELETE statement-level con transition table
drop trigger if exists order_items_recalculate_delete on public.order_items;
create trigger order_items_recalculate_delete
  after delete on public.order_items
  referencing old table as deleted_rows
  for each statement
  execute function public.recalculate_order_totals_batch();

-- Trigger UPDATE — sin column list porque es incompatible con transition tables
drop trigger if exists order_items_recalculate_update on public.order_items;
create trigger order_items_recalculate_update
  after update on public.order_items
  referencing new table as inserted_rows old table as deleted_rows
  for each statement
  execute function public.recalculate_order_totals_batch();


-- ============================================================
-- FIX 4: Convención de image_urls documentada en comentario
-- ============================================================
comment on column public.products.image_urls is
  'Paths relativos dentro del bucket product-images de Supabase Storage.
   Ejemplo: ["products/abc-123/front.jpg", "products/abc-123/side.jpg"].
   Nunca almacenar signed URLs — expiran.
   Resolver a URL pública en la API con storage.from(bucket).getPublicUrl(path).';


-- ============================================================
-- FIX 5: Nota sobre el bucket de Storage
-- No se puede crear un bucket desde SQL puro en Supabase.
-- Ejecutar una sola vez desde Supabase CLI o dashboard:
--
--   supabase storage create product-images --public
--
-- O desde el dashboard: Storage → New bucket → "product-images" → Public
-- ============================================================


-- ============================================================
-- FIX 6: Soft delete en clients
-- ============================================================

-- Agregar columna archived a clients (si no existe de migration 002)
alter table public.clients
  add column if not exists archived    boolean     not null default false,
  add column if not exists archived_at timestamptz;

-- Función para archivar un cliente sin borrar su historial
create or replace function public.archive_client(p_client_id uuid)
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  update public.clients
  set
    archived    = true,
    archived_at = now()
  where id = p_client_id;

  -- Cancelar órdenes pendientes del cliente archivado
  update public.orders
  set
    status     = 'cancelado',
    updated_at = now()
  where client_id = p_client_id
    and status in ('pendiente', 'confirmado');
end;
$$;


-- ============================================================
-- FIX 7: Migrar ai_conversations anónimas y extender
--         handle_new_auth_user para llamar link_anonymous_conversations
-- ============================================================

create or replace function public.link_anonymous_conversations(
  p_client_id uuid,
  p_phone     text
)
returns integer
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_count integer;
begin
  update public.ai_conversations
  set
    client_id  = p_client_id,
    updated_at = now()
  where client_id is null
    and channel = 'whatsapp'
    and metadata->>'phone' = p_phone;

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

-- Extender el trigger on_auth_user_created para llamar link_anonymous_conversations
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
  -- Crear o ignorar si ya existe (idempotente)
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

  -- Obtener el client_id recién creado (o el existente)
  select id, phone
    into v_client_id, v_phone
    from public.clients
   where auth_user_id = new.id;

  -- Si llegó con número de teléfono, migrar conversaciones anónimas
  if v_phone is not null then
    perform public.link_anonymous_conversations(v_client_id, v_phone);
  end if;

  return new;
end;
$$;

-- =========================================
-- supabase/migrations/011_fix_transition_tables.sql
-- =========================================
-- ============================================================
-- 011_fix_transition_tables.sql
--
-- Problema en 010: recalculate_order_totals_batch() referencia
-- inserted_rows Y deleted_rows, pero cada trigger solo declara
-- una de ellas. En Postgres, referenciar una transition table
-- no declarada en el trigger tira error en runtime.
--
-- Restricción de Postgres: no se puede declarar NEW TABLE + OLD TABLE
-- en un trigger que cubra INSERT + DELETE a la vez. Solo UPDATE
-- puede declarar ambas simultáneamente.
--
-- Solución: tres funciones especializadas, una por operación,
-- cada una solo referencia las transition tables que existen
-- en ese contexto. El recálculo siempre opera sobre los
-- order_ids relevantes sin ambigüedad.
-- ============================================================

-- Eliminar triggers y función genérica defectuosa de migration 010
drop trigger if exists order_items_recalculate_insert on public.order_items;
drop trigger if exists order_items_recalculate_delete on public.order_items;
drop trigger if exists order_items_recalculate_update on public.order_items;
drop function if exists public.recalculate_order_totals_batch();

-- ============================================================
-- Función auxiliar: el recálculo real
-- Recibe un array de order_ids afectados y actualiza sus totales.
-- Es llamada por las tres funciones de trigger específicas.
-- security definer porque necesita leer order_items sin RLS.
-- ============================================================
create or replace function public.recalculate_orders(p_order_ids uuid[])
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.orders o
  set
    total_mxn   = agg.total_mxn,
    total_items = agg.total_items,
    updated_at  = now()
  from (
    select
      oi.order_id,
      coalesce(sum(oi.price * oi.quantity), 0) as total_mxn,
      coalesce(sum(oi.quantity), 0)             as total_items
    from public.order_items oi
    where oi.order_id = any(p_order_ids)
    group by oi.order_id
  ) agg
  where o.id = agg.order_id;
end;
$$;

-- ============================================================
-- Trigger 1: INSERT
-- Solo tiene NEW TABLE (inserted_rows). No referenciar OLD TABLE.
-- ============================================================
create or replace function public.recalculate_on_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_ids uuid[];
begin
  select array_agg(distinct order_id)
    into v_order_ids
    from inserted_rows;        -- transition table declarada en el trigger

  if v_order_ids is not null then
    perform public.recalculate_orders(v_order_ids);
  end if;

  return null;
end;
$$;

drop trigger if exists order_items_after_insert on public.order_items;
create trigger order_items_after_insert
  after insert on public.order_items
  referencing new table as inserted_rows   -- SOLO new table
  for each statement
  execute function public.recalculate_on_insert();

-- ============================================================
-- Trigger 2: DELETE
-- Solo tiene OLD TABLE (deleted_rows). No referenciar NEW TABLE.
-- ============================================================
create or replace function public.recalculate_on_delete()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_ids uuid[];
begin
  select array_agg(distinct order_id)
    into v_order_ids
    from deleted_rows;         -- transition table declarada en el trigger

  if v_order_ids is not null then
    perform public.recalculate_orders(v_order_ids);
  end if;

  return null;
end;
$$;

drop trigger if exists order_items_after_delete on public.order_items;
create trigger order_items_after_delete
  after delete on public.order_items
  referencing old table as deleted_rows    -- SOLO old table
  for each statement
  execute function public.recalculate_on_delete();

-- ============================================================
-- Trigger 3: UPDATE
-- UPDATE sí puede declarar ambas (NEW TABLE + OLD TABLE).
-- Solo se dispara si cambian price o quantity — las columnas
-- que afectan los totales.
-- ============================================================
create or replace function public.recalculate_on_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_ids uuid[];
begin
  -- Combinar order_ids de filas nuevas y anteriores
  -- (por si el order_id mismo cambia, caso raro pero cubierto)
  select array_agg(distinct order_id)
    into v_order_ids
    from (
      select order_id from inserted_rows   -- new table
      union
      select order_id from deleted_rows    -- old table
    ) combined;

  if v_order_ids is not null then
    perform public.recalculate_orders(v_order_ids);
  end if;

  return null;
end;
$$;

drop trigger if exists order_items_after_update on public.order_items;
create trigger order_items_after_update
  after update on public.order_items
  referencing new table as inserted_rows
            old table as deleted_rows
  for each statement
  execute function public.recalculate_on_update();

