---
name: api-gateway-rate-limiting
description: Token bucket and sliding window rate limiting, edge request routing, request signing, and TLS termination.
---

# API Gateway & Rate Limiting

## Algorithms
- **Sliding Window Counter**: Redis ZSET or in-memory ring buffer tracking exact timestamps for burst-free limiting.
- **Token Bucket**: Allows controlled burst capacity while enforcing a steady long-term rate.
- **Standard Headers**: Return `RateLimit-Limit`, `RateLimit-Remaining`, and `RateLimit-Reset` per IETF draft.
- **Tiered Limits**: Differentiate anonymous guests (e.g. 10 req/min) from authenticated tiers (e.g. 500 req/min).

