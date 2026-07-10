<template>
  <div class="search-view">
    <div class="search-header">
      <h2>搜索结果</h2>
      <router-link to="/" class="btn-secondary btn-sm">← 返回主页</router-link>
    </div>

    <div class="search-input-row">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="搜索题号、Trick、知识点..."
        class="search-input-lg"
        @input="doSearch"
      />
    </div>

    <div v-if="searchQuery.trim() && results.length === 0" class="empty-state">
      <div class="empty-icon">🔍</div>
      <div class="empty-text">未找到匹配结果</div>
    </div>

    <div v-if="results.length > 0" class="search-results">
      <div
        v-for="(item, idx) in results"
        :key="idx"
        class="search-result-item"
        @click="goToItem(item)"
      >
        <div class="result-header">
          <span class="result-type-badge">{{ typeLabel(item.type) }}</span>
          <span class="result-title">{{ item.title }}</span>
          <span class="result-date">{{ item.date }}</span>
        </div>
        <div class="result-preview">{{ item.preview }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useNoteStore } from '@/stores/noteStore';
import { useUIStore } from '@/stores/uiStore';
import { buildSearchIndex, type SearchResultItem } from '@/utils/search';

const route = useRoute();
const router = useRouter();
const noteStore = useNoteStore();
const uiStore = useUIStore();

const searchQuery = ref((route.query.q as string) || '');
const results = ref<SearchResultItem[]>([]);

let fuse: ReturnType<typeof buildSearchIndex> | null = null;

function doSearch() {
  const q = searchQuery.value.trim();
  if (!q) {
    results.value = [];
    return;
  }
  if (!fuse) fuse = buildSearchIndex(noteStore.data);
  results.value = fuse
    .search(q)
    .slice(0, 30)
    .map(r => r.item);
}

function typeLabel(type: string): string {
  const map: Record<string, string> = {
    diary: '日记',
    trick: 'Trick',
    problem: '题目',
    knowledge: '知识点',
  };
  return map[type] || type;
}

function goToItem(item: SearchResultItem) {
  uiStore.selectDate(item.date);
  const moduleMap: Record<string, string> = {
    diary: 'diary',
    trick: 'tricks',
    problem: 'problems',
    knowledge: 'knowledge',
  };
  uiStore.setModule(moduleMap[item.type] as 'diary' | 'tricks' | 'problems' | 'knowledge');
  router.push('/');
}

// 初始搜索
doSearch();
</script>

<style scoped>
.search-view {
  flex: 1;
  padding: 20px 24px;
  max-width: 700px;
  margin: 0 auto;
  width: 100%;
}

.search-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.search-header h2 {
  font-size: 20px;
  font-weight: 700;
}

.search-input-row {
  margin-bottom: 20px;
}

.search-input-lg {
  width: 100%;
  padding: 12px 16px;
  font-size: 16px;
  border-radius: var(--radius);
  border: 1px solid var(--color-border);
}

.search-input-lg:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.15);
}

.search-results {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.search-result-item {
  padding: 14px 16px;
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  cursor: pointer;
  transition: all var(--transition);
}

.search-result-item:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-sm);
}

.result-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.result-type-badge {
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 4px;
  background: #e0e7ff;
  color: var(--color-primary);
}

.result-title {
  font-weight: 600;
  font-size: 14px;
}

.result-date {
  margin-left: auto;
  font-size: 12px;
  color: var(--color-text-secondary);
}

.result-preview {
  font-size: 13px;
  color: var(--color-text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>