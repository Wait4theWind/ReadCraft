import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyzeArticle } from '../lib/api';
import { saveLatest } from '../lib/storage';

const MAX_CHARS = 10000;

export default function Home() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const canAnalyze = text.trim().length > 0 && !loading;

  async function handleAnalyze() {
    if (!canAnalyze) return;
    setLoading(true);
    setError(null);
    try {
      const trimmed = text.trim();
      const analysis = await analyzeArticle(trimmed);
      saveLatest({ originalText: trimmed, analysis, createdAt: new Date().toISOString() });
      navigate('/reader');
    } catch (e) {
      setError(e instanceof Error ? e.message : '分析失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:py-16">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">ReadCraft</h1>
          <p className="mt-2 text-slate-500">AI-powered English Reading Companion</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste an English article here..."
            rows={12}
            maxLength={MAX_CHARS}
            className="w-full resize-y rounded-xl border-0 bg-slate-50 p-4 text-base leading-relaxed text-slate-900 outline-none ring-1 ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500"
          />
          <div className="mt-1 flex justify-end text-xs text-slate-400">
            <span>
              {text.length.toLocaleString()} / {MAX_CHARS.toLocaleString()}
            </span>
          </div>

          {error && (
            <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
          )}

          <button
            onClick={handleAnalyze}
            disabled={!canAnalyze}
            className="mt-4 w-full rounded-xl bg-indigo-600 px-4 py-3 text-base font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Analyzing...' : 'Analyze Article'}
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-slate-400">
          Paste → Analyze → Read → Listen → Learn
        </p>
      </div>
    </div>
  );
}
