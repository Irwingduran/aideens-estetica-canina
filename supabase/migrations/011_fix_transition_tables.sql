-- ============================================================
-- 011_fix_transition_tables.sql
--
-- Problema en 010: recalculate_order_totals_batch() referencia
-- inserted_rows Y deleted_rows, pero cada trigger solo declara
-- una de ellas. En Postgres, referenciar una transition table
-- no declarada en el trigger tira error en runtime.
--
-- Restricción de Postgres: no se puede declarar NEW TABLE + OLD TABLE
-- en un trigger que cubra INSERT + DELETE a la vez. Solo UPDATE
-- puede declarar ambas simultáneamente.
--
-- Solución: tres funciones especializadas, una por operación,
-- cada una solo referencia las transition tables que existen
-- en ese contexto. El recálculo siempre opera sobre los
-- order_ids relevantes sin ambigüedad.
-- ============================================================

-- Eliminar triggers y función genérica defectuosa de migration 010
drop trigger if exists order_items_recalculate_insert on public.order_items;
drop trigger if exists order_items_recalculate_delete on public.order_items;
drop trigger if exists order_items_recalculate_update on public.order_items;
drop function if exists public.recalculate_order_totals_batch();

-- ============================================================
-- Función auxiliar: el recálculo real
-- Recibe un array de order_ids afectados y actualiza sus totales.
-- Es llamada por las tres funciones de trigger específicas.
-- security definer porque necesita leer order_items sin RLS.
-- ============================================================
create or replace function public.recalculate_orders(p_order_ids uuid[])
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
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
    where oi.order_id = any(p_order_ids)
    group by oi.order_id
  ) agg
  where o.id = agg.order_id;
end;
$$;

-- ============================================================
-- Trigger 1: INSERT
-- Solo tiene NEW TABLE (inserted_rows). No referenciar OLD TABLE.
-- ============================================================
create or replace function public.recalculate_on_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_ids uuid[];
begin
  select array_agg(distinct order_id)
    into v_order_ids
    from inserted_rows;        -- transition table declarada en el trigger

  if v_order_ids is not null then
    perform public.recalculate_orders(v_order_ids);
  end if;

  return null;
end;
$$;

drop trigger if exists order_items_after_insert on public.order_items;
create trigger order_items_after_insert
  after insert on public.order_items
  referencing new table as inserted_rows   -- SOLO new table
  for each statement
  execute function public.recalculate_on_insert();

-- ============================================================
-- Trigger 2: DELETE
-- Solo tiene OLD TABLE (deleted_rows). No referenciar NEW TABLE.
-- ============================================================
create or replace function public.recalculate_on_delete()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_ids uuid[];
begin
  select array_agg(distinct order_id)
    into v_order_ids
    from deleted_rows;         -- transition table declarada en el trigger

  if v_order_ids is not null then
    perform public.recalculate_orders(v_order_ids);
  end if;

  return null;
end;
$$;

drop trigger if exists order_items_after_delete on public.order_items;
create trigger order_items_after_delete
  after delete on public.order_items
  referencing old table as deleted_rows    -- SOLO old table
  for each statement
  execute function public.recalculate_on_delete();

-- ============================================================
-- Trigger 3: UPDATE
-- UPDATE sí puede declarar ambas (NEW TABLE + OLD TABLE).
-- Solo se dispara si cambian price o quantity — las columnas
-- que afectan los totales.
-- ============================================================
create or replace function public.recalculate_on_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_ids uuid[];
begin
  -- Combinar order_ids de filas nuevas y anteriores
  -- (por si el order_id mismo cambia, caso raro pero cubierto)
  select array_agg(distinct order_id)
    into v_order_ids
    from (
      select order_id from inserted_rows   -- new table
      union
      select order_id from deleted_rows    -- old table
    ) combined;

  if v_order_ids is not null then
    perform public.recalculate_orders(v_order_ids);
  end if;

  return null;
end;
$$;

drop trigger if exists order_items_after_update on public.order_items;
create trigger order_items_after_update
  after update of price, quantity on public.order_items
  referencing new table as inserted_rows   -- ambas válidas en UPDATE
            old table as deleted_rows
  for each statement
  execute function public.recalculate_on_update();
