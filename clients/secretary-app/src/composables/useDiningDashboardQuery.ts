import { type MaybeRefOrGetter, toValue } from 'vue';
import { useQuery } from '@pinia/colada';
import { fetchDiningDashboard } from 'src/services/dining-repository';

export function useDiningDashboardQuery(lodgeId: MaybeRefOrGetter<string>) {
  return useQuery({
    key: () => ['dining-dashboard', toValue(lodgeId)],
    query: () => fetchDiningDashboard(toValue(lodgeId)),
    enabled: () => !!toValue(lodgeId),
  });
}
