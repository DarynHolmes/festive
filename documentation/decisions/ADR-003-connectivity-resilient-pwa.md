# ADR-003: Connectivity-Resilient PWA Strategy

**Status:** Accepted

**Date:** 2026-02-14

## Context

Lodge Meetings frequently take place in historic buildings — basement rooms with thick stone walls, limited mobile signal, and unreliable Wi-Fi. A Lodge Secretary marking Members as "dining" cannot afford to lose that data because of a dropped connection.

The overview defines **connectivity resilience** as a non-negotiable constraint and **state resilience** as a key capability.

## Decision

**Online-first PWA with offline fallback, using `vite-plugin-pwa` with a mutation queue and optimistic UI updates.**

This is not "offline-first" — we don't write to local storage first and sync later. The happy path sends mutations directly to PocketBase. The queue is a fallback that catches mutations when connectivity drops, ensuring no data is lost.

### Architecture

```
Secretary Action → Optimistic UI Update (Pinia)
                        ↓
                   [Connected?]
                   /           \
                 Yes             No
                  ↓               ↓
           Send to PB      Enqueue in IndexedDB
                  ↓               ↓
        Confirm / Rollback   Replay on reconnect
```

### Key decisions within this strategy

1. **Optimistic updates** — UI reflects the Secretary's action immediately. If the server rejects or a conflict is detected, the UI rolls back with a clear notification
2. **Mutation queue** — offline mutations are queued locally (IndexedDB via Pinia persistence) and replayed when connectivity returns
3. **Conflict resolution** — when replaying queued mutations, timestamp-based last-write-wins for simple fields; Lodge Secretary-mediated resolution for Dining count conflicts (see [overview §3: Interactive Reconciliation](../01_overview.md))
4. **Connection status indicator** — always-visible UI element showing online/offline/reconnecting state. No silent failures
5. **Service worker** — `vite-plugin-pwa` with Workbox for asset caching; app shell is fully available offline

## Implementation (Sprint 3)

The mutation queue uses a three-layer architecture, each with a single responsibility:

- **IndexedDB service** (`mutation-queue.ts`) — pure async I/O. Enqueue with collapse-by-memberId (only the final toggle survives per member), dequeue, query. Uses `idb` wrapper (~1.2KB).
- **Pinia store** (`useMutationQueueStore`) — reactive bridge. Exposes `queuedMemberIds` and `syncingMemberIds` as sets for UI binding (clock/spinner icons).
- **Composable** (`useMutationQueue`) — orchestration. Watches `connectionStatus`, processes queue sequentially on reconnect, retries with exponential backoff (1s–30s, 3 attempts), patches query cache per-mutation to prevent stale flashes.

Connection detection uses dual signal layers (PocketBase SSE + browser online/offline events) with a three-state model. See [ADR-011](ADR-011-dual-layer-connection-detection.md) for rationale.

For full architectural details, see [ADR-010](ADR-010-offline-queue-architecture.md) and the [Offline Architecture section](../02_architecture.md#offline-architecture) in the main architecture doc.

## Consequences

- Adds complexity: queue management, conflict detection, rollback logic
- IndexedDB storage has browser-specific limits (typically 50MB+, well within our needs)
- Testing offline scenarios requires Playwright network conditioning — adds test setup but catches real issues
- The mutation queue is the most complex piece of the front-end; it must be well-tested and well-documented
