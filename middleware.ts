import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If Supabase keys are not set or placeholder, continue to allow local development
  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes("placeholder")) {
    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Private account paths that require authentication and account ownership
  const isPrivateAccountPath =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/projects") ||
    pathname.startsWith("/deployments") ||
    pathname.startsWith("/history") ||
    pathname.startsWith("/settings");

  // 1. Unauthenticated users trying to access private pages -> redirect to /login with safe next param
  if (!user && isPrivateAccountPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    // Sanitize destination to avoid open redirect vulnerabilities
    const safeNext = pathname.startsWith("/") && !pathname.startsWith("//") ? pathname : "/dashboard";
    url.searchParams.set("next", safeNext);
    return NextResponse.redirect(url);
  }

  // 2. Authenticated users visiting /login -> redirect to intended page or /dashboard
  if (user && pathname === "/login") {
    const nextParam = request.nextUrl.searchParams.get("next");
    const safeNext = nextParam && nextParam.startsWith("/") && !nextParam.startsWith("//")
      ? nextParam
      : "/dashboard";
    const url = request.nextUrl.clone();
    url.pathname = safeNext;
    url.searchParams.delete("next");
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - auth/callback (auth callback route)
     * - image extensions (.svg, .png, .jpg, .jpeg, .gif, .webp)
     */
    "/((?!_next/static|_next/image|favicon.ico|auth/callback|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
