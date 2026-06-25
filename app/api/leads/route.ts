import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";
import { rateLimit, getRateLimitKey } from "@/lib/rate-limit";

interface LeadRequestBody {
  dog_name: string;
  whatsapp: string;
  quote_data: Record<string, unknown>;
  source?: string;
}

export async function POST(request: NextRequest) {
  const rl = rateLimit(`lead:${getRateLimitKey(request)}`, 10, 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Demasiadas solicitudes. Intenta de nuevo en un minuto." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
    );
  }

  try {
    const body = (await request.json()) as LeadRequestBody;
    const { dog_name, whatsapp, quote_data, source = "cotizador_web" } = body;

    // Validate required fields
    if (!dog_name || dog_name.trim().length < 2) {
      return NextResponse.json(
        { error: "El nombre del perro debe tener al menos 2 caracteres" },
        { status: 400 }
      );
    }

    const digitsOnly = whatsapp.replace(/\D/g, "");
    if (!whatsapp || digitsOnly.length < 10) {
      return NextResponse.json(
        { error: "El número de WhatsApp debe tener al menos 10 dígitos" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServerClient();

    const totalMxn =
      quote_data && typeof quote_data === "object" && "total" in quote_data
        ? Number(quote_data.total)
        : null;

    const { data, error } = await supabase
      .from("leads")
      .insert({
        dog_name: dog_name.trim(),
        whatsapp: whatsapp.trim(),
        quote_json: quote_data,
        total_mxn: totalMxn,
        source,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json(
        { error: "Error al guardar" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, id: data.id }, { status: 201 });
  } catch (error) {
    console.error("Leads API error:", error);
    return NextResponse.json(
      { error: "Error al guardar" },
      { status: 500 }
    );
  }
}
