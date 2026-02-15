# Manual Test Guide: Offline Mutation Queuing

## Purpose

These test cases cover the reconnect → queue-flush → sync flow that cannot be reliably automated in E2E tests. The automated suite (Playwright) mocks API routes without a real PocketBase server, so the PocketBase SSE reconnection — which drives the `connected` status transition — is non-deterministic. These manual cases fill that gap.

## Prerequisites

- PocketBase running locally (`pocketbase_0.36.3/pocketbase serve`)
- Secretary app running (`pnpm dev` in `clients/secretary-app/`)
- Seed data loaded (`node scripts/seed.js`)
- Chrome DevTools open (Network tab + Application tab)

## Test Cases

### 1. Offline toggle → reconnect → sync

**Verifies:** Mutations queued offline are replayed when connectivity returns.

1. Navigate to the Dining page
2. Confirm the connectivity badge shows **Connected** (green)
3. Open DevTools → Network tab → check **Offline**
4. Wait for badge to show **Offline** (amber, ~2 seconds)
5. Toggle Pemberton from "Not Dining" to "Dining"
6. **Verify:** Clock icon appears next to Pemberton's row
7. **Verify:** No error in the console
8. Uncheck **Offline** in DevTools
9. **Verify:** Clock icon changes to spinning sync icon
10. **Verify:** Sync icon disappears after sync completes
11. **Verify:** Toast appears: "Synced 1 change to the Festive Board"
12. **Verify:** Pemberton's status remains "Dining" (not reverted)

### 2. Multiple offline toggles → batch sync

**Verifies:** Multiple queued mutations sync sequentially with a single toast.

1. Navigate to the Dining page
2. Go offline (DevTools → Network → Offline)
3. Wait for **Offline** badge
4. Toggle Pemberton to "Dining"
5. Toggle Sinclair to "Not Dining"
6. Toggle Whitfield to "Undecided"
7. **Verify:** All three rows show clock icons
8. Go back online (uncheck Offline)
9. **Verify:** Icons transition from clock → spinner → gone, one at a time
10. **Verify:** Single toast: "Synced 3 changes to the Festive Board"
11. **Verify:** All three statuses remain as toggled

### 3. Collapse intermediate toggles

**Verifies:** Toggling the same member multiple times offline stores only the final state.

1. Navigate to the Dining page
2. Go offline
3. Toggle Pemberton to "Dining"
4. Toggle Pemberton to "Undecided"
5. Toggle Pemberton to "Not Dining"
6. Open DevTools → Application → IndexedDB → `festive-board-queue`
7. **Verify:** Only 1 entry for Pemberton (status: `not_dining`), not 3
8. Go online
9. **Verify:** Toast says "Synced 1 change" (not 3)

### 4. Queue persists across page refresh

**Verifies:** IndexedDB persistence survives a full page reload.

1. Navigate to the Dining page
2. Go offline
3. Toggle Pemberton to "Dining"
4. **Verify:** Clock icon appears
5. Refresh the page (F5) — the browser may show an offline error briefly; that's OK if the app loads from cache
6. **If the page loads:** Verify Pemberton still shows "Dining" with a clock icon
7. **If the page doesn't load (no service worker yet):** Go online first, then refresh immediately — verify the clock icon persists momentarily before sync runs

### 5. Synced status does not revert to stale data

**Verifies:** After queue flush, the UI shows the synced state (not the old server state).

1. Navigate to the Dining page
2. Note Pemberton's current status (e.g. "Not Dining")
3. Go offline
4. Toggle Pemberton to "Dining"
5. Go online — wait for sync to complete (toast appears)
6. **Verify:** Pemberton shows "Dining" (not reverted to "Not Dining")
7. Refresh the page
8. **Verify:** Pemberton still shows "Dining" (server state was updated)

### 6. Mid-sync disconnection

**Verifies:** Going offline during queue processing doesn't corrupt state.

1. Navigate to the Dining page
2. Go offline
3. Toggle all three members to different statuses
4. Go online — as soon as you see the first spinner appear, immediately go offline again
5. **Verify:** No error banner ("Failed to load dining data")
6. **Verify:** Members that synced before disconnection show their new status; members that didn't sync still show clock icons
7. Go online again
8. **Verify:** Remaining mutations sync and toast shows the correct count

### 7. Staleness banner appears after extended offline

**Verifies:** The "cached data" warning banner appears after 5 minutes offline.

1. Navigate to the Dining page
2. Go offline
3. Wait 5+ minutes (or temporarily reduce `FIVE_MINUTES_MS` in MainLayout.vue for faster testing)
4. **Verify:** Amber banner appears: "You are viewing cached data. Changes will sync once reconnected."
5. **Verify:** Banner text has sufficient contrast against the amber background (dark text, not white)
6. Go online
7. **Verify:** Banner disappears once status returns to "Connected"

### 8. Screen reader announcements

**Verifies:** Connection state changes are announced to assistive technology.

1. Enable a screen reader (VoiceOver on macOS: Cmd+F5)
2. Navigate to the Dining page
3. Go offline
4. **Verify:** Screen reader announces: "Connection lost. Changes will be saved locally."
5. Go online
6. **Verify:** Screen reader announces: "Connection restored. Syncing changes." (if there are queued mutations)

## Automated Coverage Reference

The following aspects **are** covered by the E2E suite (`e2e/offline.spec.ts`):

- Connectivity badge states (Connected, Offline)
- ARIA attributes on the connectivity badge
- Pending sync icon during in-flight online mutation
- Last synced timestamp display
- axe-core accessibility scan in offline state
- axe-core accessibility scan with queued mutations (clock icon)

The following are covered by unit tests (`src/services/mutation-queue.test.ts`):

- Enqueue and retrieve mutations from IndexedDB
- Collapse duplicate mutations for the same member
- Remove individual mutations
- Get queued member ID set
- Clear entire queue
