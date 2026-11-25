import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Private routes requiring authentication
  const isPrivatePath =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/projects") ||
    pathname.startsWith("/deployments") ||
    pathname.startsWith("/history") ||
    pathname.startsWith("/settings");

  const sessionCookie = request.cookies.get("session")?.value;

  // 1. Unauthenticated user trying to access private page -> redirect to /login
  if (!sessionCookie && isPrivatePath) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    const safeNext =
      pathname.startsWith("/") && !pathname.startsWith("//") ? pathname : "/dashboard";
    url.searchParams.set("next", safeNext);
    return NextResponse.redirect(url);
  }

  // 2. Authenticated user visiting /login -> redirect to intended page or /dashboard
  if (sessionCookie && pathname === "/login") {
    const nextParam = request.nextUrl.searchParams.get("next");
    const safeNext =
      nextParam && nextParam.startsWith("/") && !nextParam.startsWith("//")
        ? nextParam
        : "/dashboard";
    const url = request.nextUrl.clone();
    url.pathname = safeNext;
    url.searchParams.delete("next");
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export default middleware;

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - auth/callback (auth callback route)
     * - api routes
     * - image extensions (.svg, .png, .jpg, .jpeg, .gif, .webp)
     */
    "/((?!_next/static|_next/image|favicon.ico|auth/callback|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
