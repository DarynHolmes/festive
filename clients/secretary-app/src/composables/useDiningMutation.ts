import { computed, ref, toValue, type MaybeRefOrGetter } from 'vue';
import { useMutation, useQueryCache } from '@pinia/colada';
import {
  updateDiningStatus,
  createDiningRecord,
} from 'src/services/dining-repository';
import type { DiningEntry, DiningStatus, DiningTableRow } from 'src/services/types';
import { useLodgeStore } from 'stores/lodge-store';
import { useMutationQueueStore } from 'stores/mutation-queue-store';
import {
  enqueueMutation,
  getQueuedMemberIds,
  getAllMutations,
} from 'src/services/mutation-queue';

interface ToggleVars {
  memberId: string;
  diningRecordId: string | null;
  newStatus: DiningStatus;
}

interface RollbackContext {
  previous: DiningTableRow[] | undefined;
}

export function useDiningMutation(lodgeId: MaybeRefOrGetter<string>) {
  const queryCache = useQueryCache();
  const lodgeStore = useLodgeStore();
  const mutationQueueStore = useMutationQueueStore();
  const pendingMemberIds = ref(new Set<string>());

  function queryKey() {
    return ['dining-dashboard', toValue(lodgeId)];
  }

  const { mutate, ...rest } = useMutation<DiningEntry, ToggleVars, Error, RollbackContext>({
    mutation: async ({ diningRecordId, memberId, newStatus }) => {
      // OFFLINE PATH — queue locally and return synthetic success
      if (lodgeStore.connectionStatus !== 'connected') {
        await enqueueMutation({
          memberId,
          diningRecordId,
          lodgeId: toValue(lodgeId),
          newStatus,
          queuedAt: new Date().toISOString(),
        });
        mutationQueueStore.setQueuedState(
          await getQueuedMemberIds(),
          await getAllMutations(),
        );
        return {
          id: diningRecordId ?? `pending_${memberId}`,
          lodgeId: toValue(lodgeId),
          memberId,
          meetingDate: new Date().toISOString(),
          status: newStatus,
          updatedBy: 'secretary',
        };
      }

      // ONLINE PATH — call PocketBase directly
      if (diningRecordId) {
        return updateDiningStatus(diningRecordId, newStatus);
      }

      return createDiningRecord({
        lodgeId: toValue(lodgeId),
        memberId,
        status: newStatus,
      });
    },

    onMutate({ memberId, newStatus }) {
      pendingMemberIds.value = new Set([...pendingMemberIds.value, memberId]);

      const previous = queryCache.getQueryData<DiningTableRow[]>(queryKey());

      queryCache.setQueryData<DiningTableRow[]>(queryKey(), (rows) =>
        (rows ?? []).map((row) =>
          row.memberId === memberId ? { ...row, status: newStatus } : row,
        ),
      );

      return { previous };
    },

    onSuccess(entry, { memberId }) {
      // Patch the cache with the server's record ID rather than refetching.
      // Realtime events handle the authoritative full refresh; a broad
      // invalidateQueries here would race with them and trigger duplicate
      // fetches against the same collection.
      queryCache.setQueryData<DiningTableRow[]>(queryKey(), (rows) =>
        (rows ?? []).map((row) =>
          row.memberId === memberId
            ? { ...row, diningRecordId: entry.id, status: entry.status }
            : row,
        ),
      );
    },

    onError(_error, _vars, context) {
      if (context?.previous) {
        queryCache.setQueryData<DiningTableRow[]>(queryKey(), context.previous);
      }
    },

    onSettled(_data, _error, vars) {
      const next = new Set(pendingMemberIds.value);
      next.delete(vars.memberId);
      pendingMemberIds.value = next;
    },
  });

  return {
    mutate,
    ...rest,
    pendingMemberIds: computed(() => pendingMemberIds.value),
  };
}
