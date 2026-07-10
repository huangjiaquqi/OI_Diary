<template>
  <div v-if="uiStore.importModalOpen" class="modal-overlay" @click.self="uiStore.closeImportModal">
    <div class="modal">
      <div class="modal-header">
        <h3>导入数据 - {{ uiStore.importTargetDate }}</h3>
        <button class="modal-close" @click="uiStore.closeImportModal">✕</button>
      </div>

      <div class="modal-body">
        <div class="import-type-tabs">
          <button
            v-for="t in types"
            :key="t.key"
            :class="['import-type-tab', { active: uiStore.importType === t.key }]"
            @click="uiStore.importType = t.key"
          >
            {{ t.label }}
          </button>
        </div>

        <!-- 日记导入 -->
        <div v-if="uiStore.importType === 'diary'">
          <div class="form-group">
            <label>题号列表（每行一个）</label>
            <textarea v-model="diaryText" placeholder="P1001&#10;P1002&#10;P1003" rows="6"></textarea>
          </div>
        </div>

        <!-- Trick导入 -->
        <div v-if="uiStore.importType === 'trick'">
          <div class="form-group">
            <label>标题</label>
            <input v-model="trickTitle" placeholder="### 标题" />
          </div>
          <div class="form-group">
            <label>描述</label>
            <textarea v-model="trickDesc" placeholder="描述内容..." rows="5"></textarea>
          </div>
        </div>

        <!-- 题目导入 -->
        <div v-if="uiStore.importType === 'problem'">
          <div class="form-group">
            <label>题号</label>
            <input v-model="problemId" placeholder="P1001" />
          </div>
          <div class="form-group">
            <label>难度</label>
            <select v-model.number="problemDifficulty">
              <option v-for="d in difficulties" :key="d.value" :value="d.value">
                {{ d.label }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>题面概览</label>
            <textarea v-model="problemOverview" placeholder="简述题目大意..." rows="3"></textarea>
          </div>
          <div class="form-group">
            <label>思路概况</label>
            <textarea v-model="problemIdea" placeholder="解题思路..." rows="3"></textarea>
          </div>
          <div class="form-group">
            <label>收获（可选）</label>
            <textarea v-model="problemGain" placeholder="从本题中学到的..." rows="2"></textarea>
          </div>
        </div>

        <!-- 知识点导入 -->
        <div v-if="uiStore.importType === 'knowledge'">
          <div class="form-group">
            <label>标题</label>
            <input v-model="knowledgeTitle" placeholder="### 标题" />
          </div>
          <div class="form-group">
            <label>核心思想</label>
            <textarea v-model="knowledgeCoreIdea" placeholder="核心思想描述..." rows="3"></textarea>
          </div>
          <div class="form-group">
            <label>代码（可选）</label>
            <textarea v-model="knowledgeCode" placeholder="```cpp&#10;// 代码&#10;```" rows="5"></textarea>
          </div>
          <div class="form-group">
            <label>关键点（每行一个，以 - 开头）</label>
            <textarea v-model="knowledgeKeyPoints" placeholder="- 关键点1&#10;- 关键点2" rows="3"></textarea>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn-secondary" @click="uiStore.closeImportModal">取消</button>
        <button class="btn-primary" @click="handleImport">导入</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useUIStore } from '@/stores/uiStore';
import { useNoteStore } from '@/stores/noteStore';
import { DIFFICULTY_MAP } from '@/types';
import type { Difficulty } from '@/types';

const uiStore = useUIStore();
const noteStore = useNoteStore();

const types = [
  { key: 'diary' as const, label: '日记' },
  { key: 'trick' as const, label: 'Trick' },
  { key: 'problem' as const, label: '题目' },
  { key: 'knowledge' as const, label: '知识点' },
];

const difficulties = Object.entries(DIFFICULTY_MAP).map(([value, { label }]) => ({
  value: Number(value) as Difficulty,
  label,
}));

const diaryText = ref('');
const trickTitle = ref('');
const trickDesc = ref('');
const problemId = ref('');
const problemDifficulty = ref<Difficulty>(0);
const problemOverview = ref('');
const problemIdea = ref('');
const problemGain = ref('');
const knowledgeTitle = ref('');
const knowledgeCoreIdea = ref('');
const knowledgeCode = ref('');
const knowledgeKeyPoints = ref('');

function handleImport() {
  const date = uiStore.importTargetDate;

  switch (uiStore.importType) {
    case 'diary': {
      if (!diaryText.value.trim()) return;
      const lines = diaryText.value.split('\n').map(s => s.trim()).filter(Boolean);
      noteStore.importDiary(date, lines);
      diaryText.value = '';
      break;
    }
    case 'trick': {
      if (!trickTitle.value.trim() && !trickDesc.value.trim()) return;
      const raw = `### ${trickTitle.value || '未命名Trick'}\n${trickDesc.value}`;
      noteStore.importTrick(date, raw);
      trickTitle.value = '';
      trickDesc.value = '';
      break;
    }
    case 'problem': {
      if (!problemId.value.trim()) return;
      noteStore.importProblem(date, {
        id: problemId.value.trim(),
        difficulty: problemDifficulty.value,
        overview: problemOverview.value.trim(),
        idea: problemIdea.value.trim(),
        gain: problemGain.value.trim() || undefined,
      });
      problemId.value = '';
      problemDifficulty.value = 0;
      problemOverview.value = '';
      problemIdea.value = '';
      problemGain.value = '';
      break;
    }
    case 'knowledge': {
      if (!knowledgeTitle.value.trim()) return;
      const keyPoints = knowledgeKeyPoints.value
        .split('\n')
        .map(s => s.trim().replace(/^-\s*/, ''))
        .filter(Boolean);
      const rawParts = [`### ${knowledgeTitle.value}`];
      if (knowledgeCoreIdea.value.trim()) rawParts.push(knowledgeCoreIdea.value.trim());
      if (knowledgeCode.value.trim()) rawParts.push(knowledgeCode.value.trim());
      if (keyPoints.length > 0) rawParts.push(keyPoints.map(kp => `- ${kp}`).join('\n'));
      noteStore.importKnowledge(date, rawParts.join('\n'));
      knowledgeTitle.value = '';
      knowledgeCoreIdea.value = '';
      knowledgeCode.value = '';
      knowledgeKeyPoints.value = '';
      break;
    }
  }

  uiStore.closeImportModal();
}
</script>