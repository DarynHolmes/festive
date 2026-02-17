# Plan: Offline Mutation Queuing & Local Persistence

## Context

Sprint 2 delivered "Offline Aware" — the app detects connectivity changes, shows status badges, and optimistically updates the UI with rollback on error. But mutations made while offline simply fail. This sprint makes the app "Offline Functional": mutations are queued locally in IndexedDB and replayed when connectivity returns. This is the "non-negotiable constraint for UGLE" documented in ADR-003.

## Architecture

```
User toggles status
        ↓
  useDiningMutation
        ↓
  [Online?] ─── Yes ──→ PocketBase API (existing flow)
      │
      No
      ↓
  enqueueMutation() → IndexedDB (collapse duplicates by memberId)
        ↓
  Cache updated optimistically, clock icon shown
        ↓
  connectionStatus → 'connected' (watcher fires)
        ↓
  processQueue() → replay mutations sequentially
        ↓
  Toast: "Synced N changes to the Festive Board"
```

### Key Design Decisions

1. **Three layers** — IndexedDB service (pure I/O), Pinia store (reactive state), composable (orchestration). Follows the existing service/store/composable separation.

2. **Collapse intermediate toggles** — If a member is toggled 3 times offline, only the final state is stored. Uses an IndexedDB index on `memberId`.

3. **`useDiningMutation` checks connection at mutation time** — When offline, it enqueues and returns a synthetic success so the optimistic update lifecycle proceeds normally. No new API surface.

4. **Global state via Pinia store** — `useMutationQueueStore` holds `queuedMemberIds` and `syncingMemberIds`. Readable by any component (DiningTable, MainLayout).

5. **Realtime event filtering** — The existing `useRealtimeSync` callback in MainLayout skips cache invalidation for member IDs in the queue (3-line filter).

6. **Overlay queued mutations on display** — After page refresh, queued mutations are applied on top of fresh server data so the UI shows the user's intended state with a clock icon.

## Implementation Tasks

### Task 1: Dependencies & config

- `pnpm add idb` (~1.2KB gzipped, thin IndexedDB wrapper)
- `pnpm add -D fake-indexeddb` (for vitest unit tests)
- Add `'Notify'` to `plugins[]` in `quasar.config.ts`

### Task 2: IndexedDB persistence service + unit tests

**New:** `src/services/mutation-queue.ts`

Pure TypeScript module, no Vue dependencies. Functions: `enqueueMutation`, `getAllMutations`, `removeMutation`, `getQueuedMemberIds`, `clearQueue`.

Key: `enqueueMutation` collapses — uses a `by-member` index to find and replace any existing entry for the same `memberId`.

**New:** `src/services/mutation-queue.test.ts`

Unit tests with `fake-indexeddb`: enqueue, collapse, remove, getIds, clear.

### Task 3: Mutation queue store

**New:** `src/stores/mutation-queue-store.ts`

Pinia store exposing: `queuedMemberIds` (Set), `syncingMemberIds` (Set), `queuedMutations` (full array for overlay). Methods to set/add/remove. Follows the existing lodge-store pattern.

### Task 4: Queue orchestration composable

**New:** `src/composables/useMutationQueue.ts`

Called once from MainLayout. Responsibilities:

- `watch` on `connectionStatus` — when it transitions to `connected`, call `processQueue()`
- `processQueue()` — sequential replay, moves each member from "queued" to "syncing" state
- Retry with exponential backoff (1s → 2s → 4s, max 3 attempts) for server errors; stops immediately if connectivity drops
- `Notify.create()` summary toast after successful sync
- `onMounted` — refresh store from IndexedDB (loads persisted queue after app restart)

### Task 5: Offline interception in useDiningMutation

**Modify:** `src/composables/useDiningMutation.ts`

Inside the `mutation` function, add a guard at the top:

```
if (connectionStatus !== 'connected') → enqueueMutation() → return synthetic DiningEntry
```

The existing `onMutate`/`onSuccess`/`onError`/`onSettled` lifecycle stays untouched. The synthetic entry flows through `onSuccess` which patches the cache — this is correct because the user's intent is immediately reflected.

### Task 6: Three-state icon in DiningTable

**Modify:** `src/components/DiningTable.vue`

New props: `queuedMemberIds`, `syncingMemberIds`. Replace the single sync icon with:

- `schedule` icon (amber) when `queuedMemberIds.has(id)` — aria-label "Queued for sync"
- `sync` icon (spinning) when `syncingMemberIds.has(id) || pendingMemberIds.has(id)` — aria-label "Syncing changes"
- Spacer `<span>` when neither — prevents layout shift

### Task 7: Wire DiningPage + overlay queued mutations

**Modify:** `src/pages/DiningPage.vue`

- Read from `useMutationQueueStore()` for queue state
- Computed `rows` overlays queued mutations on top of server data (5 lines — map rows, apply queued status)
- Pass new props to DiningTable

### Task 8: MainLayout — queue init + realtime filtering + a11y

**Modify:** `src/layouts/MainLayout.vue`

- Call `useMutationQueue()` (activates watcher)
- Filter `dining_records` realtime events: skip invalidation if `member_id` is in `queuedMemberIds`
- Add `aria-live="assertive"` region announcing "Connection lost. Changes will be saved locally" / "Connection restored. Syncing changes"

### Task 9: E2E tests

**Modify:** `e2e/offline.spec.ts`

- **Scenario 1:** Toggle while offline → verify clock icon → reconnect → verify sync + toast
- **Scenario 2:** Toggle while offline → refresh page → verify clock icon persists
- **Accessibility:** Verify axe-core passes with queued state active
- Add `beforeEach` IndexedDB cleanup: `page.evaluate(() => indexedDB.deleteDatabase('festive-board-queue'))`

## Files Changed

| File | Action |
|------|--------|
| `package.json` | Add `idb`, `fake-indexeddb` |
| `quasar.config.ts` | Add Notify plugin |
| `src/services/mutation-queue.ts` | **New** — IndexedDB service |
| `src/services/mutation-queue.test.ts` | **New** — Unit tests |
| `src/stores/mutation-queue-store.ts` | **New** — Reactive queue state |
| `src/composables/useMutationQueue.ts` | **New** — Orchestration + watcher |
| `src/composables/useDiningMutation.ts` | Modify — offline interception |
| `src/components/DiningTable.vue` | Modify — 3-state icon |
| `src/pages/DiningPage.vue` | Modify — wire store, overlay |
| `src/layouts/MainLayout.vue` | Modify — init, filter, a11y |
| `e2e/offline.spec.ts` | Modify — new scenarios |

## What This Does NOT Do (YAGNI)

- No generic queue framework — only dining mutations. Extract if needed later.
- No conflict resolution UI — last-write-wins only (V1).
- No service worker / PWA activation — separate story.
- No auth token refresh flow — if token expires, queued mutations remain until re-auth (documented edge case).

## Verification

1. **Unit tests:** `pnpm test:unit` — mutation-queue service tests pass
2. **Manual:** Toggle status offline → see clock icon → reconnect → see spinner → see toast
3. **Persistence:** Toggle offline → close/refresh tab → reopen → clock icon still visible
4. **E2E:** `pnpm test:e2e` — all existing + new offline scenarios pass
5. **Accessibility:** axe-core passes with queued state; screen reader announces connection changes
