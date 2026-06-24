import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("client_id");
    const status = searchParams.get("status");

    if (!clientId) {
      return NextResponse.json({ error: "client_id es requerido" }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();
    let query = supabase
      .from("orders")
      .select("*, items:order_items(*), dog:dogs(id, name, breed)")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false });

    if (status) query = query.eq("status", status);

    const { data, error } = await query;

    if (error) {
      console.error("Orders fetch error:", error);
      return NextResponse.json({ error: "Error al cargar órdenes" }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Orders API error:", error);
    return NextResponse.json({ error: "Error al cargar órdenes" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { client_id, dog_id, items, notes } = body;

    if (!client_id || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "client_id y items son requeridos" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServerClient();

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        client_id,
        dog_id: dog_id ?? null,
        notes: notes ?? null,
        source: "web",
      })
      .select("id")
      .single();

    if (orderError || !order) {
      console.error("Order insert error:", orderError);
      return NextResponse.json({ error: "Error al crear orden" }, { status: 500 });
    }

    const orderItems = items.map(
      (item: { product_id: string; product_name: string; price: number; quantity: number }) => ({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.product_name,
        price: item.price,
        quantity: item.quantity,
      })
    );

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      console.error("Order items insert error:", itemsError);
      await supabase.from("orders").delete().eq("id", order.id);
      return NextResponse.json({ error: "Error al guardar items" }, { status: 500 });
    }

    const { data: fullOrder, error: fetchError } = await supabase
      .from("orders")
      .select("*, items:order_items(*)")
      .eq("id", order.id)
      .single();

    if (fetchError) {
      return NextResponse.json({ data: { id: order.id } }, { status: 201 });
    }

    return NextResponse.json({ data: fullOrder }, { status: 201 });
  } catch (error) {
    console.error("Orders create error:", error);
    return NextResponse.json({ error: "Error al crear orden" }, { status: 500 });
  }
}
