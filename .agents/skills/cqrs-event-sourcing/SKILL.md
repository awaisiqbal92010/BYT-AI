---
name: cqrs-event-sourcing
description: Command Query Responsibility Segregation, immutable event stores, read projection rebuilds, and snapshots.
---

# CQRS & Event Sourcing Architecture

## Core Design
1. **Command Model**: Validates business invariants, emits domain events, appends to immutable event log.
2. **Query Model (Read Projections)**: Materialized views optimized for specific UI screens (e.g., Elasticsearch, Postgres).
3. **Snapshots**: Save aggregate state snapshots every 100 events to maintain sub-10ms hydration times.

