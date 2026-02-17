<template>
  <q-page padding>
    <h1 class="page-title">Festive Board Dining</h1>

    <div v-if="isPending" role="status">
      <q-skeleton type="rect" height="44px" class="q-mb-sm" />
      <q-skeleton type="rect" height="300px" />
    </div>

    <q-banner v-else-if="error" type="negative" role="alert" class="q-mb-md">
      Failed to load dining data. Check that PocketBase is running.
    </q-banner>

    <template v-else-if="rows.length > 0">
      <div class="summary-chips q-mb-sm" aria-live="polite">
        <q-chip outline color="green-9" icon="check_circle" size="md">{{ diningCount }} dining</q-chip>
        <q-chip outline color="blue-grey-8" icon="cancel" size="md">{{ notDiningCount }} not dining</q-chip>
        <q-chip outline color="grey-7" icon="help_outline" size="md">{{ undecidedCount }} undecided</q-chip>
      </div>

      <div class="q-mb-md text-caption text-grey-7" role="status" aria-live="polite">
        {{ lastSyncedText }}
      </div>

      <DiningTable
        :rows="rows"
        :loading="isPending"
        :pending-member-ids="pendingMemberIds"
        :queued-member-ids="mutationQueueStore.queuedMemberIds"
        :syncing-member-ids="mutationQueueStore.syncingMemberIds"
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
import { useMutationQueueStore } from 'stores/mutation-queue-store';
import { formatTimeAgo } from 'src/utils/time';
import DiningTable from 'components/DiningTable.vue';
import type { DiningStatus } from 'src/services/types';

const route = useRoute();
const lodgeId = computed(() => route.params.lodgeId as string);

const { data, error, isPending } = useDiningDashboardQuery(lodgeId);
const { mutate, pendingMemberIds } = useDiningMutation(lodgeId);

const { lastSyncedAt } = storeToRefs(useLodgeStore());
const mutationQueueStore = useMutationQueueStore();

const rows = computed(() => {
  const baseRows = data.value ?? [];
  const queued = mutationQueueStore.queuedMutations;
  if (queued.length === 0) return baseRows;

  return baseRows.map((row) => {
    const mutation = queued.find((m) => m.memberId === row.memberId);
    return mutation ? { ...row, status: mutation.newStatus } : row;
  });
});

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
  // Accessing minuteTick registers it as a dependency of this computed,
  // so the text re-evaluates every 60s when the interval increments it.
  // `void` discards the value to satisfy ESLint's no-unused-expressions rule.
  void minuteTick.value;
  if (!lastSyncedAt.value) return 'Not yet synced';
  return `Last updated: ${formatTimeAgo(lastSyncedAt.value)}`;
});

function handleToggle(memberId: string, newStatus: DiningStatus, diningRecordId: string | null) {
  mutate({ memberId, diningRecordId, newStatus });
}
</script>

<style lang="scss" scoped>
.page-title {
  font-size: 2rem;
  font-weight: 400;
  margin: 0 0 16px;
}

.summary-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

@media (max-width: 599px) {
  .page-title {
    font-size: 1.5rem;
  }

  .summary-chips {
    gap: 2px;
  }
}
</style>
