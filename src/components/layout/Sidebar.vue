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
          <span class="sidebar-date" @click="selectDate(date)">
            {{ formatDisplayDate(date) }}
          </span>
          <div class="sidebar-actions">
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
        <div v-if="showDatePicker" class="new-day-picker">
          <input v-model="newDate" type="date" class="new-day-input" />
          <div class="new-day-actions">
            <button class="btn-primary btn-sm" @click="confirmNewDay">确定</button>
            <button class="btn-secondary btn-sm" @click="showDatePicker = false">取消</button>
          </div>
        </div>
        <button v-else class="btn-primary" @click="openDatePicker">＋ 新建天</button>
      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useNoteStore } from '@/stores/noteStore';
import { useUIStore } from '@/stores/uiStore';
import { formatDisplayDate, getTodayStr } from '@/utils/date';

const noteStore = useNoteStore();
const uiStore = useUIStore();

const dates = computed(() => noteStore.getDates);

const showDatePicker = ref(false);
const newDate = ref(getTodayStr());

function selectDate(date: string) {
  uiStore.selectDate(date);
  uiStore.closeSidebar();
}

function openImport(date: string) {
  uiStore.openImportModal(date);
  uiStore.closeSidebar();
}

function openDatePicker() {
  newDate.value = getTodayStr();
  showDatePicker.value = true;
}

function confirmNewDay() {
  if (newDate.value) {
    noteStore.addDay(newDate.value);
    uiStore.selectDate(newDate.value);
    showDatePicker.value = false;
  }
}
</script>