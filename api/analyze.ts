import type { VercelRequest, VercelResponse } from '@vercel/node';
import { analyzeArticle } from '../server/src/analyze';

const MAX_CHARS = 10000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

export default async function handler(req: VercelRequest, res: VercelResponse) {
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
