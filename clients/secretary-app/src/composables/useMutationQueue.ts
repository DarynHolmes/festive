import { watch, onMounted } from 'vue';
import { Notify } from 'quasar';
import { useQueryCache } from '@pinia/colada';
import { useLodgeStore } from 'stores/lodge-store';
import { useMutationQueueStore } from 'stores/mutation-queue-store';
import {
  enqueueMutation,
  getAllMutations,
  removeMutation,
  getQueuedMemberIds,
  type QueuedDiningMutation,
} from 'src/services/mutation-queue';
import {
  updateDiningStatus,
  createDiningRecord,
} from 'src/services/dining-repository';
import type { DiningTableRow } from 'src/services/types';

const INITIAL_RETRY_MS = 1000;
const MAX_RETRY_MS = 30_000;
const MAX_RETRY_ATTEMPTS = 3;

/**
 * Orchestrates the offline mutation queue. Call once from MainLayout.
 *
 * **Lifecycle per mutation:**
 *   queued (clock icon) → syncing (spinner) → removed from store
 *
 * **Flow on reconnect:**
 *   connectionStatus → 'connected' → processQueue()
 *     → for each mutation: syncOne() → PATCH/POST to PocketBase
 *     → patch cache per-mutation (prevents stale flash)
 *     → toast summary → refreshStore() → invalidate queries
 *
 * **Key ordering constraints (learned from defects):**
 * - `syncOne` removes from queued set *before* removing from syncing set,
 *   because the DiningTable checks syncing first — if queued is removed
 *   after syncing, the clock icon briefly reappears.
 * - Cache is patched after each successful sync (not just at the end),
 *   because the overlay in DiningPage reads from `queuedMutations` which
 *   is updated as each mutation syncs — removing the overlay before the
 *   cache is patched causes a flash of stale server data.
 * - Query invalidation in the finally block is guarded by connection
 *   status — if we went offline mid-sync, invalidation triggers a
 *   refetch that fails and replaces good cached data with an error state.
 */
export function useMutationQueue() {
  const lodgeStore = useLodgeStore();
  const queueStore = useMutationQueueStore();
  const queryCache = useQueryCache();
  let processing = false;

  /** Re-sync the Pinia store from IndexedDB (source of truth). */
  async function refreshStore() {
    const [ids, mutations] = await Promise.all([
      getQueuedMemberIds(),
      getAllMutations(),
    ]);
    queueStore.setQueuedState(ids, mutations);
  }

  /** Add a mutation to the queue and update the store. */
  async function enqueue(mutation: Omit<QueuedDiningMutation, 'id'>) {
    await enqueueMutation(mutation);
    await refreshStore();
  }

  /** Send a single mutation to PocketBase (update or create). */
  function replayMutation(mutation: QueuedDiningMutation): Promise<unknown> {
    if (mutation.diningRecordId) {
      return updateDiningStatus(mutation.diningRecordId, mutation.newStatus);
    }
    return createDiningRecord({
      lodgeId: mutation.lodgeId,
      memberId: mutation.memberId,
      status: mutation.newStatus,
    });
  }

  /**
   * Retry a single mutation with exponential backoff.
   * Returns true if the mutation eventually succeeded.
   */
  async function retryWithBackoff(
    mutation: QueuedDiningMutation,
  ): Promise<boolean> {
    let delay = INITIAL_RETRY_MS;

    for (let attempt = 0; attempt < MAX_RETRY_ATTEMPTS; attempt++) {
      await new Promise((r) => setTimeout(r, delay));
      delay = Math.min(delay * 2, MAX_RETRY_MS);

      if (!navigator.onLine) return false;

      try {
        await replayMutation(mutation);
        return true;
      } catch {
        // Continue to next attempt
      }
    }
    return false;
  }

  /**
   * Attempt to sync a single mutation. Returns:
   * - 'synced' if the mutation was successfully sent to the server
   * - 'stop' if processing should halt (offline or retry exhausted)
   */
  async function syncOne(
    mutation: QueuedDiningMutation,
  ): Promise<'synced' | 'stop'> {
    queueStore.addSyncing(mutation.memberId);
    try {
      await replayMutation(mutation);
      await removeMutation(mutation.id!);
      // Remove from queued BEFORE removing from syncing (see ordering note above)
      queueStore.removeQueued(mutation.memberId);
      return 'synced';
    } catch {
      if (!navigator.onLine) return 'stop';

      // Server error (e.g. 500) — retry with backoff
      const retried = await retryWithBackoff(mutation);
      if (!retried) return 'stop';

      await removeMutation(mutation.id!);
      queueStore.removeQueued(mutation.memberId);
      return 'synced';
    } finally {
      queueStore.removeSyncing(mutation.memberId);
    }
  }

  /** Process the queue sequentially, oldest first. */
  async function processQueue() {
    if (processing) return;
    processing = true;

    try {
      const mutations = await getAllMutations();
      if (mutations.length === 0) return;

      let syncedCount = 0;

      for (const mutation of mutations) {
        const result = await syncOne(mutation);
        if (result === 'synced') {
          syncedCount++;
          // Patch cache immediately so the UI stays consistent as the overlay
          // is removed (removeQueued drops the overlay for this member)
          queryCache.setQueryData<DiningTableRow[]>(
            ['dining-dashboard', mutation.lodgeId],
            (rows) => (rows ?? []).map((row) =>
              row.memberId === mutation.memberId
                ? { ...row, status: mutation.newStatus }
                : row,
            ),
          );
        }
        if (result === 'stop') break;
      }

      if (syncedCount > 0) {
        Notify.create({
          type: 'positive',
          message: `Synced ${syncedCount} change${syncedCount !== 1 ? 's' : ''} to the Festive Board`,
          icon: 'cloud_done',
          timeout: 4000,
        });
      }
    } finally {
      // Re-sync store from IndexedDB so any unprocessed mutations
      // (stopped early due to offline or retry exhaustion) reappear.
      await refreshStore();
      // Refetch from server — realtime events were filtered during sync
      // (MainLayout skips invalidation for queued memberIds). Guard with
      // connection check: if we went offline mid-sync, refetching would
      // fail and replace cached data with an error banner.
      if (lodgeStore.connectionStatus === 'connected') {
        void queryCache.invalidateQueries({ key: ['dining-dashboard'] });
      }
      processing = false;
    }
  }

  // Flush queue when connection recovers
  watch(
    () => lodgeStore.connectionStatus,
    (newStatus, oldStatus) => {
      if (newStatus === 'connected' && oldStatus !== 'connected') {
        void processQueue();
      }
    },
  );

  // Load persisted queue on app start / page refresh
  onMounted(() => {
    void refreshStore();
  });

  return { enqueue };
}
