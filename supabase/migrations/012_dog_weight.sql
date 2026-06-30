-- ============================================================
-- 012_dog_weight.sql
-- Reemplazar birth_date por weight_kg en dogs
-- ============================================================

alter table public.dogs
  add column if not exists weight_kg numeric(5,1);

comment on column public.dogs.weight_kg is 'Peso en kilogramos (ej: 12.5)';
