<template>
  <q-page padding>
    <h1 class="text-h4">Festive Board Dining</h1>

    <div v-if="isPending" role="status">
      <q-skeleton type="rect" height="44px" class="q-mb-sm" />
      <q-skeleton type="rect" height="300px" />
    </div>

    <q-banner v-else-if="error" type="negative" role="alert" class="q-mb-md">
      Failed to load dining data. Check that PocketBase is running.
    </q-banner>

    <template v-else-if="rows.length > 0">
      <div class="q-mb-sm text-body1" aria-live="polite">
        <q-badge outline color="green-10" class="q-mr-sm">{{ diningCount }} dining</q-badge>
        <q-badge outline color="red-10" class="q-mr-sm">{{ notDiningCount }} not dining</q-badge>
        <q-badge outline color="grey-8" class="q-mr-sm">{{ undecidedCount }} undecided</q-badge>
      </div>

      <div class="q-mb-md text-caption text-grey-7" role="status" aria-live="polite">
        {{ lastSyncedText }}
      </div>

      <DiningTable
        :rows="rows"
        :loading="isPending"
        :pending-member-ids="pendingMemberIds"
        @toggle-status="handleToggle"
      />
    </template>

    <p v-else>No members found for this lodge.</p>
  </q-page>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useRoute } from 'vue-router';
import { useDiningDashboardQuery } from 'src/composables/useDiningDashboardQuery';
import { useDiningMutation } from 'src/composables/useDiningMutation';
import { useLodgeStore } from 'stores/lodge-store';
import { formatTimeAgo } from 'src/utils/time';
import DiningTable from 'components/DiningTable.vue';
import type { DiningStatus } from 'src/services/types';

const route = useRoute();
const lodgeId = computed(() => route.params.lodgeId as string);

const { data, error, isPending } = useDiningDashboardQuery(lodgeId);
const { mutate, pendingMemberIds } = useDiningMutation(lodgeId);

const { lastSyncedAt } = storeToRefs(useLodgeStore());

const rows = computed(() => data.value ?? []);

const diningCount = computed(() => rows.value.filter((r) => r.status === 'dining').length);
const notDiningCount = computed(() => rows.value.filter((r) => r.status === 'not_dining').length);
const undecidedCount = computed(() => rows.value.filter((r) => r.status === 'undecided').length);

// Re-evaluate "X ago" text every 60 seconds
const minuteTick = ref(0);
let tickInterval: ReturnType<typeof setInterval> | null = null;

onMounted(() => {
  tickInterval = setInterval(() => { minuteTick.value++; }, 60_000);
});

onUnmounted(() => {
  if (tickInterval) clearInterval(tickInterval);
});

const lastSyncedText = computed(() => {
  void minuteTick.value;
  if (!lastSyncedAt.value) return 'Not yet synced';
  return `Last updated: ${formatTimeAgo(lastSyncedAt.value)}`;
});

function handleToggle(memberId: string, newStatus: DiningStatus, diningRecordId: string | null) {
  mutate({ memberId, diningRecordId, newStatus });
}
</script>
