### 1. User Story
"As a Lodge Secretary, I want the application to handle poor connectivity gracefully and respond instantly to my actions, so that I can manage dining attendance reliably even in historic buildings with thick stone walls."

### 2. Acceptance Criteria

* **Connection Status Indicator:** Implement a visible indicator that shows the current connection state (connected, reconnecting, offline). The indicator must be unobtrusive but immediately noticeable when connectivity degrades.

* **WebSocket Reconnection:** The SPA must gracefully handle PocketBase WebSocket disconnections and reconnections without losing UI state. When a connection drops, queued changes should be preserved and synced on reconnection.

* **Optimistic Updates:** Use Pinia to implement optimistic updates. When a Secretary marks a member as "Dining," the UI should update immediately while the request processes in the background. If the request fails, the UI should roll back to the previous state with a clear notification.

### 3. Technical Notes
* Depends on sprint-0 foundations: Pinia stores, PocketBase client, and Realtime Subscriptions must be in place first.
* The optimistic update pattern should be generic enough to reuse across different data mutations, not just dining status.
* Consider edge cases: rapid toggling, concurrent edits from multiple devices, reconnection during a pending mutation.
