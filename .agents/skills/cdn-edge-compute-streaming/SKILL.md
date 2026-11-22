---
name: cdn-edge-compute-streaming
description: Edge workers, geo-distributed caching, stale-while-revalidate headers, and streaming SSE responses.
---

# CDN Edge Compute & Streaming Architecture

## Key Techniques
1. **Cache-Control Precision**: Use `s-maxage=3600, stale-while-revalidate=86400` for near-instant edge responses.
2. **Server-Sent Events (SSE)**: Set `Content-Type: text/event-stream`, `Cache-Control: no-cache`, `Connection: keep-alive`.
3. **Edge Rewrites**: Transform paths, sanitize headers, and verify lightweight JWTs close to the user.

