<template>
  <PasswordGate v-if="!authed" @authed="onAuthed" />
  <div v-else-if="noteStore.loading" class="loading-screen">
    <div class="spinner"></div>
    <p>正在加载云端数据...</p>
  </div>
  <div v-else-if="noteStore.loadError" class="loading-screen">
    <p class="load-error">云端加载失败：{{ noteStore.loadError }}</p>
    <button class="btn-primary" @click="noteStore.loadFromCloud">重试</button>
  </div>
  <div v-else id="app-root">
    <Sidebar />
    <AppHeader />
    <main class="main-content">
      <router-view />
    </main>
    <ImportModal />
    <div v-if="noteStore.saving" class="save-indicator">
      <div class="save-spinner"></div>
      <span>保存中...</span>
    </div>
    <div v-if="noteStore.saveError && !noteStore.saving" class="save-error-toast">
      <span>云端保存失败：{{ noteStore.saveError }}</span>
      <button @click="noteStore.retrySync">重试保存</button>
    </div>
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

// 已认证时（刷新页面）自动加载
if (authed.value && noteStore.loading) {
  noteStore.loadFromCloud();
}
</script>

<style scoped>
#app-root {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
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

.save-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
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

.save-indicator {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--color-text);
  color: #fff;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: var(--shadow-lg);
  z-index: 500;
}

.save-error-toast {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--color-danger);
  color: #fff;
  padding: 10px 16px;
  border-radius: var(--radius);
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: var(--shadow-lg);
  z-index: 500;
}

.save-error-toast button {
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
}
</style>
