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
