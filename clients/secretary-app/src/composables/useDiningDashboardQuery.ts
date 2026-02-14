import { type MaybeRefOrGetter, toValue } from 'vue';
import { useQuery } from '@pinia/colada';
import { pb } from 'src/services/pocketbase';
import { toMember, toDiningEntry, mergeMembersWithDining } from 'src/services/mappers';
import type { MemberRecord, DiningRecord } from 'src/services/types';

export function useDiningDashboardQuery(lodgeId: MaybeRefOrGetter<string>) {
  return useQuery({
    key: () => ['dining-dashboard', toValue(lodgeId)],
    query: async () => {
      const id = toValue(lodgeId);

      const [memberRecords, diningRecords] = await Promise.all([
        pb.collection('members').getFullList<MemberRecord>({
          filter: `lodge_id = "${id}"`,
          sort: 'last_name',
        }),
        pb.collection('dining_records').getFullList<DiningRecord>({
          filter: `lodge_id = "${id}"`,
        }),
      ]);

      const members = memberRecords.map(toMember);
      const dining = diningRecords.map(toDiningEntry);

      return mergeMembersWithDining(members, dining);
    },
    enabled: () => !!toValue(lodgeId),
  });
}
