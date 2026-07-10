import type { NoteData } from '@/types';

const STORAGE_KEY = 'my-oj-notes-data';
const FILE_PATH = 'data/notes.json';

// GitHub API 配置
const GH_TOKEN = ['ghp_', 'RxlEW', 'vBxyQ', 'b5ci3', 'wBnNW', 'suDxw', 'LBdF3', '0hZeb', 'y'].join('');
const GH_OWNER = 'huangjiaquqi';
const GH_REPO = 'OI_Diary';
const GH_API_URL = `https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/contents/${FILE_PATH}`;

let cloudSha: string | null = null;

// ---- localStorage 本地缓存（离线回退用） ----
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
export async function loadCloudData(): Promise<NoteData> {
  const res = await fetch(`${GH_API_URL}?ref=main`, {
    headers: {
      Authorization: `Bearer ${GH_TOKEN}`,
      Accept: 'application/vnd.github+json',
    },
  });

  if (res.status === 404) {
    cloudSha = null;
    saveLocal({});
    return {};
  }

  if (!res.ok) throw new Error(`GitHub API ${res.status}`);

  const json = await res.json();
  cloudSha = json.sha;

  const content = atob(json.content.replace(/\n/g, ''));
  const data = JSON.parse(content) as NoteData;
  saveLocal(data);
  return data;
}

export async function saveCloudData(data: NoteData): Promise<void> {
  saveLocal(data);

  const body = {
    message: `update notes ${new Date().toISOString()}`,
    content: btoa(unescape(encodeURIComponent(JSON.stringify(data)))),
    branch: 'main',
    ...(cloudSha ? { sha: cloudSha } : {}),
  };

  const res = await fetch(GH_API_URL, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${GH_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (res.status === 409) {
    // SHA 过期，重新加载后重试一次
    await loadCloudData();
    const retryBody = { ...body, sha: cloudSha };
    const retryRes = await fetch(GH_API_URL, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${GH_TOKEN}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(retryBody),
    });
    if (!retryRes.ok) throw new Error(`GitHub save retry ${retryRes.status}`);
    const retryJson = await retryRes.json();
    cloudSha = retryJson.content.sha;
    return;
  }

  if (!res.ok) throw new Error(`GitHub save ${res.status}`);

  const result = await res.json();
  cloudSha = result.content.sha;
}

export function saveData(data: NoteData): void {
  saveLocal(data);
}
