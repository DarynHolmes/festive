# Offline Awareness & Connectivity Guardrails

## User Story

[cite_start]"As a Lodge Secretary, I want to see a clear visual indicator of my connection status and the 'freshness' of the data, so that I can confidently manage the Festive Board count even when the Lodge building's Wi-Fi is intermittent." [cite: 15, 16]

### Edge Cases

- [cite_start]**Flapping Connection:** If the WebSocket reconnects and disconnects rapidly, the UI should not flicker excessively; use a short debounce or distinct "Reconnecting" state. [cite: 34]
- [cite_start]**Backgrounding:** If the device is locked or the app is backgrounded, the "Last Synced" timer must refresh immediately upon wake to prevent displaying misleading "fresh" timestamps. [cite: 33]
- [cite_start]**Initial Load Failure:** If the user opens the app while completely offline, they should see a meaningful "Offline Mode" message and cached data rather than a generic 404. [cite: 4, 5]

## Acceptance Criteria

- [ ] [cite_start]**Connectivity Status Badge:** Implement a persistent status indicator in the `MainLayout` header. [cite: 5, 2]
    - [cite_start]**Online:** Green "Connected" state indicating active WebSocket. [cite: 5]
    - [cite_start]**Offline:** Amber/Red "Offline" state. [cite: 5]
- [ ] [cite_start]**Last Synced Timestamp:** Display a human-readable "Last updated: [Time] ago" label near the dining count summary that updates every minute. [cite: 1, 5]
- [ ] [cite_start]**Data Staleness Warning:** If the app has been offline for more than 5 minutes, display a `QBanner` warning: "You are viewing cached data. Changes will sync once reconnected." [cite: 34, 1]
- [ ] [cite_start]**PocketBase Heartbeat:** Utilize the PocketBase `pb.realtime` listener to toggle the global `isRealtimeConnected` state in the `useLodgeStore`. [cite: 2, 5]
- [ ] [cite_start]**Optimistic Visual Cues:** While offline, status toggles must show a "pending" or "syncing" icon on the row until the server acknowledges the change. [cite: 3, 5]

## PocketBase

- [cite_start]**Collections:** No schema changes required for this sprint. [cite: 2]
- [cite_start]**Realtime:** Leverage the `PB_CONNECT` and `PB_DISCONNECT` events from the PocketBase SDK to drive the global application state. [cite: 2, 5]

## Quality

- [cite_start]**E2E:** - Simulate "Offline" mode in Playwright and verify the status badge changes to "Offline". [cite: 3, 5]
    - [cite_start]Verify that a status toggle performed while offline displays a "Pending Sync" visual cue. [cite: 3]
    - [cite_start]Restore connection and verify the "Last Synced" timestamp updates to "Just now". [cite: 5]
- [cite_start]**Accessibility:** - The status badge must use `role="status"` or `aria-live="polite"` to announce connection changes to screen readers. [cite: 17, 3]
    - [cite_start]All status colors (Online/Offline) must meet WCAG 2.2 AA contrast requirements against the header background. [cite: 17, 3]

## Job Spec Alignment

- [cite_start]**Fault-tolerant UI:** Ensures the system remains intuitive and reliable during hardware or network failure. [cite: 34]
- [cite_start]**Connectivity Resilience:** Directly addresses the requirement for the app to function in environments with limited or no internet access. [cite: 1, 3]
- [cite_start]**SPA/PWA:** Establishes the necessary state management for a robust PWA membership application. [cite: 16]