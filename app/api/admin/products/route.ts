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
    const categoryId = searchParams.get("category_id");
    const tipo = searchParams.get("tipo");
    const page = Math.max(parseInt(searchParams.get("page") ?? "1", 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") ?? "50", 10) || 50, 1), 200);
    const offset = (page - 1) * limit;

    let countQuery = supabase.from("products").select("*", { count: "exact", head: true });
    let dataQuery = supabase
      .from("products")
      .select("*, category:category_id(id, name, slug)")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (search) {
      const filter = `name.ilike.%${search}%,slug.ilike.%${search}%`;
      countQuery = countQuery.or(filter);
      dataQuery = dataQuery.or(filter);
    }
    if (categoryId) {
      countQuery = countQuery.eq("category_id", categoryId);
      dataQuery = dataQuery.eq("category_id", categoryId);
    }
    if (tipo) {
      countQuery = countQuery.eq("tipo", tipo);
      dataQuery = dataQuery.eq("tipo", tipo);
    }

    const { data, error, count } = await dataQuery;
    const { count: total } = await countQuery;

    if (error) {
      return NextResponse.json({ error: "Error al cargar productos" }, { status: 500 });
    }

    return NextResponse.json({
      data: data ?? [],
      pagination: {
        page,
        limit,
        total: total ?? count ?? 0,
        pages: Math.ceil((total ?? count ?? 0) / limit),
      },
    });
  } catch (error) {
    console.error("Admin products error:", error);
    return NextResponse.json({ error: "Error al cargar productos" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const supabase = getSupabaseServerClient();

    const body = await request.json();
    const { name, slug, description, price, compare_price, stock, unit, tipo, category_id, featured, active, ai_tags } = body;

    if (!name || name.trim().length < 2) {
      return NextResponse.json({ error: "El nombre debe tener al menos 2 caracteres" }, { status: 400 });
    }
    if (!slug) {
      return NextResponse.json({ error: "El slug es requerido" }, { status: 400 });
    }
    if (typeof price !== "number" || price < 0) {
      return NextResponse.json({ error: "Precio inválido" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("products")
      .insert({
        name: name.trim(),
        slug: slug.trim().toLowerCase().replace(/\s+/g, "-"),
        description: description ?? null,
        price: Math.round(price),
        compare_price: compare_price ? Math.round(compare_price) : null,
        stock: Math.max(0, Math.round(stock ?? 0)),
        unit: unit ?? "pieza",
        tipo: tipo ?? "convencional",
        category_id: category_id ?? null,
        featured: featured ?? false,
        active: active ?? true,
        ai_tags: ai_tags ?? [],
      })
      .select("*, category:category_id(id, name, slug)")
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "Ya existe un producto con ese slug" }, { status: 409 });
      }
      return NextResponse.json({ error: "Error al crear producto" }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error("Product create error:", error);
    return NextResponse.json({ error: "Error al crear producto" }, { status: 500 });
  }
}
