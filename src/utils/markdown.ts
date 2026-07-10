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

// 自定义扩展支持：
// - 高亮 ==text==
// - 上标 ^text^
// - 下标 ~text~
// - 下划线 --text--
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
        // 支持 x^y^ 格式
        const rule = /^\^([^\^]+)\^/;
        const match = rule.exec(src);
        if (match) {
          return {
            type: 'superscript',
            raw: match[0],
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
        // 支持 H~2~O 格式
        const rule = /^~([^~]+)~/;
        const match = rule.exec(src);
        if (match) {
          return {
            type: 'subscript',
            raw: match[0],
            tokens: this.lexer.inlineTokens(match[1]),
          };
        }
      },
      renderer(token: any) {
        return `<sub>${this.parser.parseInline(token.tokens)}</sub>`;
      },
    },
    // 下划线 --text--
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

// 智能符号替换处理（手动处理，避免扩展依赖问题）
function preprocessSymbols(text: string): string {
  // (alpha) -> α, (beta) -> β, ... (pi) -> π
  const greek: Record<string, string> = {
    alpha: 'α', Alpha: 'Α',
    beta: 'β', Beta: 'Β',
    gamma: 'γ', Gamma: 'Γ',
    delta: 'δ', Delta: 'Δ',
    epsilon: 'ε', Epsilon: 'Ε',
    zeta: 'ζ', Zeta: 'Ζ',
    eta: 'η', Eta: 'Η',
    theta: 'θ', Theta: 'Θ',
    iota: 'ι', Iota: 'Ι',
    kappa: 'κ', Kappa: 'Κ',
    lambda: 'λ', Lambda: 'Λ',
    mu: 'μ', Mu: 'Μ',
    nu: 'ν', Nu: 'Ν',
    xi: 'ξ', Xi: 'Ξ',
    omicron: 'ο', Omicron: 'Ο',
    pi: 'π', Pi: 'Π',
    rho: 'ρ', Rho: 'Ρ',
    sigma: 'σ', Sigma: 'Σ',
    tau: 'τ', Tau: 'Τ',
    upsilon: 'υ', Upsilon: 'Υ',
    phi: 'φ', Phi: 'Φ',
    chi: 'χ', Chi: 'Χ',
    psi: 'ψ', Psi: 'Ψ',
    omega: 'ω', Omega: 'Ω',
  };

  // 常用数学符号
  const math: Record<string, string> = {
    inf: '∞', infty: '∞',
    neq: '≠',
    eq: '=',
    le: '≤',
    ge: '≥',
    lt: '<',
    gt: '>',
    pm: '±',
    mp: '∓',
    times: '×',
    div: '÷',
    cdot: '⋅',
    prod: '∏',
    sum: '∑',
    int: '∫',
    partial: '∂',
    nabla: '∇',
    forall: '∀',
    exists: '∃',
    emptyset: '∅',
    in: '∈',
    notin: '∉',
    subset: '⊂',
    supset: '⊃',
    subseteq: '⊆',
    supseteq: '⊇',
    cup: '∪',
    cap: '∩',
    therefore: '∴',
    because: '∵',
    vdots: '⋮',
    ddots: '⋱',
  };

  // 箭头
  const arrows: Record<string, string> = {
    '->': '→',
    '=>': '⇒',
    '<->': '↔',
    '<=>': '⇔',
    'leftarrow': '←',
    'rightarrow': '→',
    'Rightarrow': '⇒',
    'Leftarrow': '⇐',
  };

  // 符号
  const symbols: Record<string, string> = {
    c: '©',
    tm: '™',
    r: '®',
    eur: '€',
    pound: '£',
    yen: '¥',
    degree: '°',
    plusminus: '±',
  };

  // 替换所有 (xxx)
  let processed = text.replace(/\(([a-zA-Z]+)\)/g, (_, key) => {
    return greek[key] || math[key] || arrows[key] || symbols[key] || `(${key})`;
  });

  // 智能标点：-- -> –, --- -> —, ... -> …
  processed = processed.replace(/---/g, '—');
  processed = processed.replace(/--/g, '–');
  processed = processed.replace(/\.\.\./g, '…');

  return processed;
}

export function renderMarkdown(text: string): string {
  if (!text) return '';
  try {
    // 先进行符号预处理，再解析
    const processed = preprocessSymbols(text);
    return marked.parse(processed) as string;
  } catch (e) {
    console.error('Markdown render error:', e);
    return text;
  }
}