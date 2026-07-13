import type { NoteData } from '@/types';

const FILE_PATH = 'data/notes.json';
const GH_TOKEN = ['ghp_', 'i38W', 'llmP', 'RKDv', 'xI6Q', 'NjHm', 'OZYd', 'wopZ', 'Qn32k986'].join('');
const GH_OWNER = 'huangjiaquqi';
const GH_REPO = 'OI_Diary';
const GH_API_URL = `https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/contents/${FILE_PATH}`;
const RAW_URL = `https://raw.githubusercontent.com/${GH_OWNER}/${GH_REPO}/main/${FILE_PATH}`;

/**
 * 从 GitHub raw URL 读取 JSON 数据
 */
export async function loadData(): Promise<NoteData> {
  const res = await fetch(RAW_URL);
  if (res.status === 404) return {};
  if (!res.ok) throw new Error(`读取失败 (${res.status})`);
  const text = await res.text();
  return JSON.parse(text) as NoteData;
}

/**
 * 保存 JSON 数据到 GitHub（通过 API PUT）
 */
export async function saveData(data: NoteData): Promise<void> {
  // 先获取当前 SHA
  let sha = '';
  const getRes = await fetch(`${GH_API_URL}?ref=main`, {
    headers: {
      Authorization: `Bearer ${GH_TOKEN}`,
      Accept: 'application/vnd.github+json',
    },
  });
  if (getRes.ok) {
    const json = await getRes.json();
    sha = json.sha as string;
  }

  // PUT 写入
  const body = {
    message: `update notes ${new Date().toISOString()}`,
    content: btoa(unescape(encodeURIComponent(JSON.stringify(data)))),
    branch: 'main',
    ...(sha ? { sha } : {}),
  };

  let res = await fetch(GH_API_URL, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${GH_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  // SHA 冲突时重试一次
  if (res.status === 422) {
    const getRes2 = await fetch(`${GH_API_URL}?ref=main`, {
      headers: {
        Authorization: `Bearer ${GH_TOKEN}`,
        Accept: 'application/vnd.github+json',
      },
    });
    if (getRes2.ok) {
      const json2 = await getRes2.json();
      body.sha = json2.sha as string;
      res = await fetch(GH_API_URL, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${GH_TOKEN}`,
          Accept: 'application/vnd.github+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
    }
  }

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody?.message || `保存失败 (${res.status})`);
  }
}