import { RATES } from '../lib/speech';
import { useSpeech } from '../hooks/useSpeech';

interface Props {
  text: string;
}

export default function SpeechControls({ text }: Props) {
  const { status, rate, languageReady, supported, play, pause, resume, stop, setRate, openInstall } =
    useSpeech(text);

  if (!supported) {
    return <p className="text-sm text-slate-400">当前浏览器不支持朗读功能，请使用 Chrome 或 Edge。</p>;
  }

  if (languageReady === false) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-sm text-amber-600">当前设备缺少英文语音包，无法朗读。</p>
        <button
          onClick={openInstall}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
        >
          安装英文语音
        </button>
      </div>
    );
  }

  const isPlaying = status === 'playing';
  const isPaused = status === 'paused';
  const isStopped = status === 'idle' || status === 'ended';

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2">
        <button
          onClick={isPlaying ? pause : isPaused ? resume : play}
          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
        >
          {isPlaying ? 'Pause' : isPaused ? 'Resume' : 'Play'}
        </button>
        <button
          onClick={stop}
          disabled={isStopped}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Stop
        </button>
      </div>

      <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
        {RATES.map((r) => (
          <button
            key={r}
            onClick={() => setRate(r)}
            className={`rounded-md px-2 py-1 text-xs font-medium transition ${
              r === rate
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {r}x
          </button>
        ))}
      </div>
    </div>
  );
}
