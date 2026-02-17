# Task 9: E2E Tests

## Summary

Add Playwright E2E tests covering the two scenarios from the acceptance criteria, plus accessibility verification of the queued state.

## Work

### Modify `e2e/offline.spec.ts`

**Setup:** Add IndexedDB cleanup to `beforeEach`:

```typescript
test.beforeEach(async ({ page }) => {
  await page.evaluate(() => indexedDB.deleteDatabase('festive-board-queue'));
  await mockDiningRoutes(page);
});
```

**Scenario 1: Toggle while offline → queued icon → reconnect → synced**

1. Navigate to dining page, verify loaded
2. `context.setOffline(true)`, wait for debounce
3. Toggle Pemberton's status to "Dining"
4. Assert: clock icon (`getByLabel('Queued for sync')`) is visible
5. Set up route handler for the PATCH that will happen on reconnect
6. `context.setOffline(false)`
7. Assert: clock icon disappears
8. Assert: toast "Synced 1 change" is visible

**Scenario 2: Toggle while offline → refresh → queue persists**

1. Navigate to dining page, verify loaded
2. `context.setOffline(true)`, wait for debounce
3. Toggle Pemberton's status
4. Assert: clock icon visible
5. Re-establish mock routes, `page.reload()`
6. Assert: clock icon still visible after page load (IndexedDB persisted)

**Scenario 3: Queued state is accessible**

1. Navigate to dining page
2. Go offline, toggle a status
3. Run axe-core → no violations
4. Verify `aria-label="Queued for sync"` on the clock icon

## Files

| File | Action |
|------|--------|
| `e2e/offline.spec.ts` | Modify |

## Verification

- [ ] `pnpm test:e2e` — all existing tests pass (no regressions)
- [ ] All 3 new scenarios pass
- [ ] Tests are deterministic: run 3 times, same result each time
