import Fuse from 'fuse.js';
import type { NoteData } from '@/types';

export interface SearchResultItem {
  date: string;
  type: 'diary' | 'trick' | 'problem' | 'knowledge';
  id: string;
  title: string;
  preview: string;
}

export function buildSearchIndex(data: NoteData): Fuse<SearchResultItem> {
  const items: SearchResultItem[] = [];

  for (const [date, day] of Object.entries(data)) {
    for (const pid of day.diary) {
      items.push({
        date,
        type: 'diary',
        id: pid,
        title: pid,
        preview: `日记: ${pid}`,
      });
    }
    for (const t of day.tricks) {
      items.push({
        date,
        type: 'trick',
        id: t.id,
        title: t.title,
        preview: t.description.slice(0, 60),
      });
    }
    for (const p of day.problems) {
      items.push({
        date,
        type: 'problem',
        id: p.id,
        title: p.id,
        preview: `${p.overview} | ${p.idea}`,
      });
    }
    for (const k of day.knowledge) {
      items.push({
        date,
        type: 'knowledge',
        id: k.id,
        title: k.title,
        preview: k.coreIdea.slice(0, 60),
      });
    }
  }

  return new Fuse(items, {
    keys: ['title', 'preview'],
    threshold: 0.3,
    includeScore: true,
  });
}