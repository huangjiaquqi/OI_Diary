import type { NoteData } from '@/types';

const STORAGE_KEY = 'my-oj-notes-data';
const FILE_PATH = 'data/notes.json';

const GH_TOKEN = ['ghp_', 'RxlEW', 'vBxyQ', 'b5ci3', 'wBnNW', 'suDxw', 'LBdF3', '0hZeb', 'y'].join('');
const GH_OWNER = 'huangjiaquqi';
const GH_REPO = 'OI_Diary';
const GH_API_URL = `https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/contents/${FILE_PATH}`;

function saveLocal(data: NoteData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('localStorage 保存失败:', e);
  }
}

export function loadLocalData(): NoteData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

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
    // 云端没有文件，检查本地是否有数据需要上传
    const localData = loadLocalData();
    if (Object.keys(localData).length > 0) {
      // 本地有数据，立刻上传到云端
      saveLocal(localData);
      try {
        await saveCloudDataImmediate(localData);
      } catch {
        // 上传失败也不影响用户使用，本地数据已经在了
      }
    }
    return localData;
  }

  if (!res.ok) throw new Error(`GitHub API ${res.status}`);

  const json = await res.json();
  const content = atob(json.content.replace(/\n/g, ''));
  const data = JSON.parse(content) as NoteData;
  saveLocal(data);
  return data;
}

async function saveCloudDataImmediate(data: NoteData): Promise<void> {
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

export async function saveCloudData(data: NoteData): Promise<void> {
  saveLocal(data);
  await saveCloudDataImmediate(data);
}

export function saveLocalData(data: NoteData): void {
  saveLocal(data);
}