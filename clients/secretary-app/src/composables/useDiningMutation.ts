import { computed, ref, toValue, type MaybeRefOrGetter } from 'vue';
import { useMutation, useQueryCache } from '@pinia/colada';
import {
  updateDiningStatus,
  createDiningRecord,
} from 'src/services/dining-repository';
import type { DiningEntry, DiningStatus, DiningTableRow } from 'src/services/types';

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
  const pendingMemberIds = ref(new Set<string>());

  function queryKey() {
    return ['dining-dashboard', toValue(lodgeId)];
  }

  const { mutate, ...rest } = useMutation<DiningEntry, ToggleVars, Error, RollbackContext>({
    mutation: async ({ diningRecordId, memberId, newStatus }) => {
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
