import { config } from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { analyzeArticle } from './analyze';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

config({ path: path.resolve(__dirname, '../../.env.local') });
config({ path: path.resolve(__dirname, '../../.env') });

const PORT = Number(process.env.PORT) || 3001;
const MAX_CHARS = 10000;

const app = express();
app.use(express.json({ limit: '1mb' }));

const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', CORS_ORIGIN);
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }
  next();
});

app.post('/api/analyze', async (req, res) => {
  try {
    const text = typeof req.body?.text === 'string' ? req.body.text.trim() : '';

    if (!text) {
      return res.status(400).json({ error: { code: 'EMPTY_TEXT', message: '请先粘贴英文文章' } });
    }
    if (text.length > MAX_CHARS) {
      return res
        .status(400)
        .json({ error: { code: 'TOO_LONG', message: `文章过长，请控制在 ${MAX_CHARS} 字以内` } });
    }

    const analysis = await analyzeArticle(text);
    res.json({ analysis });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'AI 分析失败';
    res.status(500).json({ error: { code: 'ANALYZE_FAILED', message } });
  }
});

const clientDist = path.resolve(__dirname, '../../client/dist');
app.use(express.static(clientDist));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(clientDist, 'index.html'), (err) => {
    if (err) next();
  });
});

app.listen(PORT, () => {
  console.log(`ReadCraft server listening on http://localhost:${PORT}`);
});
