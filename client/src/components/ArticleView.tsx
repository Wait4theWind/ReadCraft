import { useState } from 'react';
import type { Paragraph } from '../types/analysis';

interface Props {
  paragraphs: Paragraph[];
}

export default function ArticleView({ paragraphs }: Props) {
  const [showTranslation, setShowTranslation] = useState(true);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">原文</h2>
        <button
          onClick={() => setShowTranslation((v) => !v)}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
        >
          {showTranslation ? '隐藏译文' : '显示译文'}
        </button>
      </div>

      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        {paragraphs.map((p, i) => (
          <div key={i} className="mb-6 last:mb-0">
            <p className="text-base leading-8 text-slate-800">{p.english}</p>
            {showTranslation && (
              <p className="mt-2 border-l-2 border-indigo-200 pl-3 text-base leading-8 text-slate-500">
                {p.translation}
              </p>
            )}
          </div>
        ))}
      </article>
    </div>
  );
}
