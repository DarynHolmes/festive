# Sprint 3: Offline Mutation Queuing & Local Persistence

## User Story

"As a Lodge Secretary, I want my dining status changes to be queued locally when I lose connectivity and automatically synchronized when I return online, so that I can continue managing the Festive Board without fear of data loss in historic buildings with thick stone walls."

### Edge Cases

- **Session Expiry while Offline:** If the PocketBase token expires while the user is offline, the queue should persist until a re-authentication flow is completed.
- **App Closure:** If the browser tab is closed with a pending queue, the data must persist in IndexedDB and resume on the next visit.
- **Conflict with Realtime:** If a record is updated by the server (via another user) while a local mutation is pending for the same member, the local change takes precedence (Last-Write-Wins for V1).

## Acceptance Criteria

- [ ] **Local Persistence:** Implement a persistent mutation queue using IndexedDB (via Pinia plugin or custom utility) so pending changes survive page refreshes.
- [ ] **Background Synchronization:** Automatically trigger the queue processing when `connectionStatus` transitions back to `connected`.
- [ ] **Visual Feedback:** The per-row "sync" icon must transition to a "queued" state (e.g., a clock icon) when an update is saved while offline, and a "syncing" state (spinner) during the background upload.
- [ ] **Retry Logic:** Implement exponential backoff for failed sync attempts that aren't related to connectivity (e.g., 500 errors).
- [ ] **Toast Notifications:** Display a summary notification (QNotify) when the queue successfully clears: "Synced 5 changes to the Festive Board."

## PocketBase

- **Collections:** No schema changes required to `dining_records`.
- **Realtime:** The `useRealtimeSync` composable must ignore server events for records currently sitting in the local mutation queue to prevent UI flickering.

## Quality

- **E2E:** - Scenario 1: Toggle status while offline -> Verify "queued" icon -> Restore connection -> Verify "synced" icon and server state.
    - Scenario 2: Toggle status while offline -> Refresh page -> Verify "queued" icon still persists.
- **Accessibility:** - Update `aria-live` regions to announce: "Connection lost. Changes will be saved locally" and "Connection restored. Syncing changes."
    - Queued status icons must have appropriate `aria-label` (e.g., "Pending sync").


## Notes
This sprint addresses the specific "Offline mutation queuing gap" documented at the end of Sprint 2. It moves the prototype from "Offline Aware" to "Offline Functional," which is a non-negotiable constraint for UGLE.

