import { marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import hljs from 'highlight.js';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import 'highlight.js/styles/github-dark.min.css';

// 配置代码语法高亮
marked.use(
  markedHighlight({
    langPrefix: 'hljs language-',
    highlight(code: string, lang: string) {
      if (lang && hljs.getLanguage(lang)) {
        try {
          return hljs.highlight(code, { language: lang }).value;
        } catch {
          // ignore
        }
      }
      try {
        return hljs.highlightAuto(code).value;
      } catch {
        return code;
      }
    },
  }),
);

// 全局配置
marked.setOptions({
  gfm: true,
  breaks: true,
  pedantic: false,
});

function renderMath(html: string): string {
  // 第一步：处理块级公式 $$...$$（必须放在 <pre> 和 <code> 之外）
  // 使用占位符保护代码块
  const codeBlocks: string[] = [];

  // 保护 <pre>...</pre> 和 <code>...</code> 块
  let processed = html.replace(
    /<(pre|code)(?:\s[^>]*)?>[\s\S]*?<\/\1>/gi,
    (match) => {
      codeBlocks.push(match);
      return `__CODE_BLOCK_${codeBlocks.length - 1}__`;
    },
  );

  // 处理块级公式 $$...$$
  processed = processed.replace(
    /\$\$([\s\S]*?)\$\$/g,
    (_: string, formula: string) => {
      try {
        const trimmed = formula.trim();
        if (!trimmed) return '';
        return `<div class="katex-display">${katex.renderToString(trimmed, {
          throwOnError: false,
          displayMode: true,
          strict: false,
          trust: true,
        })}</div>`;
      } catch {
        return `<span class="katex-error">[公式渲染错误]</span>`;
      }
    },
  );

  // 处理内联公式 $...$（排除 $$ 块和内联代码）
  processed = processed.replace(
    /(?<!\$)\$(?!\$)([^$\n]+?)\$(?!\$)/g,
    (_: string, formula: string) => {
      try {
        const trimmed = formula.trim();
        if (!trimmed) return '';
        return katex.renderToString(trimmed, {
          throwOnError: false,
          displayMode: false,
          strict: false,
          trust: true,
        });
      } catch {
        return `<span class="katex-error">[公式渲染错误]</span>`;
      }
    },
  );

  // 恢复代码块
  processed = processed.replace(
    /__CODE_BLOCK_(\d+)__/g,
    (_: string, index: string) => {
      return codeBlocks[parseInt(index)];
    },
  );

  return processed;
}

export function renderMarkdown(text: string): string {
  if (!text) return '';
  try {
    const html = marked.parse(text) as string;
    return renderMath(html);
  } catch (e) {
    console.error('Markdown render error:', e);
    return text;
  }
}