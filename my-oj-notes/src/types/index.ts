export type Difficulty = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

export const DIFFICULTY_MAP: Record<Difficulty, { label: string; color: string }> = {
  0: { label: '未设置', color: '#b0b0b0' },
  1: { label: '红', color: '#ff4d4d' },
  2: { label: '橙', color: '#ff8c00' },
  3: { label: '黄', color: '#ffd700' },
  4: { label: '绿', color: '#00cc66' },
  5: { label: '青', color: '#00bfff' },
  6: { label: '蓝', color: '#3366ff' },
  7: { label: '紫', color: '#9966ff' },
};

export type ImportType = 'diary' | 'trick' | 'problem' | 'knowledge';

export interface Trick {
  id: string;
  title: string;
  description: string;
  createdAt: number;
}

export interface ProblemBrief {
  id: string;
  difficulty: Difficulty;
  overview: string;
  idea: string;
  gain?: string;
  createdAt: number;
}

export interface Knowledge {
  id: string;
  title: string;
  coreIdea: string;
  code?: string;
  keyPoints: string[];
  createdAt: number;
}

export interface DayData {
  date: string;
  diary: string[];
  tricks: Trick[];
  problems: ProblemBrief[];
  knowledge: Knowledge[];
}

export type NoteData = Record<string, DayData>;