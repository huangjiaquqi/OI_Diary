import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import type { ImportType } from '@/types';
import { getTodayStr } from '@/utils/date';

export const useUIStore = defineStore('ui', () => {
  const sidebarOpen = ref(false);
  const currentDate = ref(getTodayStr());
  const currentModule = ref<'diary' | 'tricks' | 'problems' | 'knowledge'>('diary');
  const importModalOpen = ref(false);
  const importTargetDate = ref('');
  const importType = ref<ImportType>('diary');

  // 字体大小（14-24px），默认16px，持久化到 localStorage
  const storedFontSize = localStorage.getItem('fontSize');
  const fontSize = ref(storedFontSize ? parseInt(storedFontSize) : 16);

  watch(fontSize, (val) => {
    localStorage.setItem('fontSize', String(val));
  });

  function toggleSidebar() {
    sidebarOpen.value = !sidebarOpen.value;
  }

  function openSidebar() {
    sidebarOpen.value = true;
  }

  function closeSidebar() {
    sidebarOpen.value = false;
  }

  function selectDate(date: string) {
    currentDate.value = date;
  }

  function setModule(module: 'diary' | 'tricks' | 'problems' | 'knowledge') {
    currentModule.value = module;
  }

  function openImportModal(date: string, type: ImportType = 'diary') {
    importTargetDate.value = date;
    importType.value = type;
    importModalOpen.value = true;
  }

  function closeImportModal() {
    importModalOpen.value = false;
  }

  return {
    sidebarOpen,
    currentDate,
    currentModule,
    importModalOpen,
    importTargetDate,
    importType,
    fontSize,
    toggleSidebar,
    openSidebar,
    closeSidebar,
    selectDate,
    setModule,
    openImportModal,
    closeImportModal,
  };
});