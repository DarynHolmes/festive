# Task 2: IndexedDB Persistence Service + Unit Tests

## Summary

Create a pure TypeScript module that manages a mutation queue in IndexedDB. This is the persistence layer — no Vue dependencies, no reactive state. Co-located unit tests with `fake-indexeddb`.

## Work

### `src/services/mutation-queue.ts`

Database: `festive-board-queue`, object store: `dining-mutations`, auto-increment key.

**Type:**

```typescript
interface QueuedDiningMutation {
  id?: number;              // Auto-increment key
  memberId: string;
  diningRecordId: string | null;
  lodgeId: string;
  newStatus: DiningStatus;
  queuedAt: string;         // ISO timestamp
}
```

**Functions:**

| Function | Behaviour |
|----------|-----------|
| `enqueueMutation(mutation)` | Add to store. **Collapse:** if an entry for the same `memberId` exists (via `by-member` index), delete it first, then add the new one. Only the final toggle survives. |
| `getAllMutations()` | Return all entries, oldest first. |
| `removeMutation(id)` | Delete a specific entry by its auto-generated ID. |
| `getQueuedMemberIds()` | Return a `Set<string>` of all queued member IDs. |
| `clearQueue()` | Empty the entire store. |

**IndexedDB index:** `by-member` on `memberId` — enables the collapse lookup.

**Singleton pattern:** Cache the `openDB` promise so multiple calls don't re-open the database.

### `src/services/mutation-queue.test.ts`

Co-located unit test (vitest). Import `fake-indexeddb/auto` at the top for IndexedDB polyfill.

**Tests:**

- Enqueue stores a mutation and getAllMutations retrieves it
- Enqueue collapses: second mutation for same memberId replaces the first
- Collapse preserves mutations for different memberIds
- removeMutation removes only the targeted entry
- getQueuedMemberIds returns the correct Set
- clearQueue empties the store

## Files

| File | Action |
|------|--------|
| `src/services/mutation-queue.ts` | **New** |
| `src/services/mutation-queue.test.ts` | **New** |

## Verification

- [ ] `pnpm test:unit` — all mutation-queue tests pass
- [ ] TypeScript compiles with no errors (`pnpm build`)
- [ ] Manual: Open browser DevTools → Application → IndexedDB → `festive-board-queue` database appears after first enqueue (can test via console)
