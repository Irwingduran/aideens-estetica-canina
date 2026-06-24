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

    const { data, error } = await supabase
      .from("clients")
      .select("*, dogs(*)")
      .eq("auth_user_id", user.id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Client me error:", error);
    return NextResponse.json({ error: "Error al cargar perfil" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const sessionClient = createSessionClient(request);
    const { data: { user }, error: authError } = await sessionClient.auth.getUser();
    const supabase = getSupabaseServerClient();

    if (authError || !user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const body = await request.json();
    const allowedFields = ["name", "phone", "email", "avatar_url"];
    const updates: Record<string, unknown> = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) updates[field] = body[field];
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No hay campos para actualizar" }, { status: 400 });
    }

    updates.last_seen = new Date().toISOString();
    const { data, error } = await supabase
      .from("clients")
      .update(updates)
      .eq("auth_user_id", user.id)
      .select()
      .single();

    if (error) {
      console.error("Client update error:", error);
      return NextResponse.json({ error: "Error al actualizar perfil" }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Client update error:", error);
    return NextResponse.json({ error: "Error al actualizar perfil" }, { status: 500 });
  }
}
