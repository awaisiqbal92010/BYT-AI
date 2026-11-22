---
name: event-driven-architecture-kafka
description: Publish-subscribe, consumer group scaling, dead-letter queues, idempotent consumer semantics, and schema registries.
---

# Event-Driven Architecture (Kafka / RabbitMQ)

## Consumer & Producer Patterns
- **At-Least-Once Delivery**: Producers retry on transient failures; consumers must be idempotent via deduplication keys.
- **Dead-Letter Queue (DLQ)**: Route unparseable poison pills to DLQ after 3 failed retries with exponential backoff.
- **Partition Keys**: Key events by tenant ID or entity ID to ensure strict ordering within partitions.
- **Schema Evolution**: Use Avro / Protobuf with backward-compatible schema registry validation.

