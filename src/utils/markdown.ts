import { marked } from 'marked';
import markedKatex from 'marked-katex-extension';
import { markedHighlight } from 'marked-highlight';
import markedExtendedTypographic from '@fsegurai/marked-extended-typographic';
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

// 扩展排版：智能标点、符号替换、希腊字母、数学符号等（Typora 级别）
marked.use(
  markedExtendedTypographic({
    enabled: {
      smartQuotes: true,       // 智能引号："" → “”，'' → ‘’
      dashes: true,            // 破折号：-- → –，--- → —
      ellipses: true,          // 省略号：... → …
      symbols: true,           // 符号替换：(c) → ©，(tm) → ™，(r) → ® 等
      greekLetters: true,      // 希腊字母：(alpha) → α，(pi) → π
      mathSymbols: true,       // 数学符号：(inf) → ∞，(neq) → ≠，(le) → ≤ 等
      arrows: true,           // 箭头：(->) → →，(=>) ⇒，<-> ↔ 等
      currency: true,         // 货币符号：(eur) → €，(pound) → £ 等
    },
  }),
);

// 自定义扩展支持高亮 ==text==、上标 ^text^、下标 ~text~
// 使用自定义 tokenizer 实现这些 Typora 风格扩展
const customExtensions = {
  extensions: [
    // 高亮 ==text==
    {
      name: 'highlight',
      level: 'inline',
      start(src: string) {
        return src.indexOf('==');
      },
      tokenizer(src: string) {
        const rule = /^==([\s\S]*?)==/;
        const match = rule.exec(src);
        if (match) {
          return {
            type: 'highlight',
            raw: match[0],
            text: match[1],
            tokens: this.lexer.inlineTokens(match[1]),
          };
        }
      },
      renderer(token: any) {
        return `<mark>${this.parser.parseInline(token.tokens)}</mark>`;
      },
    },
    // 上标 ^text^
    {
      name: 'superscript',
      level: 'inline',
      start(src: string) {
        return src.indexOf('^');
      },
      tokenizer(src: string) {
        const rule = /^\^([^\s^]+(?: [^\s^]+)*)\^/;
        const match = rule.exec(src);
        if (match) {
          return {
            type: 'superscript',
            raw: match[0],
            text: match[1],
            tokens: this.lexer.inlineTokens(match[1]),
          };
        }
      },
      renderer(token: any) {
        return `<sup>${this.parser.parseInline(token.tokens)}</sup>`;
      },
    },
    // 下标 ~text~
    {
      name: 'subscript',
      level: 'inline',
      start(src: string) {
        return src.indexOf('~');
      },
      tokenizer(src: string) {
        const rule = /^~([^\s~]+(?: [^\s~]+)*)~/;
        const match = rule.exec(src);
        if (match) {
          return {
            type: 'subscript',
            raw: match[0],
            text: match[1],
            tokens: this.lexer.inlineTokens(match[1]),
          };
        }
      },
      renderer(token: any) {
        return `<sub>${this.parser.parseInline(token.tokens)}</sub>`;
      },
    },
    // 下划线 __text__ 或 _text_ 已经由 italic 处理，这里添加 *text* 斜体和 __text__ 粗斜体支持
    // 实际上 marked 默认已经处理了，这里添加自定义下划线支持 --text--
    {
      name: 'underline',
      level: 'inline',
      start(src: string) {
        return src.indexOf('--');
      },
      tokenizer(src: string) {
        const rule = /^--([\s\S]*?)--/;
        const match = rule.exec(src);
        if (match) {
          return {
            type: 'underline',
            raw: match[0],
            text: match[1],
            tokens: this.lexer.inlineTokens(match[1]),
          };
        }
      },
      renderer(token: any) {
        return `<u>${this.parser.parseInline(token.tokens)}</u>`;
      },
    },
  ],
};

marked.use(customExtensions);

// 全局配置（Typora 风格）
marked.setOptions({
  gfm: true,         // GitHub Flavored Markdown：表格、删除线、任务列表、自动链接
  breaks: true,      // 换行转 <br>（Typora 风格）
  pedantic: false,   // 不严格遵循原始 markdown，允许更多语法
  silent: true,      // 不抛出异常，出错时返回原文本
});

export function renderMarkdown(text: string): string {
  if (!text) return '';
  try {
    return marked.parse(text) as string;
  } catch {
    return text;
  }
}