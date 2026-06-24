import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tipo = searchParams.get("tipo");
    const categoryId = searchParams.get("category_id");
    const featured = searchParams.get("featured");
    const search = searchParams.get("q");
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)));
    const offset = (page - 1) * limit;

    const supabase = getSupabaseServerClient();
    let query = supabase
      .from("products")
      .select("*, category:category_id(id, name, slug)", { count: "exact" })
      .eq("active", true);

    if (tipo) query = query.eq("tipo", tipo);
    if (categoryId) query = query.eq("category_id", categoryId);
    if (featured === "true") query = query.eq("featured", true);
    if (search) query = query.ilike("name", `%${search}%`);

    const { data, count, error } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Products fetch error:", error);
      return NextResponse.json({ error: "Error al cargar productos" }, { status: 500 });
    }

    return NextResponse.json({
      data,
      pagination: { page, limit, total: count ?? 0, pages: Math.ceil((count ?? 0) / limit) },
    });
  } catch (error) {
    console.error("Products API error:", error);
    return NextResponse.json({ error: "Error al cargar productos" }, { status: 500 });
  }
}
