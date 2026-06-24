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
