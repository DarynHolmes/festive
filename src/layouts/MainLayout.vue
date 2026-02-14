<template>
  <q-layout view="lHh Lpr lFf">
    <a
      href="#main-content"
      class="skip-link"
    >
      Skip to content
    </a>

    <q-header
      elevated
      role="banner"
    >
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Toggle navigation menu"
          class="menu-btn"
          @click="toggleDrawer"
        />

        <q-toolbar-title>Festive Board Manager</q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="drawerOpen"
      show-if-above
      bordered
      role="navigation"
      aria-label="Main navigation"
    >
      <q-list>
        <q-item-label header>Navigation</q-item-label>
      </q-list>
    </q-drawer>

    <q-page-container>
      <main id="main-content">
        <router-view />
      </main>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const drawerOpen = ref(false)

function toggleDrawer(): void {
  drawerOpen.value = !drawerOpen.value
}
</script>

<style lang="scss" scoped>
.skip-link {
  position: absolute;
  top: -100%;
  left: 0;
  z-index: 9999;
  padding: 8px 16px;
  background: $primary;
  color: white;
  text-decoration: none;

  &:focus {
    top: 0;
  }
}

.menu-btn {
  min-width: 44px;
  min-height: 44px;
}
</style>
