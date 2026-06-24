import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = getSupabaseServerClient();

    const { data, error } = await supabase
      .from("orders")
      .select("*, items:order_items(*), dog:dogs(id, name, breed)")
      .eq("id", id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Orden no encontrada" }, { status: 404 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Order detail error:", error);
    return NextResponse.json({ error: "Error al cargar orden" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const allowedFields = ["status", "notes", "dog_id"];
    const updates: Record<string, unknown> = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) updates[field] = body[field];
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No hay campos para actualizar" }, { status: 400 });
    }

    if (updates.status === "entregado") {
      const supabase = getSupabaseServerClient();
      await supabase.rpc("decrement_stock_for_order", { p_order_id: id });
    }

    updates.updated_at = new Date().toISOString();
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("orders")
      .update(updates)
      .eq("id", id)
      .select("*, items:order_items(*)")
      .single();

    if (error) {
      console.error("Order update error:", error);
      return NextResponse.json({ error: "Error al actualizar orden" }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Order update error:", error);
    return NextResponse.json({ error: "Error al actualizar orden" }, { status: 500 });
  }
}
