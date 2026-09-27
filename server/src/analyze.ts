import { AnalysisResultSchema, type AnalysisResult } from './types';
import { buildSystemPrompt } from './prompt';

const MAX_RETRIES = 2;

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`缺少环境变量 ${key}，请检查 .env.local`);
  }
  return value;
}

export async function analyzeArticle(text: string): Promise<AnalysisResult> {
  const apiKey = requireEnv('OPENAI_API_KEY');
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
            { role: 'system', content: buildSystemPrompt() },
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

      const parsed = JSON.parse(content);
      return AnalysisResultSchema.parse(parsed);
    } catch (err) {
      lastError = err;
      if (attempt === MAX_RETRIES) break;
      await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
    }
  }

  throw lastError instanceof Error ? lastError : new Error('AI 分析失败');
}
