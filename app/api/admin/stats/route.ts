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

    const { data: stats, error: statsError } = await supabase
      .from("admin_dashboard_stats")
      .select("*")
      .single();

    const { data: recentOrders } = await supabase
      .from("orders")
      .select("*, items:order_items(*), client:client_id(id, name, phone)")
      .order("created_at", { ascending: false })
      .limit(10);

    const { data: recentLeads } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);

    if (statsError) {
      return NextResponse.json({ error: "Error al cargar estadísticas" }, { status: 500 });
    }

    return NextResponse.json({
      stats: stats ?? {
        total_clientes: 0,
        total_ordenes: 0,
        ordenes_pendientes: 0,
        ordenes_completadas: 0,
        ingresos_totales: 0,
        total_perros: 0,
        servicios_realizados: 0,
        leads_pendientes: 0,
        productos_agotados: 0,
      },
      recentOrders: recentOrders ?? [],
      recentLeads: recentLeads ?? [],
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json({ error: "Error al cargar dashboard" }, { status: 500 });
  }
}
