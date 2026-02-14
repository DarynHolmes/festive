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
      <div class="q-mb-md text-body1" aria-live="polite">
        <q-badge color="positive" class="q-mr-sm">{{ diningCount }} dining</q-badge>
        <q-badge color="negative" class="q-mr-sm">{{ notDiningCount }} not dining</q-badge>
        <q-badge color="grey" class="q-mr-sm">{{ undecidedCount }} undecided</q-badge>
      </div>

      <DiningTable
        :rows="rows"
        :loading="isPending"
        @toggle-status="handleToggle"
      />
    </template>

    <p v-else>No members found for this lodge.</p>
  </q-page>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useDiningDashboardQuery } from 'src/composables/useDiningDashboardQuery';
import { useDiningMutation } from 'src/composables/useDiningMutation';
import DiningTable from 'components/DiningTable.vue';
import type { DiningStatus } from 'src/services/types';

const route = useRoute();
const lodgeId = computed(() => route.params.lodgeId as string);

const { data, error, isPending } = useDiningDashboardQuery(lodgeId);
const { mutate } = useDiningMutation(lodgeId);

const rows = computed(() => data.value ?? []);

const diningCount = computed(() => rows.value.filter((r) => r.status === 'dining').length);
const notDiningCount = computed(() => rows.value.filter((r) => r.status === 'not_dining').length);
const undecidedCount = computed(() => rows.value.filter((r) => r.status === 'undecided').length);

function handleToggle(memberId: string, newStatus: DiningStatus, diningRecordId: string | null) {
  mutate({ memberId, diningRecordId, newStatus });
}
</script>
