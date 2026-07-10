import { marked } from 'marked';

// 配置 marked 安全渲染
marked.setOptions({
  breaks: true,
  gfm: true,
});

export function renderMarkdown(text: string): string {
  if (!text) return '';
  return marked.parse(text) as string;
}