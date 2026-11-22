---
name: fullstack-api-routes
description: Principles for building RESTful and Server-Sent Event (SSE) streaming API route handlers in Next.js.
---

# Full-Stack API Routes Skill

Use this skill when designing backend API endpoints, SSE streams, and webhook handlers.

## Core Rules

1. **Request Validation & Error Handling**
   - Always validate incoming JSON payloads and return descriptive 400 Bad Request status when fields are invalid.
   - Wrap handler bodies in `try ... catch` blocks and return consistent `{ error: message }` JSON schemas.

2. **Server-Sent Events (SSE) Streaming**
   - Use `new ReadableStream({ start(controller) { ... } })` with headers:
     ```ts
     {
       "Content-Type": "text/event-stream",
       "Cache-Control": "no-cache",
       "Connection": "keep-alive"
     }
     ```
   - Format each event as `data: ${JSON.stringify(payload)}\n\n`.
