---
name: microservices-domain-driven-design
description: Patterns for bounded contexts, aggregates, entities, value objects, and decoupled microservices architecture.
---

# Microservices & Domain-Driven Design (DDD)

## Core Principles
1. **Bounded Contexts**: Explicit boundaries within which a domain model applies.
2. **Ubiquitous Language**: Shared vocabulary between engineers, domain experts, and stakeholders.
3. **Aggregates & Root Entities**: Treat clusters of associated objects as a unit for data changes.
4. **Domain Events**: Capture side-effects and async notifications across domain boundaries.

## Architecture Checklist
- [ ] Explicitly map context boundaries before decomposing services.
- [ ] Use Anti-Corruption Layers (ACL) when interfacing with legacy systems.
- [ ] Enforce transactional consistency within aggregate boundaries; eventual consistency across aggregates.

