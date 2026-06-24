import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";

export async function GET() {
  try {
    const supabase = getSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

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

    const { data, error } = await supabase
      .from("dogs")
      .select("*")
      .eq("client_id", client.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Dogs fetch error:", error);
      return NextResponse.json({ error: "Error al cargar perros" }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Dogs API error:", error);
    return NextResponse.json({ error: "Error al cargar perros" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

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

    const body = await request.json();
    const { name, breed, size, birth_date, notes } = body;

    if (!name || name.trim().length < 2) {
      return NextResponse.json(
        { error: "El nombre del perro debe tener al menos 2 caracteres" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("dogs")
      .insert({
        client_id: client.id,
        name: name.trim(),
        breed: breed ?? null,
        size: size ?? null,
        birth_date: birth_date ?? null,
        notes: notes ?? null,
      })
      .select()
      .single();

    if (error) {
      console.error("Dog insert error:", error);
      return NextResponse.json({ error: "Error al guardar perro" }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error("Dog create error:", error);
    return NextResponse.json({ error: "Error al crear perro" }, { status: 500 });
  }
}
