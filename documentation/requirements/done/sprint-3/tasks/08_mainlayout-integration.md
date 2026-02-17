# Task 8: MainLayout — Queue Init + Realtime Filtering + Accessibility

## Summary

Wire up the queue composable in MainLayout, filter realtime events for queued members, and add accessibility announcements for connection state changes.

## Work

### Modify `src/layouts/MainLayout.vue`

**1. Initialize the queue composable:**

```typescript
import { useMutationQueue } from 'src/composables/useMutationQueue';
import { useMutationQueueStore } from 'stores/mutation-queue-store';

useMutationQueue(); // Activates watcher on connectionStatus
const mutationQueueStore = useMutationQueueStore();
```

**2. Filter realtime events for queued members:**

Update the `dining_records` realtime subscription to skip cache invalidation for members in the queue:

```typescript
useRealtimeSync({
  collection: 'dining_records',
  onEvent: (event) => {
    const memberId = event.record?.member_id as string | undefined;
    if (memberId && mutationQueueStore.queuedMemberIds.has(memberId)) {
      return; // Skip — local change takes precedence
    }
    void queryCache.invalidateQueries({ key: ['dining_records'] });
    void queryCache.invalidateQueries({ key: ['dining-dashboard'] });
  },
});
```

**3. Add accessibility announcements:**

Add an `aria-live` region in the template:

```html
<div class="sr-only" aria-live="assertive" aria-atomic="true">
  {{ connectionAnnouncement }}
</div>
```

```typescript
const connectionAnnouncement = computed(() => {
  if (connectionStatus.value === 'offline') {
    return 'Connection lost. Changes will be saved locally.';
  }
  if (connectionStatus.value === 'connected'
      && mutationQueueStore.queuedMemberIds.size > 0) {
    return 'Connection restored. Syncing changes.';
  }
  return '';
});
```

Add `.sr-only` CSS class if not already provided by Quasar:

```scss
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}
```

## Files

| File | Action |
|------|--------|
| `src/layouts/MainLayout.vue` | Modify |

## Verification

- [ ] **Queue initializes on app start:** Open app, check Vue Devtools → `mutation-queue` store is initialized
- [ ] **Realtime filtering:** Have two browser tabs open. Tab A is offline with queued mutations. Tab B changes the same member. When Tab A reconnects, its queued change takes precedence (not overwritten by Tab B's realtime event)
- [ ] **Accessibility:** Use a screen reader (or inspect the `aria-live` region) → announces "Connection lost. Changes will be saved locally" when going offline, and "Connection restored. Syncing changes" when coming back online with queued items
- [ ] Existing E2E tests still pass
