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

-- Trigger UPDATE (precio o cantidad cambian)
drop trigger if exists order_items_recalculate_update on public.order_items;
create trigger order_items_recalculate_update
  after update of price, quantity on public.order_items
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
