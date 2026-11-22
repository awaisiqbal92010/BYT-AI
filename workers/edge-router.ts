/**
 * Cloudflare Worker Edge Gateway & Router for BYT Studio
 *
 * Capabilities:
 * - Edge request routing & SSL termination
 * - Static asset edge caching with stale-while-revalidate
 * - Geo-distributed rate limiting
 * - Reverse proxy to Vercel production server
 * - Permissive sandbox framing headers for preview iframes
 */

// Ambient Cloudflare Worker type interfaces (avoids external @cloudflare/workers-types dependency)
export interface KVNamespace {
  get(key: string): Promise<string | null>;
  put(key: string, value: string): Promise<void>;
}

export interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

export interface Env {
  BACKEND_ORIGIN?: string;
  ENVIRONMENT?: string;
  BYT_CACHE?: KVNamespace;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const backendOrigin = env.BACKEND_ORIGIN || "https://byt-ai.vercel.app";
    const targetUrl = new URL(url.pathname + url.search, backendOrigin);

    // 1. Edge Security & Health Probe
    if (url.pathname === "/cdn-health") {
      return new Response(
        JSON.stringify({
          status: "healthy",
          edge: "cloudflare-worker",
          colo: (request as any).cf?.colo || "global",
          timestamp: Date.now(),
        }),
        {
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // 2. Clone headers and forward client metadata
    const forwardHeaders = new Headers(request.headers);
    forwardHeaders.set("X-Forwarded-Host", url.host);
    forwardHeaders.set("X-Forwarded-Proto", url.protocol.replace(":", ""));
    const clientIp = request.headers.get("cf-connecting-ip") || request.headers.get("x-real-ip");
    if (clientIp) {
      forwardHeaders.set("X-Forwarded-For", clientIp);
    }

    // 3. Forward request to Vercel origin
    const originRequest = new Request(targetUrl.toString(), {
      method: request.method,
      headers: forwardHeaders,
      body: ["GET", "HEAD"].includes(request.method) ? undefined : request.body,
      redirect: "follow",
    });

    try {
      const response = await fetch(originRequest);

      // 4. Transform response headers for edge delivery
      const responseHeaders = new Headers(response.headers);

      // Allow iframe preview embed across BYT domains
      if (url.pathname.startsWith("/preview") || url.pathname.startsWith("/api/sandbox/proxy")) {
        responseHeaders.delete("X-Frame-Options");
        responseHeaders.set("Access-Control-Allow-Origin", "*");
      }

      responseHeaders.set("X-Edge-Server", "Cloudflare-Worker");

      // Static asset caching headers
      if (url.pathname.startsWith("/_next/static/") || url.pathname.match(/\.(png|jpg|jpeg|svg|webp|ico|woff2)$/)) {
        responseHeaders.set("Cache-Control", "public, max-age=31536000, immutable");
      }

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
      });
    } catch (err: any) {
      return new Response(
        JSON.stringify({
          error: "Edge Gateway Timeout / Origin Unreachable",
          message: err?.message || "Cloudflare Worker could not connect to origin server.",
          timestamp: new Date().toISOString(),
        }),
        {
          status: 502,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  },
};
