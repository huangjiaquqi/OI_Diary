<template>
  <div>
    <div v-if="uiStore.sidebarOpen" class="sidebar-overlay" @click="uiStore.closeSidebar"></div>
    <aside :class="['sidebar', { open: uiStore.sidebarOpen }]">
      <div class="sidebar-header">
        <h2>日期列表</h2>
        <button class="sidebar-close" @click="uiStore.closeSidebar">✕</button>
      </div>

      <div class="sidebar-body">
        <div
          v-for="date in dates"
          :key="date"
          :class="['sidebar-item', { active: date === uiStore.currentDate }]"
        >
          <template v-if="editingDate === date">
            <input
              v-model="editDateValue"
              type="date"
              class="sidebar-date-edit"
              ref="editInput"
              @blur="saveDateEdit(date)"
              @keydown.enter="saveDateEdit(date)"
              @keydown.esc="cancelDateEdit"
            />
          </template>
          <template v-else>
            <span class="sidebar-date" @click="selectDate(date)">
              {{ formatDisplayDate(date) }}
            </span>
          </template>
          <div class="sidebar-actions">
            <button
              class="btn-icon"
              @click.stop="startEditDate(date)"
              title="修改日期"
            >
              ✎
            </button>
            <button
              class="btn-icon"
              @click.stop="openImport(date)"
              title="导入"
            >
              +
            </button>
            <button
              class="btn-icon danger"
              @click.stop="noteStore.deleteDay(date)"
              title="删除当天"
            >
              ×
            </button>
          </div>
        </div>
      </div>

      <div class="sidebar-footer">
        <button class="btn-primary" @click="createNewDay">＋ 新建天</button>
      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, nextTick } from 'vue';
import { useNoteStore } from '@/stores/noteStore';
import { useUIStore } from '@/stores/uiStore';
import { formatDisplayDate, getTodayStr } from '@/utils/date';

const noteStore = useNoteStore();
const uiStore = useUIStore();

const dates = computed(() => noteStore.getDates);

const editingDate = ref<string | null>(null);
const editDateValue = ref('');
const editInput = ref<HTMLInputElement | null>(null);

function selectDate(date: string) {
  uiStore.selectDate(date);
  uiStore.closeSidebar();
}

function openImport(date: string) {
  uiStore.openImportModal(date);
  uiStore.closeSidebar();
}

function startEditDate(date: string) {
  editingDate.value = date;
  editDateValue.value = date;
  nextTick(() => {
    editInput.value?.focus();
  });
}

function saveDateEdit(oldDate: string) {
  if (editingDate.value === null) return;
  const newDate = editDateValue.value;
  if (newDate && newDate !== oldDate) {
    noteStore.changeDate(oldDate, newDate);
    if (uiStore.currentDate === oldDate) {
      uiStore.selectDate(newDate);
    }
  }
  editingDate.value = null;
}

function cancelDateEdit() {
  editingDate.value = null;
}

function createNewDay() {
  const today = getTodayStr();
  noteStore.addDay(today);
  uiStore.selectDate(today);
}
</script>
