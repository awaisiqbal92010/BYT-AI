import { NextRequest, NextResponse } from "next/server";
import { getOrCreateActiveSandbox, getPortForFramework } from "@/lib/sandbox";
import { verifySessionCookie } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET / POST / PUT / PATCH / DELETE / OPTIONS
 * /api/sandbox/proxy/[id]/[[...path]]
 *
 * Reverse Proxy that masks the E2B microVM cloud URL behind the BYT domain.
 * Streams all incoming HTTP requests to the target sandbox dev server
 * and streams back the responses directly into the iframe or preview client.
 */
async function handleProxy(
  request: NextRequest,
  context: { params: Promise<{ id: string; path?: string[] }> }
) {
  try {
    // SECURITY: Require authenticated user for sandbox proxy access
    const cookie = request.cookies.get("session")?.value;
    const decoded = await verifySessionCookie(cookie);
    if (!decoded?.uid) {
      return NextResponse.json(
        { error: { code: "AUTH_REQUIRED", message: "Authentication required." } },
        { status: 401 }
      );
    }

    const { id: sandboxId, path: pathSegments = [] } = await context.params;

    if (!sandboxId || !/^[a-zA-Z0-9_-]+$/.test(sandboxId)) {
      return NextResponse.json({ error: "Invalid sandbox ID format" }, { status: 400 });
    }

    // Connect or get active sandbox instance
    const entry = await getOrCreateActiveSandbox(sandboxId, "vite-react");

    const targetUrl = new URL(entry.previewUrl);
    const subpath = pathSegments.join("/");
    const search = request.nextUrl.search;

    const proxyDestination = `${targetUrl.origin}/${subpath}${search}`;

    const outgoingHeaders = new Headers();
    request.headers.forEach((value, key) => {
      // Omit host header to avoid SSL/TLS SNI mismatches
      if (key.toLowerCase() !== "host" && key.toLowerCase() !== "connection") {
        outgoingHeaders.set(key, value);
      }
    });

    const bodyMethods = ["POST", "PUT", "PATCH"];
    const hasBody = bodyMethods.includes(request.method.toUpperCase());
    const body = hasBody ? await request.arrayBuffer() : undefined;

    const response = await fetch(proxyDestination, {
      method: request.method,
      headers: outgoingHeaders,
      body,
      redirect: "manual",
      // @ts-ignore
      duplex: "half",
    });

    const responseHeaders = new Headers();
    response.headers.forEach((value, key) => {
      // Don't forward restrictive frame options so the preview can render in our dashboard
      const k = key.toLowerCase();
      if (k !== "x-frame-options" && k !== "content-security-policy") {
        responseHeaders.set(key, value);
      }
    });

    // Ensure permissive framing inside BYT studio
    responseHeaders.set("Access-Control-Allow-Origin", "*");
    responseHeaders.set("X-BYT-Proxied-Sandbox", sandboxId);

    const responseBody = await response.arrayBuffer();

    return new NextResponse(responseBody, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (err: any) {
    console.error("[Sandbox Proxy Error]:", err?.message);
    return new NextResponse(
      `<html><body style="background:#09090b;color:#f43f5e;font-family:sans-serif;padding:2rem;">` +
      `<h3>Sandbox Proxy Unavailable</h3>` +
      `<p>${err?.message || "Failed to route request to microVM"}</p>` +
      `<p style="color:#71717a;font-size:12px;">Make sure the sandbox dev server is booted and healthy.</p>` +
      `</body></html>`,
      { status: 502, headers: { "Content-Type": "text/html" } }
    );
  }
}

export {
  handleProxy as GET,
  handleProxy as POST,
  handleProxy as PUT,
  handleProxy as PATCH,
  handleProxy as DELETE,
  handleProxy as OPTIONS,
};
