import { z } from 'zod';

interface Req {
  method?: string;
  body?: Record<string, unknown>;
}

interface Res {
  setHeader(name: string, value: string): void;
  status(code: number): Res;
  json(body: unknown): void;
  end(): void;
}

const VocabularyItemSchema = z.object({
  word: z.string(),
  partOfSpeech: z.string(),
  meaning: z.string(),
  example: z.string(),
});

const KeyPointSchema = z.object({
  type: z.string(),
  title: z.string(),
  content: z.string(),
});

const SentenceSchema = z.object({
  original: z.string(),
  analysis: z.string(),
  translation: z.string(),
});

const ParagraphSchema = z.object({
  english: z.string(),
  translation: z.string(),
});

const AnalysisResultSchema = z.object({
  paragraphs: z.array(ParagraphSchema),
  summary: z.object({
    english: z.string(),
    chinese: z.string(),
  }),
  difficulty: z.string(),
  vocabulary: z.array(VocabularyItemSchema),
  keyPoints: z.array(KeyPointSchema),
  sentences: z.array(SentenceSchema),
});

const SYSTEM_PROMPT = `You are ReadCraft, an AI English reading tutor for Chinese college students preparing for CET-4, CET-6 and 考研 (postgraduate entrance exam).

Analyze the English article provided by the user and return a STRICT JSON object only (no markdown, no code fences, no extra commentary) with exactly this shape:

{
  "paragraphs": [
    { "english": "原文段落（逐字保留，不要改写）", "translation": "该段落对应的中文翻译" }
  ],
  "summary": {
    "english": "2-3 句英文摘要",
    "chinese": "对应的中文摘要"
  },
  "difficulty": "CET-4 或 CET-6 或 考研 或 托福 或 雅思 或 其他",
  "vocabulary": [
    { "word": "核心词", "partOfSpeech": "adj.", "meaning": "中文释义", "example": "包含该词的简短英文例句" }
  ],
  "keyPoints": [
    { "type": "grammar", "title": "考点标题(简短)", "content": "中文讲解该考点/语法/结构/逻辑" }
  ],
  "sentences": [
    { "original": "长难句原文", "analysis": "该句的语法与结构分析(中文)", "translation": "该句中文翻译" }
  ]
}

Rules:
- "paragraphs": split the article into paragraphs exactly as they appear (split on blank lines / line breaks). Keep the original order. Do NOT merge, reorder, or rewrite the English text — "english" must be the verbatim original text of that paragraph. If the article has no obvious paragraph breaks, split reasonably by line breaks. Provide one "translation" (natural, fluent Chinese) for every English paragraph.
- "summary": 2-3 sentence English summary and its Chinese translation.
- "vocabulary": choose 8-15 core or exam-relevant words (especially CET-6/考研 level words). "meaning" is concise Chinese. "example" is a short English sentence demonstrating usage.
- "keyPoints": list 3-6 exam-relevant points. "type" MUST be one of: grammar, vocabulary, structure, logic.
- "sentences": pick 2-5 long or difficult sentences worth deep reading. "analysis" explains grammar and structure in Chinese.
- All Chinese text must be clear and helpful to English learners.

Return ONLY the JSON object.`;

const MAX_RETRIES = 2;

async function analyzeArticle(text: string) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('缺少环境变量 OPENAI_API_KEY');
  }
  const baseUrl = (process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/+$/, '');
  const model = process.env.OPENAI_MODEL || 'deepseek-chat';

  let lastError: unknown = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          temperature: 0.3,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: text },
          ],
        }),
      });

      if (!res.ok) {
        const body = await res.text();
        throw new Error(`AI 服务请求失败 (${res.status}): ${body.slice(0, 300)}`);
      }

      const data = (await res.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      const content = data.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('AI 服务返回内容为空');
      }

      return AnalysisResultSchema.parse(JSON.parse(content));
    } catch (err) {
      lastError = err;
      if (attempt === MAX_RETRIES) break;
      await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
    }
  }

  throw lastError instanceof Error ? lastError : new Error('AI 分析失败');
}

const MAX_CHARS = 10000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

export default async function handler(req: Req, res: Res) {
  res.setHeader('Access-Control-Allow-Origin', CORS_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: { code: 'METHOD_NOT_ALLOWED', message: '仅支持 POST 请求' } });
    return;
  }

  try {
    const text = typeof req.body?.text === 'string' ? req.body.text.trim() : '';

    if (!text) {
      res.status(400).json({ error: { code: 'EMPTY_TEXT', message: '请先粘贴英文文章' } });
      return;
    }
    if (text.length > MAX_CHARS) {
      res.status(400).json({ error: { code: 'TOO_LONG', message: `文章过长，请控制在 ${MAX_CHARS} 字以内` } });
      return;
    }

    const analysis = await analyzeArticle(text);
    res.status(200).json({ analysis });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'AI 分析失败';
    res.status(500).json({ error: { code: 'ANALYZE_FAILED', message } });
  }
}
