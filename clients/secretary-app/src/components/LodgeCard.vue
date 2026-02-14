<template>
  <q-card class="q-mb-md">
    <q-card-section>
      <div class="text-h6">{{ name }}</div>
      <div class="text-subtitle2">{{ province }}</div>
    </q-card-section>
    <q-card-section v-if="meetingLocation">
      <div class="text-body2">
        <q-icon name="place" size="xs" class="q-mr-xs" />
        {{ meetingLocation }}
      </div>
    </q-card-section>
    <q-card-actions v-if="$slots.actions" align="right">
      <slot name="actions" />
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
interface Props {
  name: string;
  province: string;
  meetingLocation?: string;
}

defineProps<Props>();
</script>
