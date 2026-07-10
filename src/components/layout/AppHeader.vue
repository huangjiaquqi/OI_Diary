<template>
  <header class="app-header">
    <div class="header-left">
      <button class="btn-icon menu-btn" @click="uiStore.toggleSidebar" title="日期列表">
        ☰
      </button>
      <h1 class="app-title">My OJ Notes</h1>
    </div>
    <div class="header-center">
      <div class="search-box">
        <input
          v-model="query"
          type="text"
          placeholder="搜索题号、Trick、知识点..."
          @keydown.enter="goSearch"
          @input="handleInput"
        />
        <div v-if="suggestions.length > 0" class="search-suggestions">
          <div
            v-for="(item, idx) in suggestions"
            :key="idx"
            class="suggestion-item"
            @click="goResult(item)"
          >
            <span class="suggestion-type">{{ typeLabel(item.type) }}</span>
            <span class="suggestion-title">{{ item.title }}</span>
            <span class="suggestion-date">{{ item.date }}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="header-right">
      <div class="font-slider">
        <span class="font-label">Aa</span>
        <input
          type="range"
          min="14"
          max="24"
          step="1"
          :value="uiStore.fontSize"
          @input="(e) => uiStore.fontSize = parseInt((e.target as HTMLInputElement).value)"
          class="font-range"
        />
        <span class="font-label-lg">Aa</span>
      </div>
      <button class="btn-secondary btn-sm" @click="exportData">导出</button>
      <button class="btn-secondary btn-sm" @click="triggerImport">导入</button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useUIStore } from '@/stores/uiStore';
import { useNoteStore } from '@/stores/noteStore';
import { buildSearchIndex, type SearchResultItem } from '@/utils/search';

const router = useRouter();
const uiStore = useUIStore();
const noteStore = useNoteStore();

const query = ref('');
const suggestions = ref<SearchResultItem[]>([]);

function typeLabel(type: string): string {
  const map: Record<string, string> = { diary: '日记', trick: 'Trick', problem: '题目', knowledge: '知识点' };
  return map[type] || type;
}

let fuse: ReturnType<typeof buildSearchIndex> | null = null;

function handleInput() {
  if (!query.value.trim()) {
    suggestions.value = [];
    return;
  }
  if (!fuse) fuse = buildSearchIndex(noteStore.data);
  suggestions.value = fuse
    .search(query.value)
    .slice(0, 6)
    .map(r => r.item);
}

function goSearch() {
  if (query.value.trim()) {
    router.push({ name: 'search', query: { q: query.value } });
    suggestions.value = [];
  }
}

function goResult(item: SearchResultItem) {
  suggestions.value = [];
  query.value = '';
  uiStore.selectDate(item.date);
  const moduleMap: Record<string, string> = { diary: 'diary', trick: 'tricks', problem: 'problems', knowledge: 'knowledge' };
  uiStore.setModule(moduleMap[item.type] as 'diary' | 'tricks' | 'problems' | 'knowledge');
  router.push('/');
}

function exportData() {
  const json = noteStore.exportData();
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `oj-notes-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function triggerImport() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        noteStore.importData(reader.result as string);
        alert('导入成功！');
      } catch {
        alert('导入失败：文件格式不正确');
      }
    };
    reader.readAsText(file);
  };
  input.click();
}
</script>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: var(--header-height);
  padding: 0 16px;
  background: var(--color-bg-card);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: 50;
  gap: 16px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.menu-btn {
  font-size: 1.25rem;
}

.app-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--color-primary);
}

.header-center {
  flex: 1;
  max-width: 500px;
  position: relative;
}

.search-box {
  position: relative;
}

.search-box input {
  width: 100%;
  padding: 7px 12px;
  font-size: 0.875rem;
  border-radius: 20px;
  background: var(--color-bg);
}

.search-suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 4px;
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  box-shadow: var(--shadow-lg);
  max-height: 280px;
  overflow-y: auto;
  z-index: 300;
}

.suggestion-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  cursor: pointer;
  transition: background var(--transition);
  font-size: 0.875rem;
}

.suggestion-item:hover {
  background: var(--color-bg);
}

.suggestion-type {
  font-size: 0.6875rem;
  padding: 2px 6px;
  border-radius: 4px;
  background: #e0e7ff;
  color: var(--color-primary);
  flex-shrink: 0;
}

.suggestion-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.suggestion-date {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  flex-shrink: 0;
}

.header-right {
  display: flex;
  gap: 10px;
  flex-shrink: 0;
  align-items: center;
}

.font-slider {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 4px;
  border-right: 1px solid var(--color-border);
  padding-right: 12px;
  margin-right: 2px;
}

.font-label {
  font-size: 0.6875rem;
  color: var(--color-text-secondary);
  font-weight: 500;
}

.font-label-lg {
  font-size: 0.9375rem;
  color: var(--color-text-secondary);
  font-weight: 500;
}

.font-range {
  -webkit-appearance: none;
  appearance: none;
  width: 70px;
  height: 4px;
  background: var(--color-border);
  border-radius: 2px;
  outline: none;
  cursor: pointer;
  border: none;
  padding: 0;
}

.font-range::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--color-primary);
  cursor: pointer;
  transition: transform 0.15s;
}

.font-range::-webkit-slider-thumb:hover {
  transform: scale(1.2);
}
</style>