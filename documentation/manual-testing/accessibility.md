# Manual Test: Accessibility

Automated axe-core scans run in E2E (`e2e/accessibility.spec.ts` and `e2e/offline.spec.ts`). These manual checks cover what automation cannot.

## Prerequisites

- Secretary app running with seed data loaded
- Screen reader available (macOS: VoiceOver via Cmd+F5)

## Tests

### 1. Screen reader — connection state announcements

1. Enable screen reader, navigate to the Dining page
2. Go offline (DevTools → Network → Offline)
3. **Verify:** Announces "Connection lost. Changes will be saved locally."
4. Go online
5. **Verify:** Announces "Connection restored. Syncing changes." (if mutations queued)

### 2. Keyboard navigation — dining page

1. Tab through the Dining page without a mouse
2. **Verify:** Focus order is logical (header → lodge info → table rows → status buttons)
3. **Verify:** Status button is reachable and activatable via Enter/Space
4. **Verify:** Focus indicator is visible on all interactive elements
5. **Verify:** Status menu opens with Enter/Space, items selectable with arrow keys

### 3. Text scaling — 200% zoom

1. Set browser zoom to 200% (Cmd/Ctrl + several times)
2. Navigate through lodge dashboard and dining page
3. **Verify:** Layout does not break, no horizontal scrolling, text remains readable
4. **Verify:** Touch targets remain at least 44x44px equivalent
