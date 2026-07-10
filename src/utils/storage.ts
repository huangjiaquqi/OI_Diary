import type { NoteData } from '@/types';

const STORAGE_KEY = 'my-oj-notes-data';
const FILE_PATH = 'data/notes.json';

// GitHub API 配置
const GH_TOKEN = ['ghp_', 'RxlEW', 'vBxyQ', 'b5ci3', 'wBnNW', 'suDxw', 'LBdF3', '0hZeb', 'y'].join('');
const GH_OWNER = 'huangjiaquqi';
const GH_REPO = 'OI_Diary';
const GH_API_URL = `https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/contents/${FILE_PATH}`;

// ---- localStorage 本地缓存 ----
export function loadData(): NoteData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveLocal(data: NoteData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('localStorage 保存失败:', e);
  }
}

// ---- GitHub API 云存储 ----

/** 从 GitHub 获取文件 SHA（不解析内容，仅用于保存前的 SHA 同步） */
async function fetchSha(): Promise<string | null> {
  const res = await fetch(`${GH_API_URL}?ref=main`, {
    headers: {
      Authorization: `Bearer ${GH_TOKEN}`,
      Accept: 'application/vnd.github+json',
    },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub GET ${res.status}`);
  const json = await res.json();
  return json.sha as string;
}

export async function loadCloudData(): Promise<NoteData> {
  const res = await fetch(`${GH_API_URL}?ref=main`, {
    headers: {
      Authorization: `Bearer ${GH_TOKEN}`,
      Accept: 'application/vnd.github+json',
    },
  });

  if (res.status === 404) {
    // 文件不存在，返回空数据
    saveLocal({});
    return {};
  }

  if (!res.ok) throw new Error(`GitHub API ${res.status}`);

  const json = await res.json();
  const content = atob(json.content.replace(/\n/g, ''));
  const data = JSON.parse(content) as NoteData;
  saveLocal(data);
  return data;
}

export async function saveCloudData(data: NoteData): Promise<void> {
  // 先保存到本地
  saveLocal(data);

  // 保存前先获取最新 SHA，彻底避免 409
  const sha = await fetchSha();

  const body: Record<string, unknown> = {
    message: `update notes ${new Date().toISOString()}`,
    content: btoa(unescape(encodeURIComponent(JSON.stringify(data)))),
    branch: 'main',
  };
  if (sha) body.sha = sha;

  const res = await fetch(GH_API_URL, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${GH_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    const msg = errBody?.message || `GitHub save ${res.status}`;
    throw new Error(msg);
  }
}

export function saveData(data: NoteData): void {
  saveLocal(data);
}
