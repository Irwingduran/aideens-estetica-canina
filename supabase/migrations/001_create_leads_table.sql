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
