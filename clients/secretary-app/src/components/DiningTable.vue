<template>
  <q-table
    :rows="rows"
    :columns="columns"
    row-key="memberId"
    flat
    dense
    :loading="loading"
    hide-pagination
    :rows-per-page-options="[0]"
    :aria-label="`Dining status for ${rows.length} members`"
  >
    <template #body-cell-status="props">
      <q-td :props="props">
        <q-btn-toggle
          :model-value="props.row.status"
          :options="statusOptions"
          dense
          no-caps
          toggle-color="primary"
          class="dining-toggle"
          :aria-label="`Dining status for ${props.row.firstName} ${props.row.lastName}`"
          @update:model-value="
            (val: DiningStatus) =>
              emit('toggle-status', props.row.memberId, val, props.row.diningRecordId)
          "
        />
      </q-td>
    </template>
  </q-table>
</template>

<script setup lang="ts">
import type { QTableColumn } from 'quasar';
import type { DiningTableRow, DiningStatus } from 'src/services/types';

interface Props {
  rows: DiningTableRow[];
  loading?: boolean;
}

defineProps<Props>();

const emit = defineEmits<{
  'toggle-status': [
    memberId: string,
    newStatus: DiningStatus,
    diningRecordId: string | null,
  ];
}>();

const columns: QTableColumn<DiningTableRow>[] = [
  {
    name: 'rank',
    label: 'Rank',
    field: 'rank',
    align: 'left',
    sortable: true,
    style: 'width: 100px',
  },
  {
    name: 'name',
    label: 'Name',
    field: (row) => `${row.lastName}, ${row.firstName}`,
    align: 'left',
    sortable: true,
  },
  {
    name: 'status',
    label: 'Dining Status',
    field: 'status',
    align: 'center',
  },
];

const statusOptions = [
  { label: 'Dining', value: 'dining' },
  { label: 'Not Dining', value: 'not_dining' },
  { label: 'Undecided', value: 'undecided' },
];
</script>

<style lang="scss" scoped>
.dining-toggle {
  min-height: 44px;
}
</style>
