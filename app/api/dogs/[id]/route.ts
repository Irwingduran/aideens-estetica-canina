import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";
import { createSessionClient } from "@/lib/supabase-server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = getSupabaseServerClient();

    const { data, error } = await supabase
      .from("dogs")
      .select("*, service_history(*, order_by:created_at desc limit 5)")
      .eq("id", id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Perro no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Dog detail error:", error);
    return NextResponse.json({ error: "Error al cargar perro" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sessionClient = createSessionClient(request);
    const { data: { user }, error: authError } = await sessionClient.auth.getUser();
    const supabase = getSupabaseServerClient();

    if (authError || !user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const body = await request.json();
    const allowedFields = ["name", "breed", "size", "birth_date", "notes", "avatar_url"];
    const updates: Record<string, unknown> = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) updates[field] = body[field];
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No hay campos para actualizar" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("dogs")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Dog update error:", error);
      return NextResponse.json({ error: "Error al actualizar perro" }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Dog update error:", error);
    return NextResponse.json({ error: "Error al actualizar perro" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sessionClient = createSessionClient(request);
    const { data: { user }, error: authError } = await sessionClient.auth.getUser();
    const supabase = getSupabaseServerClient();

    if (authError || !user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { error } = await supabase
      .from("dogs")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Dog delete error:", error);
      return NextResponse.json({ error: "Error al eliminar perro" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Dog delete error:", error);
    return NextResponse.json({ error: "Error al eliminar perro" }, { status: 500 });
  }
}
