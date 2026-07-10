export function parseDiary(text: string): string[] {
  return text
    .split('\n')
    .map(s => s.trim())
    .filter(Boolean);
}

export function parseTrick(text: string): { title: string; description: string } {
  const lines = text.split('\n');
  const titleLine = lines.find(l => l.trim().startsWith('###'));
  const title = titleLine ? titleLine.replace(/^###\s*/, '').trim() : '未命名Trick';
  const description = lines
    .filter(l => !l.trim().startsWith('###'))
    .join('\n')
    .trim();
  return { title, description };
}

export function parseKnowledge(text: string): {
  title: string;
  coreIdea: string;
  code?: string;
  keyPoints: string[];
} {
  const lines = text.split('\n');
  const titleLine = lines.find(l => l.trim().startsWith('###'));
  const title = titleLine ? titleLine.replace(/^###\s*/, '').trim() : '未命名知识点';

  const codeMatch = text.match(/```[\s\S]*?```/);
  const code = codeMatch ? codeMatch[0] : undefined;

  const rest = lines.filter(l => !l.trim().startsWith('###') && !l.includes('```'));
  const keyPoints: string[] = [];
  const coreIdeaLines: string[] = [];

  for (const line of rest) {
    if (line.trim().startsWith('-')) {
      keyPoints.push(line.trim().replace(/^-\s*/, ''));
    } else if (line.trim()) {
      coreIdeaLines.push(line.trim());
    }
  }

  return {
    title,
    coreIdea: coreIdeaLines.join(' ').trim(),
    code,
    keyPoints,
  };
}