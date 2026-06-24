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
