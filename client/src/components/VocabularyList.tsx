import type { VocabularyItem } from '../types/analysis';
import Empty from './Empty';

interface Props {
  items: VocabularyItem[];
}

export default function VocabularyList({ items }: Props) {
  if (!items.length) return <Empty text="暂无词汇" />;

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold text-slate-900">核心词汇</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((v, i) => (
          <div key={i} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-semibold text-slate-900">{v.word}</span>
              <span className="text-sm italic text-slate-400">{v.partOfSpeech}</span>
            </div>
            <p className="mt-1 text-sm text-slate-600">{v.meaning}</p>
            {v.example && <p className="mt-2 text-sm italic text-slate-400">"{v.example}"</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
