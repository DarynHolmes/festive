# Task 3: Mutation Queue Store

## Summary

Create a Pinia store that holds reactive queue state. This bridges the IndexedDB service (non-reactive) with Vue components that need to read queue state. Follows the existing `useLodgeStore` pattern.

## Work

### `src/stores/mutation-queue-store.ts`

**State:**

| Ref | Type | Purpose |
|-----|------|---------|
| `queuedMemberIds` | `Set<string>` | Member IDs with pending offline mutations |
| `syncingMemberIds` | `Set<string>` | Member IDs currently being uploaded |
| `queuedMutations` | `QueuedDiningMutation[]` | Full mutation array (for overlaying on display data after refresh) |

**Methods:**

- `setQueuedState(ids: Set<string>, mutations: QueuedDiningMutation[])` — bulk update after IndexedDB read
- `addSyncing(memberId)` / `removeSyncing(memberId)` — manage syncing set
- `clear()` — reset all state

Include HMR support (`acceptHMRUpdate`) as per existing stores.

## Files

| File | Action |
|------|--------|
| `src/stores/mutation-queue-store.ts` | **New** |

## Verification

- [ ] TypeScript compiles with no errors
- [ ] Vue Devtools shows the `mutation-queue` store with correct initial state (empty sets)
