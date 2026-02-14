import { defineStore, acceptHMRUpdate } from 'pinia';
import { ref, computed } from 'vue';
import type { Lodge } from 'src/services/types';

export const useLodgeStore = defineStore('lodge', () => {
  const currentLodge = ref<Lodge | null>(null);
  const isRealtimeConnected = ref(false);

  const hasLodge = computed(() => currentLodge.value !== null);
  const lodgeName = computed(() => currentLodge.value?.name ?? '');

  function setCurrentLodge(lodge: Lodge) {
    currentLodge.value = lodge;
  }

  function clearCurrentLodge() {
    currentLodge.value = null;
  }

  function setRealtimeConnected(connected: boolean) {
    isRealtimeConnected.value = connected;
  }

  return {
    currentLodge,
    isRealtimeConnected,
    hasLodge,
    lodgeName,
    setCurrentLodge,
    clearCurrentLodge,
    setRealtimeConnected,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useLodgeStore, import.meta.hot));
}
