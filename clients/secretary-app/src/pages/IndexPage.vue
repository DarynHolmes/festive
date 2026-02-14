<template>
  <q-page padding>
    <h1 class="text-h4">Lodge Dashboard</h1>

    <div v-if="isPending" role="status">
      <q-spinner-dots size="40px" aria-label="Loading lodges" />
    </div>

    <q-banner v-else-if="error" type="negative" role="alert" class="q-mb-md">
      Failed to load lodge data. Check that PocketBase is running.
    </q-banner>

    <template v-else-if="data && data.length > 0">
      <LodgeCard
        v-for="lodge in data"
        :key="lodge.id"
        :name="lodge.name"
        :province="lodge.province"
        :meeting-location="lodge.meetingLocation"
      >
        <template #actions>
          <q-btn
            flat
            color="primary"
            label="Manage Dining"
            :to="{ name: 'dining', params: { lodgeId: lodge.id } }"
          />
        </template>
      </LodgeCard>
    </template>

    <p v-else>No lodges found. Add a lodge via the PocketBase admin panel.</p>
  </q-page>
</template>

<script setup lang="ts">
import { useLodgesQuery } from 'src/composables/useLodgesQuery';
import LodgeCard from 'components/LodgeCard.vue';

const { data, error, isPending } = useLodgesQuery();
</script>
