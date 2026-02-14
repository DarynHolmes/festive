import { toValue, type MaybeRefOrGetter } from 'vue';
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

  function queryKey() {
    return ['dining-dashboard', toValue(lodgeId)];
  }

  return useMutation<DiningEntry, ToggleVars, Error, RollbackContext>({
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
      const previous = queryCache.getQueryData<DiningTableRow[]>(queryKey());

      queryCache.setQueryData<DiningTableRow[]>(queryKey(), (rows) =>
        (rows ?? []).map((row) =>
          row.memberId === memberId ? { ...row, status: newStatus } : row,
        ),
      );

      return { previous };
    },

    onSuccess() {
      void queryCache.invalidateQueries({ key: queryKey() });
    },

    onError(_error, _vars, context) {
      if (context?.previous) {
        queryCache.setQueryData<DiningTableRow[]>(queryKey(), context.previous);
      }
    },
  });
}
