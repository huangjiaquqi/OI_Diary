import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { DayData, NoteData, Trick, ProblemBrief, Knowledge, Difficulty } from '@/types';
import { loadLocalData, loadCloudData, saveCloudData, saveLocalData, useLocalData } from '@/utils/storage';
import { generateId } from '@/utils/id';
import { parseTrick, parseKnowledge } from '@/utils/parser';

export const useNoteStore = defineStore('note', () => {
  const data = ref<NoteData>(loadLocalData());
  const loading = ref(true);
  const loadError = ref<string | null>(null);
  const saving = ref(false);
  const saveError = ref<string | null>(null);
  const loadConflict = ref(false);
  let pendingCloudData: NoteData | null = null;

  async function loadFromCloud() {
    loading.value = true;
    loadError.value = null;
    loadConflict.value = false;
    pendingCloudData = null;
    try {
      const result = await loadCloudData();
      if (result.conflict) {
        // 本地和云端都有数据，让用户选择
        loadConflict.value = true;
        pendingCloudData = result.data;
        loading.value = false;
        return;
      }
      data.value = result.data;
      saveLocalData(result.data);
    } catch (e) {
      loadError.value = (e as Error).message;
    } finally {
      loading.value = false;
    }
  }

  function resolveConflict(useLocal: boolean) {
    if (useLocal) {
      data.value = useLocalData();
    } else if (pendingCloudData) {
      data.value = pendingCloudData;
      saveLocalData(pendingCloudData);
    }
    loadConflict.value = false;
    pendingCloudData = null;
  }

  function useLocalOnly() {
    data.value = useLocalData();
    loading.value = false;
    loadError.value = null;
    loadConflict.value = false;
    pendingCloudData = null;
  }

  let savingInProgress = false;
  let pendingSave = false;
  let consecutiveFailures = 0;

  async function syncCloud() {
    if (savingInProgress) {
      pendingSave = true;
      return;
    }
    savingInProgress = true;
    saving.value = true;
    saveError.value = null;
    try {
      await saveCloudData(data.value);
      consecutiveFailures = 0;
    } catch (e) {
      saveError.value = (e as Error).message;
      consecutiveFailures++;
    } finally {
      savingInProgress = false;
      // 只有连续失败不超过2次且有待保存时才重试
      if (pendingSave && consecutiveFailures < 3) {
        pendingSave = false;
        syncCloud();
      } else {
        saving.value = false;
        pendingSave = false;
      }
    }
  }

  async function retrySync() {
    consecutiveFailures = 0;
    saveError.value = null;
    await syncCloud();
  }

  function scheduleSync() {
    syncCloud();
  }

  const getDay = (date: string): DayData | null => data.value[date] || null;

  const getDates = computed(() =>
    Object.keys(data.value).sort((a, b) => b.localeCompare(a))
  );

  // ---- 天级操作 ----
  function addDay(date: string): void {
    if (!data.value[date]) {
      data.value[date] = {
        date,
        diary: [],
        tricks: [],
        problems: [],
        knowledge: [],
      };
      saveLocalData(data.value);
      scheduleSync();
    }
  }

  function deleteDay(date: string): void {
    if (confirm(`确认删除 ${date} 的所有数据？`)) {
      delete data.value[date];
      saveLocalData(data.value);
      scheduleSync();
    }
  }

  function changeDate(oldDate: string, newDate: string): void {
    if (oldDate === newDate) return;
    if (!data.value[oldDate]) return;
    if (data.value[newDate]) {
      if (!confirm(`${newDate} 已存在，是否合并数据？`)) return;
      const oldDay = data.value[oldDate];
      const newDay = data.value[newDate];
      newDay.diary = [...oldDay.diary, ...newDay.diary];
      newDay.tricks = [...oldDay.tricks, ...newDay.tricks];
      newDay.problems = [...oldDay.problems, ...newDay.problems];
      newDay.knowledge = [...oldDay.knowledge, ...newDay.knowledge];
    } else {
      data.value[newDate] = { ...data.value[oldDate], date: newDate };
    }
    delete data.value[oldDate];
    saveLocalData(data.value);
    scheduleSync();
  }

  // ---- 日记 ----
  function importDiary(date: string, lines: string[]): void {
    if (!data.value[date]) addDay(date);
    const newIds = lines.map(s => s.trim()).filter(Boolean);
    data.value[date].diary = [...newIds, ...data.value[date].diary];
    saveLocalData(data.value);
    scheduleSync();
  }

  function deleteDiaryItem(date: string, problemId: string): void {
    const day = data.value[date];
    if (!day) return;
    day.diary = day.diary.filter(id => id !== problemId);
    saveLocalData(data.value);
    scheduleSync();
  }

  // ---- Tricks ----
  function importTrick(date: string, raw: string): void {
    if (!data.value[date]) addDay(date);
    const parsed = parseTrick(raw);
    const newTrick: Trick = { ...parsed, id: generateId(), createdAt: Date.now() };
    data.value[date].tricks = [newTrick, ...data.value[date].tricks];
    saveLocalData(data.value);
    scheduleSync();
  }

  function updateTrick(date: string, id: string, updates: Partial<Trick>): void {
    const day = data.value[date];
    if (!day) return;
    const idx = day.tricks.findIndex(t => t.id === id);
    if (idx === -1) return;
    day.tricks[idx] = { ...day.tricks[idx], ...updates };
    saveLocalData(data.value);
    scheduleSync();
  }

  function deleteTrick(date: string, id: string): void {
    const day = data.value[date];
    if (!day) return;
    day.tricks = day.tricks.filter(t => t.id !== id);
    saveLocalData(data.value);
    scheduleSync();
  }

  // ---- 思路速览（题目） ----
  function importProblem(
    date: string,
    input: {
      id: string;
      difficulty: Difficulty;
      overview: string;
      idea: string;
      gain?: string;
    }
  ): void {
    if (!data.value[date]) addDay(date);
    const newProblem: ProblemBrief = { ...input, createdAt: Date.now() };
    data.value[date].problems = [newProblem, ...data.value[date].problems];
    if (!data.value[date].diary.includes(input.id)) {
      data.value[date].diary = [input.id, ...data.value[date].diary];
    }
    saveLocalData(data.value);
    scheduleSync();
  }

  function updateProblem(
    date: string,
    id: string,
    updates: Partial<ProblemBrief>
  ): void {
    const day = data.value[date];
    if (!day) return;
    const idx = day.problems.findIndex(p => p.id === id);
    if (idx === -1) return;
    day.problems[idx] = { ...day.problems[idx], ...updates };
    saveLocalData(data.value);
    scheduleSync();
  }

  function deleteProblem(date: string, id: string): void {
    const day = data.value[date];
    if (!day) return;
    day.problems = day.problems.filter(p => p.id !== id);
    day.diary = day.diary.filter(d => d !== id);
    saveLocalData(data.value);
    scheduleSync();
  }

  // ---- 知识点 ----
  function importKnowledge(date: string, raw: string): void {
    if (!data.value[date]) addDay(date);
    const parsed = parseKnowledge(raw);
    const newKnowledge: Knowledge = {
      ...parsed,
      id: generateId(),
      createdAt: Date.now(),
    };
    data.value[date].knowledge = [newKnowledge, ...data.value[date].knowledge];
    saveLocalData(data.value);
    scheduleSync();
  }

  function updateKnowledge(
    date: string,
    id: string,
    updates: Partial<Knowledge>
  ): void {
    const day = data.value[date];
    if (!day) return;
    const idx = day.knowledge.findIndex(k => k.id === id);
    if (idx === -1) return;
    day.knowledge[idx] = { ...day.knowledge[idx], ...updates };
    saveLocalData(data.value);
    scheduleSync();
  }

  function deleteKnowledge(date: string, id: string): void {
    const day = data.value[date];
    if (!day) return;
    day.knowledge = day.knowledge.filter(k => k.id !== id);
    saveLocalData(data.value);
    scheduleSync();
  }

  // ---- 数据导出/导入 ----
  function exportData(): string {
    return JSON.stringify(data.value, null, 2);
  }

  function importData(json: string): void {
    const parsed = JSON.parse(json) as NoteData;
    data.value = parsed;
    saveLocalData(data.value);
    scheduleSync();
  }

  return {
    data,
    loading,
    loadError,
    saving,
    saveError,
    loadConflict,
    useLocalOnly,
    loadFromCloud,
    retrySync,
    resolveConflict,
    getDates,
    getDay,
    addDay,
    deleteDay,
    changeDate,
    importDiary,
    deleteDiaryItem,
    importTrick,
    updateTrick,
    deleteTrick,
    importProblem,
    updateProblem,
    deleteProblem,
    importKnowledge,
    updateKnowledge,
    deleteKnowledge,
    exportData,
    importData,
  };
});
