import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";
import { requireAdmin } from "@/lib/supabase-server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin(request);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const supabase = getSupabaseServerClient();

    const { id } = await params;
    const body = await request.json();

    const allowedFields = [
      "name", "slug", "description", "price", "compare_price",
      "stock", "unit", "tipo", "category_id", "featured", "active", "ai_tags",
    ];

    const updates: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) updates[field] = body[field];
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No hay campos para actualizar" }, { status: 400 });
    }

    if (updates.price !== undefined) updates.price = Math.round(updates.price as number);
    if (updates.compare_price !== undefined) updates.compare_price = Math.round(updates.compare_price as number);
    if (updates.stock !== undefined) updates.stock = Math.max(0, Math.round(updates.stock as number));

    const { data, error } = await supabase
      .from("products")
      .update(updates)
      .eq("id", id)
      .select("*, category:category_id(id, name, slug)")
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "Ya existe un producto con ese slug" }, { status: 409 });
      }
      return NextResponse.json({ error: "Error al actualizar producto" }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Product update error:", error);
    return NextResponse.json({ error: "Error al actualizar producto" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin(request);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const supabase = getSupabaseServerClient();

    const { id } = await params;

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: "Error al eliminar producto" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Product delete error:", error);
    return NextResponse.json({ error: "Error al eliminar producto" }, { status: 500 });
  }
}
