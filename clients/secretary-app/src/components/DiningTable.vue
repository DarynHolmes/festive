<template>
  <q-table
    :rows="rows"
    :columns="columns"
    row-key="memberId"
    flat
    :loading="loading"
    hide-pagination
    :rows-per-page-options="[0]"
    :visible-columns="visibleColumns"
    :aria-label="`Dining status for ${rows.length} members`"
  >
    <template #body="props">
      <q-tr :props="props" :class="[`row-${props.row.status}`, { 'row-active': activeMenuMemberId === props.row.memberId }]">
        <q-td v-for="col in props.cols" :key="col.name" :props="props">
          <template v-if="col.name === 'status'">
            <div class="text-center">
              <q-btn
                unelevated
                rounded
                no-caps
                :color="getStatusConfig(props.row).color"
                :text-color="getStatusConfig(props.row).textColor"
                :icon="getStatusConfig(props.row).icon"
                :label="getStatusConfig(props.row).label"
                class="status-chip"
                :aria-label="`${getStatusConfig(props.row).label} — tap to change dining status for ${props.row.firstName} ${props.row.lastName}`"
                aria-haspopup="menu"
              >
                <q-menu
                  auto-close
                  @before-show="activeMenuMemberId = props.row.memberId"
                  @before-hide="activeMenuMemberId = null"
                >
                  <q-list style="min-width: 180px">
                    <q-item
                      v-for="option in statusOptions"
                      :key="option.value"
                      clickable
                      :active="props.row.status === option.value"
                      :disable="props.row.status === option.value"
                      class="status-menu-item"
                      @click="props.row.status !== option.value && emit('toggle-status', props.row.memberId, option.value, props.row.diningRecordId)"
                    >
                      <q-item-section side>
                        <q-icon
                          :name="statusConfig[option.value].icon"
                          :color="statusConfig[option.value].iconColor"
                          size="sm"
                        />
                      </q-item-section>
                      <q-item-section class="text-body1">{{ option.label }}</q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
                <q-badge
                  v-if="syncingMemberIds.has(props.row.memberId)"
                  floating
                  rounded
                  color="white"
                  class="sync-badge"
                >
                  <q-icon name="sync" color="grey-7" size="18px" class="syncing-icon" aria-label="Syncing changes" />
                </q-badge>
                <q-badge
                  v-else-if="pendingMemberIds.has(props.row.memberId)"
                  floating
                  rounded
                  color="white"
                  class="sync-badge sync-badge--delayed"
                >
                  <q-icon name="sync" color="grey-7" size="18px" class="syncing-icon" aria-label="Syncing changes" />
                </q-badge>
                <q-badge
                  v-else-if="queuedMemberIds.has(props.row.memberId)"
                  floating
                  rounded
                  color="white"
                  class="sync-badge"
                >
                  <q-icon name="schedule" color="amber-8" size="18px" aria-label="Queued for sync" />
                </q-badge>
              </q-btn>
            </div>
          </template>
          <template v-else>{{ col.value }}</template>
        </q-td>
      </q-tr>
    </template>
  </q-table>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useQuasar } from 'quasar';
import type { QTableColumn } from 'quasar';
import type { DiningTableRow, DiningStatus } from 'src/services/types';

interface Props {
  rows: DiningTableRow[];
  loading?: boolean;
  pendingMemberIds?: Set<string>;
  queuedMemberIds?: Set<string>;
  syncingMemberIds?: Set<string>;
}

const {
  pendingMemberIds = new Set<string>(),
  queuedMemberIds = new Set<string>(),
  syncingMemberIds = new Set<string>(),
} = defineProps<Props>();

const emit = defineEmits<{
  'toggle-status': [
    memberId: string,
    newStatus: DiningStatus,
    diningRecordId: string | null,
  ];
}>();

const $q = useQuasar();
const activeMenuMemberId = ref<string | null>(null);
const visibleColumns = computed(() =>
  $q.screen.lt.sm ? ['name', 'status'] : ['rank', 'name', 'status'],
);

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
    sortable: true,
    style: 'width: 160px',
  },
];

const statusOptions: { label: string; value: DiningStatus }[] = [
  { label: 'Dining', value: 'dining' },
  { label: 'Not Dining', value: 'not_dining' },
  { label: 'Undecided', value: 'undecided' },
];

function getStatusConfig(row: DiningTableRow) {
  return statusConfig[row.status];
}

const statusConfig: Record<DiningStatus, {
  label: string;
  color: string;
  textColor: string;
  icon: string;
  iconColor: string;
}> = {
  dining: { label: 'Dining', color: 'green-9', textColor: 'white', icon: 'check_circle', iconColor: 'green-9' },
  not_dining: { label: 'Not Dining', color: 'blue-grey-8', textColor: 'white', icon: 'cancel', iconColor: 'blue-grey-8' },
  undecided: { label: 'Undecided', color: 'grey-7', textColor: 'white', icon: 'help_outline', iconColor: 'grey-7' },
};
</script>

<style lang="scss" scoped>
.row-active {
  outline: 2px solid $primary;
  outline-offset: -2px;
}

.row-dining {
  background-color: rgba(76, 175, 80, 0.06);
}

.row-not_dining {
  background-color: rgba(84, 110, 122, 0.06);
}

.row-undecided {
  background-color: rgba(97, 97, 97, 0.04);
}

.status-chip {
  min-height: 44px;
  width: 160px;
  position: relative;

  :deep(.q-btn__content) {
    justify-content: flex-start;
  }
}

.status-menu-item {
  min-height: 48px;
}

.sync-badge {
  padding: 3px;
  min-height: 0;
  box-shadow: 0 0 3px rgba(0, 0, 0, 0.3), 0 0 0 2px white;
}

// Only delay the sync badge for online mutations (pendingMemberIds) — avoids
// flicker on fast connections. Queue-flush syncs (syncingMemberIds) show instantly
// so the transition from queued clock → syncing spinner has no gap.
.sync-badge--delayed {
  animation: fade-in 0.15s ease-in 300ms both;
}

.syncing-icon {
  animation: spin 1.5s linear infinite;
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@media (max-width: 599px) {
  .status-chip {
    width: 145px;
    min-height: 40px;
    white-space: nowrap;
  }
}
</style>
