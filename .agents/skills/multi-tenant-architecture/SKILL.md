---
name: multi-tenant-architecture
description: Shared database with tenant_id RLS, schema-per-tenant isolation, tenant routing, and noisy-neighbor mitigation.
---

# Multi-Tenant Cloud Architecture

## Isolation Models
1. **Row-Level Security (RLS)**: Shared schema with enforced Postgres RLS policies filtering by `auth.jwt() ->> 'tenant_id'`.
2. **Schema-Per-Tenant**: Separate PostgreSQL schemas per enterprise client for physical data separation.
3. **Noisy Neighbor Protection**: Enforce rate limits and CPU/memory quotas scoped by tenant identifier.
4. **Tenant Connection Routing**: Route queries based on subdomain or JWT claims at the API gateway layer.

