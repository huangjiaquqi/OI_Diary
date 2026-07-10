import { ref, watch, computed } from 'vue';
import { useNoteStore } from '@/stores/noteStore';
import { buildSearchIndex, type SearchResultItem } from '@/utils/search';

export function useSearch() {
  const noteStore = useNoteStore();
  const query = ref('');
  const results = ref<SearchResultItem[]>([]);

  let fuse: ReturnType<typeof buildSearchIndex> | null = null;

  function rebuildIndex() {
    fuse = buildSearchIndex(noteStore.data);
  }

  watch(query, (q) => {
    if (!q.trim()) {
      results.value = [];
      return;
    }
    if (!fuse) rebuildIndex();
    results.value = fuse!
      .search(q)
      .slice(0, 20)
      .map(r => r.item);
  });

  watch(() => noteStore.data, rebuildIndex, { deep: true });

  return {
    query,
    results,
    rebuildIndex,
  };
}