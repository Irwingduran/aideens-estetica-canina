import { type NextRequest, NextResponse } from "next/server";

const protectedRoutes = ["/mi-cuenta", "/checkout"];
const adminRoutes = ["/admin"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const supabaseSession = request.cookies.get("sb-auth-token")?.value;

  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));
  const isAdmin = adminRoutes.some((route) => pathname.startsWith(route));

  if (isAdmin && !supabaseSession) {
    return NextResponse.redirect(new URL("/?auth=required", request.url));
  }

  if (isProtected && !supabaseSession) {
    return NextResponse.redirect(new URL("/?auth=required", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/mi-cuenta/:path*", "/checkout/:path*", "/admin/:path*"],
};
