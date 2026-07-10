<template>
  <div class="card" @mouseenter="hover = true" @mouseleave="hover = false">
    <div class="card-header">
      <div class="card-title">{{ trick.title }}</div>
      <div v-if="hover || isEditing" class="card-actions">
        <button class="btn-icon" @click="startEdit" title="修改">✏️</button>
        <button class="btn-icon danger" @click="handleDelete" title="删除">🗑️</button>
      </div>
    </div>

    <div v-if="!isEditing" class="card-body">
      <div class="description">{{ trick.description }}</div>
    </div>

    <div v-else class="card-body edit-mode">
      <input v-model="editForm.title" placeholder="标题" />
      <textarea v-model="editForm.description" placeholder="描述" rows="4"></textarea>
      <div class="edit-actions">
        <button class="btn-primary" @click="saveEdit">保存</button>
        <button class="btn-secondary" @click="cancelEdit">取消</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { Trick } from '@/types';
import { useNoteStore } from '@/stores/noteStore';
import { useUIStore } from '@/stores/uiStore';

const props = defineProps<{ trick: Trick }>();

const noteStore = useNoteStore();
const uiStore = useUIStore();

const hover = ref(false);
const isEditing = ref(false);
const editForm = ref({ title: props.trick.title, description: props.trick.description });

function startEdit() {
  isEditing.value = true;
}

function cancelEdit() {
  editForm.value = { title: props.trick.title, description: props.trick.description };
  isEditing.value = false;
}

function saveEdit() {
  noteStore.updateTrick(uiStore.currentDate, props.trick.id, editForm.value);
  isEditing.value = false;
}

function handleDelete() {
  if (confirm(`删除 Trick "${props.trick.title}"？`)) {
    noteStore.deleteTrick(uiStore.currentDate, props.trick.id);
  }
}
</script>