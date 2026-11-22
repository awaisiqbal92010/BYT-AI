---
name: tracing-opentelemetry-apm
description: W3C trace context, distributed span propagation, latency histograms, and structured error tagging.
---

# OpenTelemetry & Enterprise APM

## Instrumentation
1. **Trace Context Propagation**: Propagate `traceparent` headers across microservice HTTP/gRPC hops.
2. **Semantic Attributes**: Tag spans with standard attributes: `http.status_code`, `db.system`, `user.id`.
3. **Error Recording**: Call `span.recordException(error)` and set `span.setStatus({ code: SpanStatusCode.ERROR })`.

