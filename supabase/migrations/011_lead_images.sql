-- ============================================================
-- 011_lead_images.sql
-- Almacenar imágenes de leads en la tabla leads
-- ============================================================

alter table public.leads
  add column if not exists images text[] default '{}';

comment on column public.leads.images is
  'URLs públicas de las fotos subidas por el lead en el cotizador.';

-- Nota: crear bucket "lead-images" desde el dashboard o CLI:
--   supabase storage create lead-images --public
