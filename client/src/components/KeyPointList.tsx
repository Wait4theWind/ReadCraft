import type { KeyPoint } from '../types/analysis';
import Empty from './Empty';

const TYPE_STYLES: Record<string, string> = {
  grammar: 'bg-indigo-50 text-indigo-600',
  vocabulary: 'bg-emerald-50 text-emerald-600',
  structure: 'bg-amber-50 text-amber-600',
  logic: 'bg-rose-50 text-rose-600',
};

const TYPE_LABELS: Record<string, string> = {
  grammar: '语法',
  vocabulary: '词汇',
  structure: '结构',
  logic: '逻辑',
};

interface Props {
  items: KeyPoint[];
}

export default function KeyPointList({ items }: Props) {
  if (!items.length) return <Empty text="暂无考点" />;

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold text-slate-900">考点</h2>
      <div className="space-y-3">
        {items.map((k, i) => (
          <div key={i} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-2 flex items-center gap-2">
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  TYPE_STYLES[k.type] ?? 'bg-slate-100 text-slate-600'
                }`}
              >
                {TYPE_LABELS[k.type] ?? k.type}
              </span>
              <span className="font-semibold text-slate-900">{k.title}</span>
            </div>
            <p className="text-sm leading-relaxed text-slate-600">{k.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
