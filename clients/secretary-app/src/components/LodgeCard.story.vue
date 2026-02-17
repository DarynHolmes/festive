<script setup lang="ts">
import LodgeCard from './LodgeCard.vue'
</script>

<template>
  <Story title="LodgeCard">
    <Variant title="Default">
      <LodgeCard name="Unity Lodge No. 132" province="Metropolitan Grand Lodge" />
    </Variant>

    <Variant title="With meeting location">
      <LodgeCard
        name="Unity Lodge No. 132"
        province="Metropolitan Grand Lodge"
        meeting-location="Freemasons' Hall, Great Queen Street, London"
      />
    </Variant>

    <Variant title="With actions slot">
      <LodgeCard
        name="Unity Lodge No. 132"
        province="Metropolitan Grand Lodge"
        meeting-location="Freemasons' Hall, Great Queen Street, London"
      >
        <template #actions>
          <q-btn flat color="primary" label="View Meetings" />
        </template>
      </LodgeCard>
    </Variant>
  </Story>
</template>
