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
