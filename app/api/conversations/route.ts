import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";
import { rateLimit, getRateLimitKey } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const rl = rateLimit(`conv:${getRateLimitKey(request)}`, 20, 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Demasiadas solicitudes. Intenta de nuevo en un minuto." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
    );
  }

  try {
    const body = await request.json();
    const { session_id, channel, messages, metadata } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "messages es requerido" }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("ai_conversations")
      .insert({
        session_id: session_id ?? crypto.randomUUID(),
        channel: channel ?? "web",
        messages,
        metadata: metadata ?? {},
      })
      .select("id")
      .single();

    if (error) {
      return NextResponse.json({ error: "Error al guardar conversación" }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error("Conversation save error:", error);
    return NextResponse.json({ error: "Error al guardar conversación" }, { status: 500 });
  }
}
