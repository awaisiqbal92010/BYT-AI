---
name: distributed-caching-redis
description: Cache-aside, write-through, stale-while-revalidate, dogpile prevention, and Redis cluster sharding.
---

# Distributed Caching with Redis

## Strategies
1. **Cache-Aside (Lazy Loading)**: Read cache first; on miss, query database, populate cache with TTL, return data.
2. **Probabilistic Early Expiration (XFetch)**: Prevent cache stampedes / dogpile effect by refreshing before expiry.
3. **Key Namespacing**: Standardize keys: `<env>:<domain>:<entity>:<id>` (e.g., `prod:users:profile:usr_123`).
4. **Memory Optimization**: Use Redis Hashes instead of standalone string keys for related fields.

