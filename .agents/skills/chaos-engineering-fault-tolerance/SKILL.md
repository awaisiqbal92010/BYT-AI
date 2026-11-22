---
name: chaos-engineering-fault-tolerance
description: Circuit breakers, bulkhead isolation, chaos injection, graceful degradation, and graceful shutdown.
---

# Chaos Engineering & Fault Tolerance

## Patterns
- **Circuit Breakers**: Trip open when downstream error rate exceeds 50% over a 10-second window; fall back to stale cache.
- **Bulkhead Pattern**: Isolate thread/connection pools per service so an outage in one downstream doesn't starve others.
- **Graceful Shutdown**: Intercept `SIGTERM`, stop accepting new connections, finish in-flight requests within 30 seconds.

