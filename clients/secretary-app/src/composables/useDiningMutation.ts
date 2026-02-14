import { toValue, type MaybeRefOrGetter } from 'vue';
import { useMutation, useQueryCache } from '@pinia/colada';
import { pb } from 'src/services/pocketbase';
import type { DiningRecord, DiningStatus, DiningTableRow } from 'src/services/types';

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

  return useMutation<DiningRecord, ToggleVars, Error, RollbackContext>({
    mutation: async ({ diningRecordId, memberId, newStatus }) => {
      if (diningRecordId) {
        return pb
          .collection('dining_records')
          .update<DiningRecord>(diningRecordId, { status: newStatus });
      }

      return pb.collection('dining_records').create<DiningRecord>({
        lodge_id: toValue(lodgeId),
        member_id: memberId,
        meeting_date: new Date().toISOString(),
        status: newStatus,
        updated_by: 'secretary',
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
