# Task 4: Queue Orchestration Composable

## Summary

Create `useMutationQueue` — called once from MainLayout, it watches `connectionStatus` and orchestrates queue processing on reconnection. This is the brain of the offline queue system.

## Work

### `src/composables/useMutationQueue.ts`

**Called once from MainLayout** (same pattern as `useConnectionMonitor`).

**Responsibilities:**

1. **`onMounted`** — Read IndexedDB and populate the Pinia store with any persisted queue (handles app restart / page refresh)

2. **`watch(connectionStatus)`** — When status transitions to `'connected'`, call `processQueue()`

3. **`enqueue(mutation)`** — Write to IndexedDB via the service, then refresh store state

4. **`processQueue()`** — Sequential replay:
   - Get all mutations from IndexedDB (oldest first)
   - For each mutation:
     - Move memberId from `queuedMemberIds` to `syncingMemberIds` in store
     - Call the appropriate repository function (`updateDiningStatus` or `createDiningRecord`)
     - On success: remove from IndexedDB, remove from syncing
     - On failure: if offline, stop processing. If server error (500), retry with backoff
   - **Re-sync guarantee:** `refreshQueuedIds()` runs in the outer `finally` of `processQueue`, so the store always re-syncs with IndexedDB regardless of how the loop exits. If connection drops mid-sync, the mutation stays in IndexedDB (only removed on success) and reappears in `queuedMemberIds` after the re-sync. The next `connected` transition retries it.
   - Show toast: `Notify.create({ type: 'positive', message: 'Synced N changes to the Festive Board', icon: 'cloud_done' })`

5. **`retryWithBackoff(mutation)`** — 3 attempts with exponential backoff (1s, 2s, 4s). Returns `true` if successful. Stops immediately if `navigator.onLine` is false.

6. **`processing` flag** — Prevents concurrent queue flushes from rapid connection transitions

**Returns:** `{ enqueue }` — the only function external callers need

## Files

| File | Action |
|------|--------|
| `src/composables/useMutationQueue.ts` | **New** |

## Verification

- [ ] TypeScript compiles with no errors
- [ ] Manual: With dev server running, open two browser tabs. In console of tab 1, verify `useMutationQueue` is called once (add a `console.debug` during dev)
- [ ] Manual: Go offline via DevTools → Network → Offline. Toggle a dining status. Check IndexedDB → `festive-board-queue` shows the mutation. Go back online. Verify the mutation is replayed and removed from IndexedDB.
- [ ] Toast "Synced N changes to the Festive Board" appears after queue clears
