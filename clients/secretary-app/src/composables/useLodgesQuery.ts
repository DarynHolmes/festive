import { useQuery } from '@pinia/colada';
import { fetchAllLodges } from 'src/services/lodge-repository';

export function useLodgesQuery() {
  return useQuery({
    key: ['lodges'],
    query: fetchAllLodges,
  });
}
