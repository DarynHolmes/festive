<script setup lang="ts">
import DiningTable from './DiningTable.vue'
import type { DiningTableRow } from 'src/services/types'

const mockRows: DiningTableRow[] = [
  { memberId: 'm1', diningRecordId: 'd1', rank: 'W Bro', firstName: 'James', lastName: 'Whitfield', status: 'dining' },
  { memberId: 'm2', diningRecordId: 'd2', rank: 'Bro', firstName: 'Thomas', lastName: 'Ashworth', status: 'dining' },
  { memberId: 'm3', diningRecordId: 'd3', rank: 'VW Bro', firstName: 'Robert', lastName: 'Hargreaves', status: 'not_dining' },
  { memberId: 'm4', diningRecordId: 'd4', rank: 'Bro', firstName: 'William', lastName: 'Pemberton', status: 'undecided' },
  { memberId: 'm5', diningRecordId: 'd5', rank: 'W Bro', firstName: 'Edward', lastName: 'Thornton', status: 'dining' },
  { memberId: 'm6', diningRecordId: null, rank: 'Bro', firstName: 'George', lastName: 'Caldwell', status: 'undecided' },
  { memberId: 'm7', diningRecordId: 'd7', rank: 'RW Bro', firstName: 'Henry', lastName: 'Bancroft', status: 'not_dining' },
  { memberId: 'm8', diningRecordId: 'd8', rank: 'Bro', firstName: 'Arthur', lastName: 'Marsden', status: 'dining' },
]

const pendingIds = new Set(['m2'])
const queuedIds = new Set(['m4', 'm6', 'm7'])

function onToggle(memberId: string, newStatus: string, diningRecordId: string | null) {
  console.log('toggle-status', { memberId, newStatus, diningRecordId })
}
</script>

<template>
  <Story title="DiningTable">
    <Variant title="Loading">
      <DiningTable :rows="[]" :loading="true" @toggle-status="onToggle" />
    </Variant>

    <Variant title="Empty">
      <DiningTable :rows="[]" :loading="false" @toggle-status="onToggle" />
    </Variant>

    <Variant title="Mixed statuses">
      <DiningTable :rows="mockRows" @toggle-status="onToggle" />
    </Variant>

    <Variant title="Sync badges">
      <DiningTable
        :rows="mockRows"
        :pending-member-ids="pendingIds"
        :queued-member-ids="queuedIds"
        @toggle-status="onToggle"
      />
    </Variant>
  </Story>
</template>
