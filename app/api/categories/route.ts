import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";

export async function GET() {
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("product_categories")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("Categories fetch error:", error);
      return NextResponse.json({ error: "Error al cargar categorías" }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Categories API error:", error);
    return NextResponse.json({ error: "Error al cargar categorías" }, { status: 500 });
  }
}
