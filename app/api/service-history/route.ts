import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";
import { createSessionClient } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  try {
    const sessionClient = createSessionClient(request);
    const { data: { user }, error: authError } = await sessionClient.auth.getUser();
    const supabase = getSupabaseServerClient();

    if (authError || !user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { data: client } = await supabase
      .from("clients")
      .select("id")
      .eq("auth_user_id", user.id)
      .single();

    if (!client) {
      return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") ?? "20", 10) || 20, 1), 100);
    const offset = Math.max(parseInt(searchParams.get("offset") ?? "0", 10) || 0, 0);

    const { data, error } = await supabase
      .from("service_history")
      .select("*, dog:dogs(name, breed, size)")
      .eq("client_id", client.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Service history fetch error:", error);
      return NextResponse.json({ error: "Error al cargar historial" }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Service history API error:", error);
    return NextResponse.json({ error: "Error al cargar historial" }, { status: 500 });
  }
}
