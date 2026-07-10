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

/**
 * 用 KaTeX 渲染数学公式为 HTML
 */
function katexRender(formula: string, display: boolean): string {
  try {
    return katex.renderToString(formula, {
      throwOnError: false,
      displayMode: display,
      strict: false,
      trust: true,
    });
  } catch {
    return `<span class="katex-error">[公式错误: ${formula}]</span>`;
  }
}

/**
 * 从文本中提取数学公式，替换为可安全通过 marked 的占位符。
 * 占位符使用 HTML 注释格式，marked 输出时不会转义。
 */
function extractMathFromText(text: string): {
  processed: string;
  mathBlocks: { formula: string; display: boolean }[];
} {
  const mathBlocks: { formula: string; display: boolean }[] = [];

  // 提取块级公式 $$...$$
  let processed = text.replace(
    /\$\$([\s\S]*?)\$\$/g,
    (_: string, formula: string) => {
      const trimmed = formula.trim();
      if (!trimmed) return '';
      mathBlocks.push({ formula: trimmed, display: true });
      return `<!--MATH_BLOCK_${mathBlocks.length - 1}-->`;
    },
  );

  // 提取内联公式 $...$（不跨行，排除 $$ 块）
  processed = processed.replace(
    /(?<!\$)\$(?!\$)([^$\n]+?)\$(?!\$)/g,
    (_: string, formula: string) => {
      const trimmed = formula.trim();
      if (!trimmed) return '';
      mathBlocks.push({ formula: trimmed, display: false });
      return `<!--MATH_INLINE_${mathBlocks.length - 1}-->`;
    },
  );

  return { processed, mathBlocks };
}

/**
 * 渲染 Markdown 文本为 HTML，支持数学公式（KaTeX）
 *
 * 核心流程（和洛谷等平台一致）：
 * 1. 按代码块拆分文本，只对非代码段提取数学公式
 * 2. 用占位符替换数学公式，让 marked 只看到纯 Markdown
 * 3. 用 marked 解析
 * 4. 用 KaTeX 渲染数学公式替换回占位符
 *
 * 关键：数学公式在 marked 之前提取，marked 永远不会看到
 * 公式内的特殊字符（>、_、\ 等），避免 HTML 转义破坏 LaTeX 语法。
 */
export function renderMarkdown(text: string): string {
  if (!text) return '';

  try {
    // ========== 第一步：按代码块拆分，保护代码内容 ==========
    // 代码块内的 $ 不应该被当作数学公式
    const segments: { type: 'text' | 'code'; content: string }[] = [];
    let remaining = text;
    let codeIdx = 0;

    while (remaining.length > 0) {
      const fenceMatch = remaining.match(/^```[\s\S]*?^```/m);
      if (fenceMatch && fenceMatch.index !== undefined) {
        // 代码块之前的文本
        if (fenceMatch.index > 0) {
          segments.push({ type: 'text', content: remaining.slice(0, fenceMatch.index) });
        }
        // 代码块本身
        segments.push({ type: 'code', content: fenceMatch[0] });
        remaining = remaining.slice(fenceMatch.index + fenceMatch[0].length);
      } else {
        // 没有更多代码块，剩余全是文本
        segments.push({ type: 'text', content: remaining });
        remaining = '';
      }
    }

    // ========== 第二步：只对文本段提取数学公式 ==========
    const allMathBlocks: { formula: string; display: boolean }[] = [];

    const processedSegments = segments.map((seg) => {
      if (seg.type === 'code') return seg.content;
      const { processed, mathBlocks } = extractMathFromText(seg.content);
      allMathBlocks.push(...mathBlocks);
      return processed;
    });

    const processedText = processedSegments.join('');

    // ========== 第三步：用 marked 解析纯 Markdown ==========
    let html = marked.parse(processedText) as string;

    // ========== 第四步：用 KaTeX 渲染数学公式，替换占位符 ==========
    for (let i = 0; i < allMathBlocks.length; i++) {
      const { formula, display } = allMathBlocks[i];
      const placeholder = display
        ? `<!--MATH_BLOCK_${i}-->`
        : `<!--MATH_INLINE_${i}-->`;
      const rendered = katexRender(formula, display);
      html = html.replace(
        placeholder,
        display
          ? `<div class="katex-display">${rendered}</div>`
          : rendered,
      );
    }

    return html;
  } catch (e) {
    console.error('Markdown render error:', e);
    return text;
  }
}