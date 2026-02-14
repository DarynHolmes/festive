import { useQuery } from '@pinia/colada';
import { pb } from 'src/services/pocketbase';
import { toLodge } from 'src/services/mappers';
import type { LodgeRecord } from 'src/services/types';

export function useLodgesQuery() {
  return useQuery({
    key: ['lodges'],
    query: async () => {
      const records = await pb.collection('lodges').getFullList<LodgeRecord>();
      return records.map(toLodge);
    },
  });
}
