<template>
  <div id="app-root">
    <Sidebar />
    <AppHeader />
    <main class="main-content">
      <router-view />
    </main>
    <ImportModal />
  </div>
</template>

<script setup lang="ts">
import AppHeader from '@/components/layout/AppHeader.vue';
import Sidebar from '@/components/layout/Sidebar.vue';
import ImportModal from '@/components/modals/ImportModal.vue';
</script>

<style scoped>
#app-root {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}
</style>