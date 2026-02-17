# Task 7: Wire DiningPage + Overlay Queued Mutations

## Summary

Update `DiningPage.vue` to pass queue state to `DiningTable` and overlay queued mutations on the displayed data so the UI shows the user's intended state after a page refresh.

## Work

### Modify `src/pages/DiningPage.vue`

**New import:**

```typescript
import { useMutationQueueStore } from 'stores/mutation-queue-store';
```

**In setup:**

```typescript
const mutationQueueStore = useMutationQueueStore();
```

**Overlay queued mutations on rows:**

Replace the simple `computed(() => data.value ?? [])` with:

```typescript
const rows = computed(() => {
  const baseRows = data.value ?? [];
  const queued = mutationQueueStore.queuedMutations;
  if (queued.length === 0) return baseRows;

  return baseRows.map((row) => {
    const mutation = queued.find((m) => m.memberId === row.memberId);
    return mutation ? { ...row, status: mutation.newStatus } : row;
  });
});
```

This ensures that after a page refresh, if queued mutations exist in IndexedDB, the displayed status reflects the user's last toggle (not the stale server state).

**Pass new props to DiningTable:**

```html
<DiningTable
  :rows="rows"
  :loading="isPending"
  :pending-member-ids="pendingMemberIds"
  :queued-member-ids="mutationQueueStore.queuedMemberIds"
  :syncing-member-ids="mutationQueueStore.syncingMemberIds"
  @toggle-status="handleToggle"
/>
```

## Files

| File | Action |
|------|--------|
| `src/pages/DiningPage.vue` | Modify |

## Verification

- [ ] **Online:** No change in behaviour — `queuedMutations` is empty, so rows pass through unchanged
- [ ] **Offline overlay:** Go offline → toggle Pemberton to "Dining" → refresh page → Pemberton still shows "Dining" with clock icon (not the server's original "Not Dining")
- [ ] **Badge counts update:** The dining/not-dining/undecided badge counts reflect the overlaid state
- [ ] TypeScript compiles with no errors
