# Manual Test: Offline Queue Sync

These tests cover the reconnect → queue-flush → sync flow that cannot be reliably automated (Playwright mocks routes without a real PocketBase server, so SSE reconnection is non-deterministic).

## Prerequisites

- PocketBase running locally (`pocketbase_0.36.3/pocketbase serve`)
- Secretary app running (`pnpm dev` in `clients/secretary-app/`)
- Seed data loaded (`node scripts/seed.js`)
- Chrome DevTools open (Network tab)

## Tests

### 1. Single offline toggle → reconnect → sync

1. Navigate to the Dining page, confirm **Connected** badge
2. DevTools → Network → check **Offline**, wait for **Offline** badge
3. Toggle Pemberton from "Not Dining" to "Dining"
4. **Verify:** Clock icon on Pemberton's row, no console errors
5. Uncheck **Offline**
6. **Verify:** Clock → spinner → gone
7. **Verify:** Toast: "Synced 1 change to the Festive Board"
8. **Verify:** Pemberton remains "Dining"

### 2. Multiple offline toggles → batch sync

1. Go offline, wait for badge
2. Toggle Pemberton to "Dining", Sinclair to "Not Dining", Whitfield to "Undecided"
3. **Verify:** All three rows show clock icons
4. Go online
5. **Verify:** Icons transition clock → spinner → gone, one at a time
6. **Verify:** Single toast: "Synced 3 changes to the Festive Board"

### 3. Collapse intermediate toggles

1. Go offline
2. Toggle Pemberton: Dining → Undecided → Not Dining
3. Open DevTools → Application → IndexedDB → `festive-board-queue`
4. **Verify:** 1 entry for Pemberton (status: `not_dining`), not 3
5. Go online
6. **Verify:** Toast says "Synced 1 change"

### 4. Synced status does not revert

1. Note Pemberton's status, go offline
2. Toggle Pemberton to a different status
3. Go online, wait for sync toast
4. **Verify:** Pemberton shows new status (not reverted)
5. Refresh the page
6. **Verify:** Still shows new status (server updated)

### 5. Mid-sync disconnection

1. Go offline, toggle three members
2. Go online — as soon as the first spinner appears, go offline again
3. **Verify:** No error banner, partially synced members show new status, others still show clock
4. Go online again
5. **Verify:** Remaining mutations sync, toast shows correct count

## Automated Coverage

The E2E suite (`e2e/offline.spec.ts`) covers: connectivity badge states, ARIA attributes, pending sync icon, last synced timestamp, and axe-core scans in offline/queued states.

Unit tests (`src/services/mutation-queue.test.ts`) cover: enqueue, collapse, remove, getQueuedMemberIds, clear.
