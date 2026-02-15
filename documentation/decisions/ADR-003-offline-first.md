# ADR-003: Offline-First PWA Strategy

**Status:** Accepted

**Date:** 2026-02-14

## Context

Lodge Meetings frequently take place in historic buildings — basement rooms with thick stone walls, limited mobile signal, and unreliable Wi-Fi. A Lodge Secretary marking Members as "dining" cannot afford to lose that data because of a dropped connection.

The overview defines **connectivity resilience** as a non-negotiable constraint and **state resilience** as a key capability.

## Decision

**Offline-first PWA using `vite-plugin-pwa` with a background sync queue and optimistic UI updates.**

### Architecture

```
Secretary Action → Optimistic UI Update (Pinia) → Enqueue Mutation
                                                    ↓
                                            [Online?]
                                           /         \
                                         Yes          No
                                          ↓            ↓
                                   Send to PB    Store in queue
                                          ↓            ↓
                                   Confirm/Rollback   Retry on reconnect
```

### Key decisions within this strategy

1. **Optimistic updates** — UI reflects the Secretary's action immediately. If the server rejects or a conflict is detected, the UI rolls back with a clear notification
2. **Mutation queue** — offline mutations are queued locally (IndexedDB via Pinia persistence) and replayed when connectivity returns
3. **Conflict resolution** — when replaying queued mutations, timestamp-based last-write-wins for simple fields; Lodge Secretary-mediated resolution for Dining count conflicts (see [overview §3: Interactive Reconciliation](../01_overview.md))
4. **Connection status indicator** — always-visible UI element showing online/offline/reconnecting state. No silent failures
5. **Service worker** — `vite-plugin-pwa` with Workbox for asset caching; app shell is fully available offline

## Consequences

- Adds complexity: queue management, conflict detection, rollback logic
- IndexedDB storage has browser-specific limits (typically 50MB+, well within our needs)
- Testing offline scenarios requires Playwright network conditioning — adds test setup but catches real issues
- The mutation queue is the most complex piece of the front-end; it must be well-tested and well-documented
