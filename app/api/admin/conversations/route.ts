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
    const search = searchParams.get("q");
    const page = Math.max(parseInt(searchParams.get("page") ?? "1", 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") ?? "50", 10) || 50, 1), 200);
    const offset = (page - 1) * limit;

    let convQuery = supabase
      .from("ai_conversations")
      .select("id, session_id, channel, messages, metadata, client_id, created_at, updated_at")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    let countQuery = supabase
      .from("ai_conversations")
      .select("id", { count: "exact", head: true });

    if (search) {
      const filter = `metadata->>phone.ilike.%${search}%`;
      convQuery = convQuery.or(filter);
      countQuery = countQuery.or(filter);
    }

    const { data: conversations, error: convError, count } = await convQuery;
    const { count: totalCount } = await countQuery;

    if (convError) {
      return NextResponse.json({ error: "Error al cargar conversaciones" }, { status: 500 });
    }

    const { data: leads } = await supabase
      .from("leads")
      .select("id, whatsapp, dog_name, total_mxn, contacted, created_at, quote_json")
      .order("created_at", { ascending: false })
      .limit(200);

    function extractImages(
      conv: { metadata: unknown } | null,
      lead: { quote_json: unknown } | null
    ): string[] {
      const metaImages = ((conv?.metadata as { images?: string[] })?.images) ?? [];
      const quoteImages = ((lead?.quote_json as { _images?: string[] })?._images) ?? [];
      return [...new Set([...metaImages, ...quoteImages])];
    }

    type LeadRecord = { id: string; whatsapp: string | null; dog_name: string | null; total_mxn: number | null; contacted: boolean; created_at: string; quote_json: unknown };
    const leadsByPhone = new Map<string, LeadRecord>();
    for (const lead of leads ?? []) {
      const phone = lead.whatsapp?.replace(/\s+/g, "").replace(/^\+/, "");
      if (phone && !leadsByPhone.has(phone)) leadsByPhone.set(phone, lead);
    }

    const items = (conversations ?? []).map((conv) => {
      const phoneRaw = (conv.metadata as { phone?: string })?.phone ?? "";
      const phone = phoneRaw.replace(/\s+/g, "").replace(/^\+/, "");
      const lead = phone ? leadsByPhone.get(phone) : null;
      const msgArray = (conv.messages ?? []) as Array<{ role: string; content: string }>;

      return {
        id: conv.id,
        session_id: conv.session_id,
        channel: conv.channel,
        phone: phoneRaw,
        dog_name: lead?.dog_name ?? null,
        total_mxn: lead?.total_mxn ?? null,
        contacted: lead?.contacted ?? false,
        message_count: msgArray.length,
        last_message: msgArray.length > 0 ? msgArray[msgArray.length - 1].content : null,
        messages: msgArray,
        lead_id: lead?.id ?? null,
        images: extractImages(conv, lead ?? null),
        created_at: conv.created_at,
        updated_at: conv.updated_at,
      };
    });

    const convPhoneNumbers = new Set(
      (conversations ?? []).map((c) => {
        const p = (c.metadata as { phone?: string })?.phone ?? "";
        return p.replace(/\s+/g, "").replace(/^\+/, "");
      })
    );

    const orphanLeads = (leads ?? [])
      .filter((l) => {
        const p = (l.whatsapp ?? "").replace(/\s+/g, "").replace(/^\+/, "");
        return p && !convPhoneNumbers.has(p);
      })
      .map((lead) => ({
        id: `lead_${lead.id}`,
        session_id: null,
        channel: "web" as const,
        phone: lead.whatsapp,
        dog_name: lead.dog_name,
        total_mxn: lead.total_mxn,
        contacted: lead.contacted,
        message_count: 0,
        last_message: null,
        messages: [] as Array<{ role: string; content: string }>,
        lead_id: lead.id,
        images: extractImages(null, lead),
        created_at: lead.created_at,
        updated_at: lead.created_at,
      }));

    const allItems = [...items, ...orphanLeads].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    const total = Math.max(totalCount ?? 0, leads?.length ?? 0);

    return NextResponse.json({
      data: allItems.slice(0, limit),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Admin conversations error:", error);
    return NextResponse.json({ error: "Error al cargar conversaciones" }, { status: 500 });
  }
}
