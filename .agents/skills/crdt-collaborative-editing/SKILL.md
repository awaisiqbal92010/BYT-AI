---
name: crdt-collaborative-editing
description: Yjs, Automerge, state vectors, vector clocks, undo/redo stacks, and peer-to-peer conflict resolution.
---

# Conflict-Free Replicated Data Types (CRDTs)

## Implementation Guidelines
- **Yjs State Vectors**: Exchange compact 32-byte hashes to synchronize only missing document deltas.
- **LWW (Last-Write-Wins)**: Use hybrid logical clocks for simple key-value maps.
- **Text CRDTs (Y.Text)**: Preserve semantic intent during concurrent character insertions and deletions.
- **Persistence**: Store binary snapshots (`Y.encodeStateAsUpdate`) periodically in object storage.

