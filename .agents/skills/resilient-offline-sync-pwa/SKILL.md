---
name: resilient-offline-sync-pwa
description: Service worker Workbox caching, background sync, IndexedDB persistence, and optimistic mutation queues.
---

# Resilient Offline Sync & PWA Architecture

## Architecture
1. **Cache Strategies**:
   - Static Assets (JS/CSS/Fonts): Cache-First with content hashing.
   - Dynamic API Reads: Network-First with IndexedDB fallback.
2. **Optimistic Mutation Queue**: Append local user actions to an IndexedDB queue immediately with temporary UUIDs.
3. **Background Sync**: Trigger queue replay when online connectivity returns; reconcile server conflicts.

