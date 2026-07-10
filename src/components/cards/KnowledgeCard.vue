<template>
  <div class="card" @mouseenter="hover = true" @mouseleave="hover = false">
    <div class="card-header">
      <div class="card-title">{{ knowledge.title }}</div>
      <div :class="['card-actions', { 'editing-visible': isEditing }]">
        <button class="btn-icon" @click="startEdit" title="修改">✏️</button>
        <button class="btn-icon btn-delete" @click="handleDelete" title="删除">✕</button>
      </div>
    </div>
  
    <div v-if="!isEditing" class="card-body">
      <div class="core-idea markdown-body" v-html="renderedCoreIdea"></div>
      <div v-if="knowledge.code">
        <div
          :class="['code-block markdown-body', { collapsed: !codeExpanded }]"
          v-html="renderedCode"
        ></div>
        <span class="code-toggle" @click="codeExpanded = !codeExpanded">
          {{ codeExpanded ? '收起代码 ▲' : '展开代码 ▼' }}
        </span>
      </div>
      <ul v-if="knowledge.keyPoints.length > 0" class="key-points">
        <li v-for="(kp, idx) in knowledge.keyPoints" :key="idx" v-html="renderedKeyPoint(kp)"></li>
      </ul>
    </div>

    <div v-else class="card-body edit-mode">
      <input v-model="editForm.title" placeholder="标题" />
      <textarea v-model="editForm.coreIdea" placeholder="核心思想" rows="3"></textarea>
      <textarea v-model="editForm.code" placeholder="代码（可选）" rows="4"></textarea>
      <textarea
        v-model="editForm.keyPointsText"
        placeholder="关键点（每行一个，以 - 开头）"
        rows="3"
      ></textarea>
      <div class="edit-actions">
        <button class="btn-primary" @click="saveEdit">保存</button>
        <button class="btn-secondary" @click="cancelEdit">取消</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Knowledge } from '@/types';
import { useNoteStore } from '@/stores/noteStore';
import { useUIStore } from '@/stores/uiStore';
import { renderMarkdown } from '@/utils/markdown';

const props = defineProps<{ knowledge: Knowledge }>();

const noteStore = useNoteStore();
const uiStore = useUIStore();

const hover = ref(false);
const codeExpanded = ref(false);
const isEditing = ref(false);
const editForm = ref({
  title: props.knowledge.title,
  coreIdea: props.knowledge.coreIdea,
  code: props.knowledge.code || '',
  keyPointsText: props.knowledge.keyPoints.map(kp => `- ${kp}`).join('\n'),
});

const renderedCoreIdea = computed(() => renderMarkdown(props.knowledge.coreIdea));
const renderedCode = computed(() => renderMarkdown(props.knowledge.code || ''));

function renderedKeyPoint(kp: string) {
  return renderMarkdown(kp);
}

function startEdit() {
  isEditing.value = true;
}

function cancelEdit() {
  editForm.value = {
    title: props.knowledge.title,
    coreIdea: props.knowledge.coreIdea,
    code: props.knowledge.code || '',
    keyPointsText: props.knowledge.keyPoints.map(kp => `- ${kp}`).join('\n'),
  };
  isEditing.value = false;
}

function saveEdit() {
  const keyPoints = editForm.value.keyPointsText
    .split('\n')
    .map(s => s.trim().replace(/^-\s*/, ''))
    .filter(Boolean);
  noteStore.updateKnowledge(uiStore.currentDate, props.knowledge.id, {
    title: editForm.value.title,
    coreIdea: editForm.value.coreIdea,
    code: editForm.value.code || undefined,
    keyPoints,
  });
  isEditing.value = false;
}

function handleDelete() {
  if (confirm(`删除知识点 "${props.knowledge.title}"？`)) {
    noteStore.deleteKnowledge(uiStore.currentDate, props.knowledge.id);
  }
}
</script>
