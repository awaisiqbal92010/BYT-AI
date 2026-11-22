---
name: websocket-realtime-collaboration
description: Full-duplex low-latency communication, heartbeat ping-pong, presence tracking, and reconnect backoff.
---

# WebSocket Real-Time Collaboration

## Architecture
- **Heartbeat & Liveness**: 30-second ping/pong frames to detect dead TCP sockets through proxies.
- **Exponential Reconnection**: Random jittered backoff (1s, 2s, 4s, 8s, up to 30s) to avoid thundering herds.
- **Ephemeral Presence**: Store user cursor, selection, and typing indicators in Redis pub/sub.
- **Binary Protocols**: Consider protobuf / msgpack over JSON for high-frequency coordinate streaming.

