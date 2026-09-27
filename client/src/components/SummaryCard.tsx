import type { AnalysisResult } from '../types/analysis';

interface Props {
  summary: AnalysisResult['summary'];
  difficulty: string;
}

export default function SummaryCard({ summary, difficulty }: Props) {
  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold text-slate-900">文章总结</h2>
      <div className="space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-2 text-sm font-semibold text-indigo-600">Summary</h3>
          <p className="text-base leading-7 text-slate-800">{summary.english}</p>
        </div>
        <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-5">
          <h3 className="mb-2 text-sm font-semibold text-indigo-600">中文总结</h3>
          <p className="text-base leading-7 text-slate-700">{summary.chinese}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-2 text-sm font-semibold text-slate-500">难度</h3>
          <span className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-600">
            {difficulty}
          </span>
        </div>
      </div>
    </div>
  );
}
