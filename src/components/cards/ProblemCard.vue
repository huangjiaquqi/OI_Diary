<template>
  <div class="card" @mouseenter="hover = true" @mouseleave="hover = false">
    <div class="card-header">
      <div class="card-title">
        <span class="difficulty-dot" :style="{ background: color }"></span>
        <span class="problem-id">{{ problem.id }}</span>
        <span class="difficulty-label">{{ DIFFICULTY_MAP[problem.difficulty].label }}</span>
      </div>
      <div v-if="hover || isEditing" class="card-actions">
        <button class="btn-icon" @click="startEdit" title="修改">✏️</button>
        <button class="btn-icon btn-delete" @click="handleDelete" title="删除">✕</button>
      </div>
    </div>

    <div v-if="!isEditing" class="card-body">
      <div class="overview markdown-body" v-html="renderedOverview"></div>
      <div class="idea markdown-body" v-html="renderedIdea"></div>
      <div v-if="problem.gain" class="gain markdown-body" v-html="renderedGain"></div>
    </div>

    <div v-else class="card-body edit-mode">
      <input v-model="editForm.overview" placeholder="题面概览" />
      <textarea v-model="editForm.idea" placeholder="思路概况" rows="3"></textarea>
      <textarea v-model="editForm.gain" placeholder="收获（可选）" rows="2"></textarea>
      <div class="edit-actions">
        <button class="btn-primary" @click="saveEdit">保存</button>
        <button class="btn-secondary" @click="cancelEdit">取消</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { ProblemBrief } from '@/types';
import { DIFFICULTY_MAP } from '@/types';
import { useNoteStore } from '@/stores/noteStore';
import { useUIStore } from '@/stores/uiStore';
import { renderMarkdown } from '@/utils/markdown';

const props = defineProps<{ problem: ProblemBrief }>();

const noteStore = useNoteStore();
const uiStore = useUIStore();

const hover = ref(false);
const isEditing = ref(false);
const editForm = ref({
  overview: props.problem.overview,
  idea: props.problem.idea,
  gain: props.problem.gain || '',
});

const color = computed(() => DIFFICULTY_MAP[props.problem.difficulty].color);
const renderedOverview = computed(() => renderMarkdown(props.problem.overview));
const renderedIdea = computed(() => renderMarkdown(props.problem.idea));
const renderedGain = computed(() => (props.problem.gain ? renderMarkdown(props.problem.gain) : ''));

function startEdit() {
  isEditing.value = true;
}

function cancelEdit() {
  editForm.value = {
    overview: props.problem.overview,
    idea: props.problem.idea,
    gain: props.problem.gain || '',
  };
  isEditing.value = false;
}

function saveEdit() {
  noteStore.updateProblem(uiStore.currentDate, props.problem.id, editForm.value);
  isEditing.value = false;
}

function handleDelete() {
  if (confirm(`删除题目 ${props.problem.id}？`)) {
    noteStore.deleteProblem(uiStore.currentDate, props.problem.id);
  }
}
</script>