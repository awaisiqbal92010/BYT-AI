---
name: rest-api-openapi3-design
description: HTTP status semantics, idempotent PUT/DELETE, JSON Schema validation, and Swagger/OpenAPI documentation.
---

# RESTful API & OpenAPI 3.1 Design

## Best Practices
- **Resource Nouns**: Use plural nouns (`/api/v1/projects`, `/api/v1/users/{id}/deployments`).
- **HTTP Status Precision**:
  - `201 Created` with `Location` header.
  - `422 Unprocessable Entity` for field-level validation errors.
  - `409 Conflict` for state collisions.
- **RFC 7807 Problem Details**: Format errors with `{ type, title, status, detail, instance }`.

