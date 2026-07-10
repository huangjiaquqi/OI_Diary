<template>
  <PasswordGate v-if="!authed" @authed="authed = true" />
  <div v-else id="app-root">
    <Sidebar />
    <AppHeader />
    <main class="main-content">
      <router-view />
    </main>
    <ImportModal />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import AppHeader from '@/components/layout/AppHeader.vue';
import Sidebar from '@/components/layout/Sidebar.vue';
import ImportModal from '@/components/modals/ImportModal.vue';
import PasswordGate from '@/components/common/PasswordGate.vue';

const authed = ref(sessionStorage.getItem('oj-notes-authed') === '1');
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
