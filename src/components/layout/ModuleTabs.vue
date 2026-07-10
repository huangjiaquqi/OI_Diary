<template>
  <div class="module-tabs">
    <button
      v-for="tab in tabs"
      :key="tab.key"
      :class="['module-tab', { active: uiStore.currentModule === tab.key }]"
      @click="uiStore.setModule(tab.key)"
    >
      {{ tab.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { useUIStore } from '@/stores/uiStore';

const uiStore = useUIStore();

const tabs = [
  { key: 'diary' as const, label: '日记' },
  { key: 'tricks' as const, label: 'Tricks' },
  { key: 'problems' as const, label: '思路速览' },
  { key: 'knowledge' as const, label: '知识点' },
];
</script>