<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-toolbar-title>Festive Board Manager</q-toolbar-title>
        <q-badge
          :color="badgeColor"
          :label="badgeLabel"
          role="status"
          aria-live="polite"
          :aria-label="`Connection status: ${badgeLabel}`"
        />
      </q-toolbar>
    </q-header>

    <q-page-container>
      <q-banner
        v-if="showStalenessWarning"
        class="bg-warning text-white q-mb-none"
        role="alert"
      >
        <template #avatar>
          <q-icon name="cloud_off" color="white" />
        </template>
        You are viewing cached data. Changes will sync once reconnected.
      </q-banner>

      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useQueryCache } from '@pinia/colada';
import { useRealtimeSync } from 'src/composables/useRealtimeSync';
import { useConnectionMonitor } from 'src/composables/useConnectionMonitor';
import { useLodgeStore } from 'stores/lodge-store';

const lodgeStore = useLodgeStore();
const { connectionStatus, lastSyncedAt } = storeToRefs(lodgeStore);

useConnectionMonitor();

const queryCache = useQueryCache();

useRealtimeSync({
  collection: 'lodges',
  onEvent: () => {
    void queryCache.invalidateQueries({ key: ['lodges'] });
  },
});

useRealtimeSync({
  collection: 'dining_records',
  onEvent: () => {
    void queryCache.invalidateQueries({ key: ['dining_records'] });
    void queryCache.invalidateQueries({ key: ['dining-dashboard'] });
  },
});

const STATUS_MAP = {
  connected: { color: 'positive', label: 'Connected' },
  reconnecting: { color: 'amber', label: 'Reconnecting' },
  offline: { color: 'warning', label: 'Offline' },
} as const;

const badgeColor = computed(() => STATUS_MAP[connectionStatus.value].color);
const badgeLabel = computed(() => STATUS_MAP[connectionStatus.value].label);

// Re-evaluate staleness every 30 seconds
const stalenessTick = ref(0);
let stalenessInterval: ReturnType<typeof setInterval> | null = null;

onMounted(() => {
  stalenessInterval = setInterval(() => { stalenessTick.value++; }, 30_000);
});

onUnmounted(() => {
  if (stalenessInterval) clearInterval(stalenessInterval);
});

const FIVE_MINUTES_MS = 5 * 60 * 1000;

const showStalenessWarning = computed(() => {
  void stalenessTick.value;
  if (connectionStatus.value === 'connected') return false;
  if (!lastSyncedAt.value) return true;
  return Date.now() - lastSyncedAt.value.getTime() > FIVE_MINUTES_MS;
});
</script>
