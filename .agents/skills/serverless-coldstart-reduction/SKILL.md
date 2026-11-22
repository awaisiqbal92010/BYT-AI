---
name: serverless-coldstart-reduction
description: Tree-shaking, ESBuild minification, dependency pruning, connection pooling, and warm pingers.
---

# Serverless Cold Start Reduction

## Optimization Patterns
- **Bundle Pruning**: Keep serverless bundle size under 5MB unzipped; remove unused heavy SDK dependencies.
- **Global Scope Reuse**: Initialize database connection pools and SDK clients outside the request handler function.
- **Edge Runtimes**: Prefer V8 isolate edge runtimes (Cloudflare Workers, Next.js Edge) with sub-5ms cold starts.

