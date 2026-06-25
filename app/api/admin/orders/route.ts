import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";
import { requireAdmin } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const supabase = getSupabaseServerClient();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const page = Math.max(parseInt(searchParams.get("page") ?? "1", 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") ?? "20", 10) || 20, 1), 100);
    const offset = (page - 1) * limit;

    let countQuery = supabase.from("orders").select("*", { count: "exact", head: true });
    let dataQuery = supabase
      .from("orders")
      .select("*, items:order_items(*), client:client_id(id, name, phone)")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (status && status !== "all") {
      countQuery = countQuery.eq("status", status);
      dataQuery = dataQuery.eq("status", status);
    }

    const { data, error, count } = await dataQuery;
    const { count: total } = await countQuery;

    if (error) {
      return NextResponse.json({ error: "Error al cargar pedidos" }, { status: 500 });
    }

    return NextResponse.json({
      data: data ?? [],
      pagination: {
        page,
        limit,
        total: total ?? count ?? 0,
        pages: Math.ceil((total ?? count ?? 0) / limit),
      },
    });
  } catch (error) {
    console.error("Admin orders error:", error);
    return NextResponse.json({ error: "Error al cargar pedidos" }, { status: 500 });
  }
}
