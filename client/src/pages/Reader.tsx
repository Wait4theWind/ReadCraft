import { useState } from 'react';
import { Link } from 'react-router-dom';
import { loadLatest } from '../lib/storage';
import type { StoredArticle } from '../types/analysis';
import SpeechControls from '../components/SpeechControls';
import ArticleView from '../components/ArticleView';
import VocabularyList from '../components/VocabularyList';
import KeyPointList from '../components/KeyPointList';
import SentenceList from '../components/SentenceList';
import SummaryCard from '../components/SummaryCard';

type Tab = 'article' | 'vocabulary' | 'keypoints' | 'sentences' | 'summary';

const TABS: { id: Tab; label: string }[] = [
  { id: 'article', label: '原文' },
  { id: 'vocabulary', label: '词汇' },
  { id: 'keypoints', label: '考点' },
  { id: 'sentences', label: '长难句' },
  { id: 'summary', label: '总结' },
];

export default function Reader() {
  const [article] = useState<StoredArticle | null>(() => loadLatest());
  const [tab, setTab] = useState<Tab>('article');

  if (!article) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 p-4 text-center">
        <p className="text-slate-600">没有已分析的文章。</p>
        <Link to="/" className="text-indigo-600 hover:underline">
          返回首页粘贴文章
        </Link>
      </div>
    );
  }

  const analysis = article.analysis;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto max-w-3xl px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Link to="/" className="text-slate-400 transition hover:text-slate-600" aria-label="返回首页">
                ←
              </Link>
              <span className="font-semibold text-slate-900">ReadCraft</span>
              <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-600">
                {analysis.difficulty}
              </span>
            </div>
          </div>

          <div className="mt-3">
            <SpeechControls text={article.originalText} />
          </div>

          <nav className="mt-3 flex gap-1 overflow-x-auto">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  tab === t.id
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {t.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6">
        {tab === 'article' && <ArticleView paragraphs={analysis.paragraphs} />}
        {tab === 'vocabulary' && <VocabularyList items={analysis.vocabulary} />}
        {tab === 'keypoints' && <KeyPointList items={analysis.keyPoints} />}
        {tab === 'sentences' && <SentenceList items={analysis.sentences} />}
        {tab === 'summary' && (
          <SummaryCard summary={analysis.summary} difficulty={analysis.difficulty} />
        )}
      </main>
    </div>
  );
}
