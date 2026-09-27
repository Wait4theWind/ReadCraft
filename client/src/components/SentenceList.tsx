import type { Sentence } from '../types/analysis';
import Empty from './Empty';

interface Props {
  items: Sentence[];
}

export default function SentenceList({ items }: Props) {
  if (!items.length) return <Empty text="暂无长难句" />;

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold text-slate-900">长难句精读</h2>
      <div className="space-y-4">
        {items.map((s, i) => (
          <div key={i} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-base font-medium leading-7 text-slate-900">{s.original}</p>
            {s.analysis && (
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                <span className="font-semibold text-slate-500">解析：</span>
                {s.analysis}
              </p>
            )}
            {s.translation && (
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                <span className="font-semibold text-slate-500">译文：</span>
                {s.translation}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
