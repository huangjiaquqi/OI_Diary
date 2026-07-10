<template>
  <div class="diary-list">
    <div v-for="pid in diaryIds" :key="pid" class="diary-item">
      <span class="diary-pid">{{ pid }}</span>
      <button class="delete-btn" @click="handleDelete(pid)" title="删除">×</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useNoteStore } from '@/stores/noteStore';
import { useUIStore } from '@/stores/uiStore';

const props = defineProps<{ diaryIds: string[] }>();

const noteStore = useNoteStore();
const uiStore = useUIStore();

function handleDelete(pid: string) {
  if (confirm(`删除题号 ${pid}？`)) {
    noteStore.deleteDiaryItem(uiStore.currentDate, pid);
  }
}
</script>