# Task 5: Offline Interception in useDiningMutation

## Summary

Modify `useDiningMutation` to intercept mutations when offline. Instead of calling PocketBase (which would fail), it enqueues the mutation in IndexedDB and returns a synthetic success so the existing optimistic update lifecycle proceeds normally.

## Work

### Modify `src/composables/useDiningMutation.ts`

**New imports:**

- `useLodgeStore` (already available)
- `enqueueMutation`, `getQueuedMemberIds` from `src/services/mutation-queue`
- `useMutationQueueStore` from `stores/mutation-queue-store`

**Change inside the `mutation` function:**

Add a guard at the top of the `mutation` async function:

```typescript
// OFFLINE PATH
if (lodgeStore.connectionStatus !== 'connected') {
  await enqueueMutation({
    memberId,
    diningRecordId,
    lodgeId: toValue(lodgeId),
    newStatus,
    queuedAt: new Date().toISOString(),
  });
  // Refresh store so UI shows clock icon
  mutationQueueStore.setQueuedState(
    await getQueuedMemberIds(),
    await getAllMutations(),
  );
  // Return synthetic entry so onSuccess patches the cache
  return {
    id: diningRecordId ?? `pending_${memberId}`,
    lodgeId: toValue(lodgeId),
    memberId,
    meetingDate: new Date().toISOString(),
    status: newStatus,
    updatedBy: 'secretary',
  };
}
// ONLINE PATH (existing code, unchanged)
```

**What stays unchanged:**

- `onMutate` — still adds to `pendingMemberIds`, still patches cache optimistically
- `onSuccess` — still patches cache with the returned entry (synthetic or real)
- `onError` — never triggered for offline mutations (synthetic success)
- `onSettled` — still removes from `pendingMemberIds` (correct, because member immediately appears in `queuedMemberIds` instead)

## Files

| File | Action |
|------|--------|
| `src/composables/useDiningMutation.ts` | Modify |

## Verification

- [ ] **Online flow unchanged:** Toggle status while connected → spinner appears → resolves → no clock icon
- [ ] **Offline flow:** Go offline in DevTools → toggle status → UI updates optimistically → clock icon appears (once Task 6 is done) → no error in console
- [ ] Check IndexedDB in DevTools: mutation appears in `festive-board-queue`
- [ ] Toggle same member again while offline → only one entry in IndexedDB (collapsed)
- [ ] Existing unit/E2E tests still pass
