import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";
import { requireAdmin } from "@/lib/supabase-server";

const validStatuses = ["pendiente", "confirmado", "listo", "entregado", "cancelado"];

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

    if (!body.status || !validStatuses.includes(body.status)) {
      return NextResponse.json({ error: "Estado inválido" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("orders")
      .update({ status: body.status, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select("*, items:order_items(*), client:client_id(id, name, phone)")
      .single();

    if (error) {
      return NextResponse.json({ error: "Error al actualizar pedido" }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Order update error:", error);
    return NextResponse.json({ error: "Error al actualizar pedido" }, { status: 500 });
  }
}
