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
