<template>
  <PasswordGate v-if="!authed" @authed="onAuthed" />
  <div v-else-if="noteStore.loading" class="loading-screen">
    <div class="spinner"></div>
    <p>正在加载云端数据...</p>
  </div>
  <div v-else-if="noteStore.loadError" class="loading-screen">
    <p class="load-error">加载失败：{{ noteStore.loadError }}</p>
    <button class="btn-primary" @click="noteStore.loadFromCloud">重试</button>
  </div>
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
import { useNoteStore } from '@/stores/noteStore';

const authed = ref(sessionStorage.getItem('oj-notes-authed') === '1');
const noteStore = useNoteStore();

function onAuthed() {
  authed.value = true;
  noteStore.loadFromCloud();
}

// 如果已认证（刷新页面），自动加载云端数据
if (authed.value && noteStore.loading) {
  noteStore.loadFromCloud();
}
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

.loading-screen {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  color: var(--color-text-secondary);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.load-error {
  color: var(--color-danger);
  font-size: 15px;
}
</style>
