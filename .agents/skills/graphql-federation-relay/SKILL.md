---
name: graphql-federation-relay
description: Composing distributed subgraph schemas, DataLoader batching, cursor pagination, and Relay client compatibility.
---

# GraphQL Federation & Relay Specification

## Best Practices
1. **Relay Global Object Identification**: Implement `Node` interface with globally unique base64 IDs.
2. **Cursor Connections**: Standardize pagination with `edges`, `node`, `pageInfo`, `hasNextPage`.
3. **Subgraph Entities**: Define `@key(fields: "id")` for federated entity resolution across Apollo/Hive routers.
4. **DataLoader Pattern**: Eliminate N+1 query explosion via per-request batching and memoization caches.

