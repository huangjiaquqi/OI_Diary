<template>
  <div class="home-view">
    <div class="home-header">
      <div class="date-info">
        <h2>{{ formatDisplayDate(uiStore.currentDate) }}</h2>
      </div>
      <div class="home-actions">
        <ModuleTabs />
        <button class="btn-primary btn-sm" @click="openImportForCurrent">
          ＋ 导入
        </button>
      </div>
    </div>

    <div class="home-content">
      <template v-if="dayData">
        <!-- 日记 -->
        <div v-if="uiStore.currentModule === 'diary'">
          <DiaryCard v-if="dayData.diary.length > 0" :diary-ids="dayData.diary" />
          <EmptyState v-else message="暂无日记" hint="点击导入按钮添加刷题日记" />
        </div>

        <!-- Tricks -->
        <div v-if="uiStore.currentModule === 'tricks'">
          <div v-if="dayData.tricks.length > 0" class="cards-grid">
            <TrickCard v-for="t in dayData.tricks" :key="t.id" :trick="t" />
          </div>
          <EmptyState v-else message="暂无Tricks" hint="点击导入按钮添加Trick" />
        </div>

        <!-- 思路速览 -->
        <div v-if="uiStore.currentModule === 'problems'">
          <div v-if="dayData.problems.length > 0" class="cards-grid">
            <ProblemCard v-for="p in dayData.problems" :key="p.id" :problem="p" />
          </div>
          <EmptyState v-else message="暂无题目" hint="点击导入按钮添加题目" />
        </div>

        <!-- 知识点 -->
        <div v-if="uiStore.currentModule === 'knowledge'">
          <div v-if="dayData.knowledge.length > 0" class="cards-grid">
            <KnowledgeCard v-for="k in dayData.knowledge" :key="k.id" :knowledge="k" />
          </div>
          <EmptyState v-else message="暂无知识点" hint="点击导入按钮添加知识点" />
        </div>
      </template>

      <EmptyState v-else message="暂无数据" hint="点击左侧边栏「新建天」或导入数据开始记录" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useNoteStore } from '@/stores/noteStore';
import { useUIStore } from '@/stores/uiStore';
import { formatDisplayDate } from '@/utils/date';
import ModuleTabs from '@/components/layout/ModuleTabs.vue';
import DiaryCard from '@/components/cards/DiaryCard.vue';
import TrickCard from '@/components/cards/TrickCard.vue';
import ProblemCard from '@/components/cards/ProblemCard.vue';
import KnowledgeCard from '@/components/cards/KnowledgeCard.vue';
import EmptyState from '@/components/common/EmptyState.vue';

const noteStore = useNoteStore();
const uiStore = useUIStore();

const dayData = computed(() => noteStore.getDay(uiStore.currentDate));

function openImportForCurrent() {
  const moduleMap: Record<string, 'diary' | 'trick' | 'problem' | 'knowledge'> = {
    diary: 'diary',
    tricks: 'trick',
    problems: 'problem',
    knowledge: 'knowledge',
  };
  uiStore.openImportModal(uiStore.currentDate, moduleMap[uiStore.currentModule]);
}
</script>

<style scoped>
.home-view {
  flex: 1;
  padding: 20px 24px;
  max-width: 900px;
  margin: 0 auto;
  width: 100%;
}

.home-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 12px;
}

.date-info h2 {
  font-size: 20px;
  font-weight: 700;
}

.home-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.home-content {
  min-height: 300px;
}
</style>