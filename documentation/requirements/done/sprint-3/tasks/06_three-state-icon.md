# Task 6: Three-State Icon in DiningTable

## Summary

Update `DiningTable.vue` to show three icon states per row: queued (clock), syncing (spinner), or idle (spacer). Currently there's only a single sync spinner.

## Work

### Modify `src/components/DiningTable.vue`

**New props:**

```typescript
interface Props {
  rows: DiningTableRow[];
  loading?: boolean;
  pendingMemberIds?: Set<string>;
  queuedMemberIds?: Set<string>;
  syncingMemberIds?: Set<string>;
}
```

**Replace the single `q-icon` with three states:**

```html
<!-- Queued: clock icon (offline, waiting for connection) -->
<q-icon
  v-if="queuedMemberIds.has(props.row.memberId)"
  name="schedule"
  color="amber-8"
  size="sm"
  class="q-ml-sm"
  aria-label="Queued for sync"
/>

<!-- Syncing: spinning icon (uploading to server) -->
<q-icon
  v-else-if="syncingMemberIds.has(props.row.memberId) || pendingMemberIds.has(props.row.memberId)"
  name="sync"
  color="grey-6"
  size="sm"
  class="q-ml-sm syncing-icon"
  aria-label="Syncing changes"
/>

<!-- Spacer: maintain layout when no icon -->
<span v-else class="q-ml-sm" style="width: 24px; display: inline-block;" aria-hidden="true" />
```

**Remove** the `syncing-icon--hidden` CSS class (no longer needed — replaced by `v-if`/`v-else`).

**Keep** the `.syncing-icon` spin animation and `@keyframes spin`.

## Files

| File | Action |
|------|--------|
| `src/components/DiningTable.vue` | Modify |

## Verification

- [ ] **Online mutation:** Toggle status → spinning sync icon appears → disappears on settle
- [ ] **Offline mutation:** Toggle status while offline → amber clock icon appears with "schedule" Material icon
- [ ] **Layout stability:** No layout shift when icon state changes (spacer maintains width)
- [ ] **Accessibility:** Inspect clock icon → has `aria-label="Queued for sync"`. Inspect spinner → has `aria-label="Syncing changes"`. Inspect spacer → has `aria-hidden="true"`.
- [ ] Existing E2E tests still pass (pending sync icon test uses `getByLabel('Syncing changes')` which is preserved)
