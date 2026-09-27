import type { AnalysisResult } from '../types/analysis';

interface AnalyzeResponse {
  analysis: AnalysisResult;
}

interface ErrorResponse {
  error?: { code?: string; message?: string };
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/+$/, '');

export async function analyzeArticle(text: string): Promise<AnalysisResult> {
  const res = await fetch(`${API_BASE_URL}/api/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });

  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as ErrorResponse | null;
    throw new Error(data?.error?.message ?? '分析失败，请稍后重试');
  }

  const data = (await res.json()) as AnalyzeResponse;
  return data.analysis;
}
