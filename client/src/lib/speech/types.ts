export type SpeechStatus = 'idle' | 'playing' | 'paused' | 'ended';

export interface SpeechController {
  readonly status: SpeechStatus;
  readonly rate: number;
  readonly supported: boolean;
  readonly languageReady: boolean | null;
  load(text: string): void;
  play(): void;
  pause(): void;
  resume(): void;
  stop(): void;
  setRate(rate: number): void;
  openInstall(): void;
  subscribe(cb: () => void): () => void;
}
