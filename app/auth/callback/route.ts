import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const next = searchParams.get("next") ?? "/dashboard";
  // SECURITY: Prevent open redirect — only allow same-origin relative paths
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
  return NextResponse.redirect(`${origin}${safeNext}`);
}
