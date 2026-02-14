# Focus: Real-time Attendance Toggling

## User Story (Ecosystem)

"As a Lodge Secretary, I want to toggle the Dining Status of Members on a high-density dashboard, so that the Festive Board counts are updated in real-time for the caterers without page refreshes."



## Acceptance Criteria (The Definition of Done)


- Quasar SPA (Vue/TS): Implement a high-density QTable or QList interface optimized for high-volume data entry (100+ rows), ensuring performance stays high.

- Optimistic Updates: Use pinia-colada to implement optimistic UI updates, ensuring the toggle reflects the new state immediately while the network request resolves.

- PocketBase Sync: Integrate the useRealtimeSync() composable to subscribe to the dining_entries collection; changes from other devices must update the UI automatically via WebSocket.

- Quality: Create a Playwright test suite that mocks a slow network response to verify the optimistic state and subsequent success/failure reconciliation.


- Compliance: Satisfies the requirement for managing complex admin workflows and ensuring the system is fault tolerant

