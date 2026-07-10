import { marked } from 'marked';
import markedKatex from 'marked-katex-extension';
import { markedHighlight } from 'marked-highlight';
import hljs from 'highlight.js';
import 'katex/dist/katex.min.css';
import 'highlight.js/styles/github-dark.min.css';

// 配置 KaTeX 数学公式（支持内联 $...$ 和块级 $$...$$）
marked.use(
  markedKatex({
    throwOnError: false,
    nonStandard: true,
    strict: false,
    output: 'html',
  }),
);

// 配置代码语法高亮（支持所有主流编程语言）
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
  gfm: true,         // GitHub Flavored Markdown：表格、删除线、任务列表、自动链接
  breaks: true,      // 换行转 <br>
  pedantic: false,
});

export function renderMarkdown(text: string): string {
  if (!text) return '';
  try {
    return marked.parse(text) as string;
  } catch (e) {
    console.error('Markdown render error:', e);
    return text;
  }
}