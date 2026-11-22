import { NextResponse } from "next/server";

export const runtime = "nodejs";

// POST /api/auth/logout — clears the session cookie
export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set("session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
  return response;
}
