<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-white text-dark">
      <q-toolbar>
        <q-toolbar-title>Festive Board Manager</q-toolbar-title>
        <q-badge
          :color="badgeColor"
          :text-color="badgeTextColor"
          class="connection-badge"
          role="status"
          aria-live="polite"
          :aria-label="`Connection status: ${badgeLabel}`"
        >
          <q-icon :name="badgeIcon" size="14px" class="q-mr-xs" />
          {{ badgeLabel }}
        </q-badge>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <q-banner
        v-if="showStalenessWarning"
        class="bg-warning text-dark q-mb-none"
        role="alert"
      >
        <template #avatar>
          <q-icon name="cloud_off" color="dark" />
        </template>
        You are viewing cached data. Changes will sync once reconnected.
      </q-banner>

      <router-view />
    </q-page-container>

    <div class="sr-only" aria-live="assertive" aria-atomic="true">
      {{ connectionAnnouncement }}
    </div>
  </q-layout>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useQueryCache } from '@pinia/colada';
import { useRealtimeSync } from 'src/composables/useRealtimeSync';
import { useConnectionMonitor } from 'src/composables/useConnectionMonitor';
import { useMutationQueue } from 'src/composables/useMutationQueue';
import { useLodgeStore } from 'stores/lodge-store';
import { useMutationQueueStore } from 'stores/mutation-queue-store';

const lodgeStore = useLodgeStore();
const { connectionStatus, lastSyncedAt } = storeToRefs(lodgeStore);
const mutationQueueStore = useMutationQueueStore();

useConnectionMonitor();
useMutationQueue();

const queryCache = useQueryCache();

useRealtimeSync({
  collection: 'lodges',
  onEvent: () => {
    void queryCache.invalidateQueries({ key: ['lodges'] });
  },
});

useRealtimeSync({
  collection: 'dining_records',
  onEvent: (event) => {
    const memberId = event.record?.member_id as string | undefined;
    if (memberId && mutationQueueStore.queuedMemberIds.has(memberId)) {
      return; // Skip — local queued change takes precedence
    }
    void queryCache.invalidateQueries({ key: ['dining_records'] });
    void queryCache.invalidateQueries({ key: ['dining-dashboard'] });
  },
});

const STATUS_MAP = {
  connected: { color: 'positive', label: 'Connected', textColor: 'white', icon: 'wifi' },
  reconnecting: { color: 'amber', label: 'Reconnecting', textColor: 'white', icon: 'sync' },
  offline: { color: 'warning', label: 'Offline', textColor: 'white', icon: 'wifi_off' },
} as const;

const badgeColor = computed(() => STATUS_MAP[connectionStatus.value].color);
const badgeLabel = computed(() => STATUS_MAP[connectionStatus.value].label);
const badgeTextColor = computed(() => STATUS_MAP[connectionStatus.value].textColor);
const badgeIcon = computed(() => STATUS_MAP[connectionStatus.value].icon);

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
  // Accessing stalenessTick registers it as a dependency of this computed,
  // so the warning re-evaluates every 30s when the interval increments it.
  // `void` discards the value to satisfy ESLint's no-unused-expressions rule.
  void stalenessTick.value;
  if (connectionStatus.value === 'connected') return false;
  if (!lastSyncedAt.value) return true;
  return Date.now() - lastSyncedAt.value.getTime() > FIVE_MINUTES_MS;
});

const connectionAnnouncement = computed(() => {
  if (connectionStatus.value === 'offline') {
    return 'Connection lost. Changes will be saved locally.';
  }
  if (connectionStatus.value === 'connected'
      && mutationQueueStore.queuedMemberIds.size > 0) {
    return 'Connection restored. Syncing changes.';
  }
  return '';
});
</script>

<style scoped>
.connection-badge {
  border: 1px solid rgba(0, 0, 0, 0.12);
  font-weight: 600;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}
</style>
