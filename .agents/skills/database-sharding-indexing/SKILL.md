---
name: database-sharding-indexing
description: B-Tree, GIN, BRIN indexes, query execution EXPLAIN analysis, composite index order, and horizontal partitioning.
---

# Database Indexing & Sharding Best Practices

## Index Design
- **Index Order Rule**: Equality columns first, followed by range/inequality filter columns (`status`, `created_at`).
- **Covering Indexes (INCLUDE)**: Add secondary columns to the index leaf pages to avoid heap lookups.
- **Partial Indexes**: Index only active rows (e.g., `WHERE status = 'active'`) to reduce index bloat.
- **BRIN for Append-Only Logs**: Use Block Range Indexes on monotonically increasing timestamps.

