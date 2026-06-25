import { createServerClient } from "@supabase/ssr";
import { getSupabaseServerClient } from "@/lib/supabase";
import type { NextRequest, NextResponse } from "next/server";

export function createSessionClient(request: NextRequest) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
        },
      },
    }
  );
}

export async function requireAdmin(request: NextRequest) {
  const sessionClient = createSessionClient(request);
  const { data: { user }, error: authError } = await sessionClient.auth.getUser();
  if (authError || !user) {
    return { error: "No autenticado", status: 401 };
  }
  const supabase = getSupabaseServerClient();
  const { data: client } = await supabase
    .from("clients")
    .select("role")
    .eq("auth_user_id", user.id)
    .single();
  if (!client || client.role !== "admin") {
    return { error: "No autorizado", status: 403 };
  }
  return { user, supabase };
}

export function createMiddlewareClient(
  request: NextRequest,
  response: NextResponse
) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );
}
