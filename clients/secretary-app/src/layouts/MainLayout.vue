<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-toolbar-title>Festive Board Manager</q-toolbar-title>
        <q-badge
          :color="isRealtimeConnected ? 'positive' : 'warning'"
          :label="isRealtimeConnected ? 'Live' : 'Offline'"
        />
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useQueryCache } from '@pinia/colada';
import { useRealtimeSync } from 'src/composables/useRealtimeSync';
import { useLodgeStore } from 'stores/lodge-store';

const lodgeStore = useLodgeStore();
const { isRealtimeConnected } = storeToRefs(lodgeStore);

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
</script>
