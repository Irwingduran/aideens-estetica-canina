import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const supabase = getSupabaseServerClient();

    const { data, error } = await supabase
      .from("products")
      .select("*, category:category_id(id, name, slug)")
      .eq("slug", slug)
      .eq("active", true)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Product detail error:", error);
    return NextResponse.json({ error: "Error al cargar producto" }, { status: 500 });
  }
}
