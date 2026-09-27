import { TextToSpeech, QueueStrategy } from '@capacitor-community/text-to-speech';
import type { SpeechController, SpeechStatus } from './types';
import { splitIntoSentences, toSpeechText } from './utils';

const LANG = 'en-US';

export class NativeSpeechController implements SpeechController {
  private chunks: string[] = [];
  private index = 0;
  private charOffset = 0;
  private generation = 0;
  private activeBaseOffset = 0;
  private _status: SpeechStatus = 'idle';
  private _rate = 1;
  private _languageReady: boolean | null = null;
  private listeners = new Set<() => void>();

  constructor() {
    void this.init();
  }

  private async init(): Promise<void> {
    try {
      const { supported } = await TextToSpeech.isLanguageSupported({ lang: LANG });
      this._languageReady = supported;
    } catch {
      this._languageReady = false;
    }
    this.emit();

    try {
      await TextToSpeech.addListener('onRangeStart', (info) => {
        this.charOffset = this.activeBaseOffset + info.start;
      });
    } catch {
      // Position tracking is best-effort; playback still works without it.
    }
  }

  get status(): SpeechStatus {
    return this._status;
  }

  get rate(): number {
    return this._rate;
  }

  get supported(): boolean {
    return true;
  }

  get languageReady(): boolean | null {
    return this._languageReady;
  }

  subscribe(cb: () => void): () => void {
    this.listeners.add(cb);
    return () => {
      this.listeners.delete(cb);
    };
  }

  private emit(): void {
    this.listeners.forEach((cb) => cb());
  }

  private setStatus(status: SpeechStatus): void {
    this._status = status;
    this.emit();
  }

  private stopEngine(): void {
    void TextToSpeech.stop().catch(() => undefined);
  }

  load(text: string): void {
    this.generation++;
    this.stopEngine();
    this.chunks = splitIntoSentences(toSpeechText(text));
    this.index = 0;
    this.charOffset = 0;
    this.setStatus('idle');
  }

  play(): void {
    if (!this.chunks.length) return;
    if (this._status === 'paused') {
      this.resume();
      return;
    }
    if (this._status === 'playing') return;
    if (this._status === 'ended') {
      this.index = 0;
      this.charOffset = 0;
    }
    void this.startLoop(this.index, this.charOffset);
  }

  pause(): void {
    if (this._status !== 'playing') return;
    this.generation++;
    this.stopEngine();
    this.setStatus('paused');
  }

  resume(): void {
    if (this._status !== 'paused') return;
    void this.startLoop(this.index, this.charOffset);
  }

  stop(): void {
    this.generation++;
    this.stopEngine();
    this.index = 0;
    this.charOffset = 0;
    this.setStatus('idle');
  }

  setRate(rate: number): void {
    this._rate = rate;
    if (this._status === 'playing') {
      void this.startLoop(this.index, this.charOffset);
    } else {
      this.emit();
    }
  }

  openInstall(): void {
    void TextToSpeech.openInstall().catch(() => undefined);
  }

  private async startLoop(startIndex: number, startOffset: number): Promise<void> {
    const gen = ++this.generation;
    let index = startIndex;
    let offset = startOffset;
    this.setStatus('playing');

    while (index < this.chunks.length) {
      if (gen !== this.generation) return;

      const chunk = this.chunks[index];
      const text = chunk.slice(offset);
      if (!text.trim()) {
        index += 1;
        offset = 0;
        continue;
      }

      this.index = index;
      this.charOffset = offset;
      this.activeBaseOffset = offset;

      try {
        await TextToSpeech.speak({
          text,
          lang: LANG,
          rate: this._rate,
          queueStrategy: QueueStrategy.Flush,
        });
      } catch {
        if (gen !== this.generation) return;
        this.setStatus('idle');
        return;
      }

      if (gen !== this.generation) return;
      index += 1;
      offset = 0;
    }

    if (gen === this.generation) {
      this.charOffset = 0;
      this.setStatus('ended');
    }
  }
}
