# ADR-010: Three-Layer Offline Queue Architecture

**Status:** Accepted

**Date:** 2026-02-16

## Context

Sprint 3 introduced offline mutation queuing — when the Lodge Secretary toggles a member's dining status while offline, the change is persisted locally and replayed when connectivity returns. The queue needs to:

- Persist across page refreshes and app restarts (survives browser close)
- Expose reactive state for UI binding (clock/spinner icons, overlay, summary)
- Orchestrate sequential replay with retry logic and cache coordination

A single-layer solution (e.g. a Pinia store with persistence plugin, or a composable with module-scoped state) would mix I/O, reactivity, and async orchestration in one place.

## Decision

**Separate the offline queue into three layers, each with a single responsibility.**

| Layer | File | Responsibility |
|-------|------|----------------|
| **IndexedDB service** | `mutation-queue.ts` | Pure async I/O — enqueue, dequeue, collapse, query. No Vue reactivity. |
| **Pinia store** | `useMutationQueueStore` | Reactive bridge — exposes `queuedMemberIds`, `syncingMemberIds`, `queuedMutations` as reactive state for UI binding. Thin wrapper; all data originates from IndexedDB. |
| **Composable** | `useMutationQueue()` | Orchestration — watches `connectionStatus`, processes queue on reconnect, retries with backoff, patches query cache per-mutation. Called once from `MainLayout`. |

### Why three layers

- **Testability** — the IndexedDB service is tested with `fake-indexeddb` in pure unit tests. No Vue test utils, no component mounting.
- **Separation of concerns** — I/O logic (IndexedDB transactions, index lookups) doesn't leak into reactive state management. Orchestration logic (retry, backoff, cache coordination) doesn't leak into the store.
- **Follows existing patterns** — the rest of the app uses Services → Stores → Composables. This avoids a special snowflake architecture for the queue.

### Key implementation details

**Mutation collapse:** When a member is toggled multiple times offline, only the final state survives. The IndexedDB service uses an index on `memberId` — if a mutation for the same member exists, it's replaced in the same transaction. This prevents queue bloat and avoids replaying intermediate states.

**Sequential processing:** Mutations replay oldest-first, one at a time. This is simpler than parallel processing and avoids race conditions with PocketBase (e.g. creating then updating the same dining record). For typical queue sizes (< 20 mutations at a lodge meeting), sequential processing completes in seconds.

**Retry with exponential backoff:** Each mutation retries up to 3 times with delays of 1s → 2s → 4s (capped at 30s). If the browser goes offline mid-retry, processing halts immediately — unprocessed mutations stay in IndexedDB for the next reconnect cycle.

**Per-mutation cache patching:** After each successful sync, the query cache is patched immediately (via `setQueryData`) rather than waiting for all mutations to complete. This prevents a stale flash when the UI overlay is removed for a synced member but the cache still holds the old server state.

## Alternatives Considered

- **Pinia persistence plugin** — would couple queue storage to Pinia's reactivity lifecycle. IndexedDB gives us transaction safety, index-based lookups, and independence from Vue's runtime.
- **Single composable with module-scoped refs** — simpler initially but mixes I/O, reactivity, and orchestration. Testing requires mocking at multiple levels.
- **provide/inject from MainLayout** — considered briefly during planning. Pinia store is the established pattern for global reactive state and doesn't require component tree awareness.

## Consequences

- Three files instead of one — justified by testability and separation of concerns
- IndexedDB is the source of truth; the Pinia store is a projection that can be rebuilt from IndexedDB at any time (`refreshStore()`)
- Adding a new mutation type (e.g. queuing member creation while offline) means adding a service function, a store field, and composable orchestration — each in the appropriate layer
