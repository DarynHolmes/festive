import { defineStore, acceptHMRUpdate } from 'pinia';
import { ref, computed } from 'vue';
import type { QueuedDiningMutation } from 'src/services/mutation-queue';

/**
 * Reactive projection of the IndexedDB mutation queue.
 *
 * Three sets track each mutation's lifecycle:
 *   queuedMemberIds  — waiting for connection (clock icon)
 *   syncingMemberIds  — being sent to server (spinner icon)
 *   (neither)          — synced or never queued (no icon)
 *
 * `queuedMutations` holds full mutation data for the DiningPage overlay
 * (shows the user's intended status after a page refresh while offline).
 */
export const useMutationQueueStore = defineStore('mutation-queue', () => {
  const queuedMemberIds = ref(new Set<string>());
  const syncingMemberIds = ref(new Set<string>());
  const queuedMutations = ref<QueuedDiningMutation[]>([]);

  function setQueuedState(
    ids: Set<string>,
    mutations: QueuedDiningMutation[],
  ) {
    queuedMemberIds.value = ids;
    queuedMutations.value = mutations;
  }

  function addSyncing(memberId: string) {
    syncingMemberIds.value = new Set([...syncingMemberIds.value, memberId]);
  }

  function removeQueued(memberId: string) {
    const nextIds = new Set(queuedMemberIds.value);
    nextIds.delete(memberId);
    queuedMemberIds.value = nextIds;
    queuedMutations.value = queuedMutations.value.filter(
      (m) => m.memberId !== memberId,
    );
  }

  function removeSyncing(memberId: string) {
    const next = new Set(syncingMemberIds.value);
    next.delete(memberId);
    syncingMemberIds.value = next;
  }

  function clear() {
    queuedMemberIds.value = new Set();
    syncingMemberIds.value = new Set();
    queuedMutations.value = [];
  }

  return {
    queuedMemberIds: computed(() => queuedMemberIds.value),
    syncingMemberIds: computed(() => syncingMemberIds.value),
    queuedMutations: computed(() => queuedMutations.value),
    setQueuedState,
    addSyncing,
    removeQueued,
    removeSyncing,
    clear,
  };
});

// Pinia HMR: preserve store state across hot-reloads in dev.
// import.meta.hot is only defined in dev mode — tree-shaken in production.
if (import.meta.hot) {
  import.meta.hot.accept(
    acceptHMRUpdate(useMutationQueueStore, import.meta.hot),
  );
}
