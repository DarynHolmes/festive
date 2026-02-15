import { defineStore, acceptHMRUpdate } from 'pinia';
import { ref, computed } from 'vue';
import type { Lodge } from 'src/services/types';

export type ConnectionStatus = 'connected' | 'reconnecting' | 'offline';

export const useLodgeStore = defineStore('lodge', () => {
  const currentLodge = ref<Lodge | null>(null);
  const connectionStatus = ref<ConnectionStatus>('offline');
  const lastSyncedAt = ref<Date | null>(null);

  const hasLodge = computed(() => currentLodge.value !== null);
  const lodgeName = computed(() => currentLodge.value?.name ?? '');
  const isRealtimeConnected = computed(() => connectionStatus.value === 'connected');

  function setCurrentLodge(lodge: Lodge) {
    currentLodge.value = lodge;
  }

  function clearCurrentLodge() {
    currentLodge.value = null;
  }

  function setConnectionStatus(status: ConnectionStatus) {
    connectionStatus.value = status;
  }

  function setLastSyncedAt(date: Date) {
    lastSyncedAt.value = date;
  }

  return {
    currentLodge,
    connectionStatus,
    lastSyncedAt,
    isRealtimeConnected,
    hasLodge,
    lodgeName,
    setCurrentLodge,
    clearCurrentLodge,
    setConnectionStatus,
    setLastSyncedAt,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useLodgeStore, import.meta.hot));
}
