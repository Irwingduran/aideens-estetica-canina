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
