import type { SpeechController, SpeechStatus } from './types';
import { splitIntoSentences, toSpeechText } from './utils';

function isWebSpeechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

function pickEnglishVoice(): SpeechSynthesisVoice | null {
  if (!isWebSpeechSupported()) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  return (
    voices.find((v) => v.lang === 'en-US' && v.localService) ??
    voices.find((v) => v.lang.toLowerCase().startsWith('en')) ??
    voices.find((v) => v.default) ??
    null
  );
}

export class WebSpeechController implements SpeechController {
  private chunks: string[] = [];
  private index = 0;
  private charOffset = 0;
  private token = 0;
  private watchdog: number | null = null;
  private voice: SpeechSynthesisVoice | null = null;
  private pendingRestart = false;
  private _status: SpeechStatus = 'idle';
  private _rate = 1;
  private listeners = new Set<() => void>();

  constructor() {
    if (isWebSpeechSupported()) {
      this.voice = pickEnglishVoice();
      window.speechSynthesis.addEventListener?.('voiceschanged', () => {
        this.voice = pickEnglishVoice();
      });
    }
  }

  get status(): SpeechStatus {
    return this._status;
  }

  get rate(): number {
    return this._rate;
  }

  get supported(): boolean {
    return isWebSpeechSupported();
  }

  get languageReady(): boolean {
    return true;
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

  private clearWatchdog(): void {
    if (this.watchdog !== null) {
      window.clearTimeout(this.watchdog);
      this.watchdog = null;
    }
  }

  private estimateMs(textLength: number): number {
    return Math.max(1500, (textLength * 1000) / 14 / this._rate + 800);
  }

  private armWatchdog(index: number, token: number, textLength: number): void {
    this.clearWatchdog();
    const estMs = this.estimateMs(textLength);
    this.watchdog = window.setTimeout(() => {
      if (this.token === token) this.speakAt(index + 1, 0);
    }, estMs);
  }

  private speakAt(index: number, offset: number): void {
    if (index >= this.chunks.length) {
      this.clearWatchdog();
      this.charOffset = 0;
      this.setStatus('ended');
      return;
    }

    const chunk = this.chunks[index];
    const text = chunk.slice(offset);
    if (!text.trim()) {
      this.speakAt(index + 1, 0);
      return;
    }

    const token = ++this.token;
    this.index = index;
    this.charOffset = offset;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = this._rate;
    if (this.voice) {
      utterance.voice = this.voice;
      utterance.lang = this.voice.lang;
    }

    const advance = () => {
      if (this.token !== token) return;
      this.speakAt(index + 1, 0);
    };
    utterance.onend = advance;
    utterance.onerror = advance;
    utterance.onboundary = (event) => {
      if (this.token !== token) return;
      if (typeof event.charIndex === 'number') {
        this.charOffset = offset + event.charIndex;
      }
    };

    this.armWatchdog(index, token, text.length);
    window.speechSynthesis.speak(utterance);
    this.setStatus('playing');
  }

  private cancelAndInvalidate(): void {
    this.token++;
    this.clearWatchdog();
    window.speechSynthesis.cancel();
  }

  load(text: string): void {
    this.cancelAndInvalidate();
    this.chunks = splitIntoSentences(toSpeechText(text));
    this.index = 0;
    this.charOffset = 0;
    this.pendingRestart = false;
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
    this.cancelAndInvalidate();
    this.speakAt(this.index, this.charOffset);
  }

  pause(): void {
    if (this._status !== 'playing') return;
    this.clearWatchdog();
    window.speechSynthesis.pause();
    this.pendingRestart = false;
    this.setStatus('paused');
  }

  resume(): void {
    if (this._status !== 'paused') return;
    if (this.pendingRestart) {
      this.pendingRestart = false;
      this.cancelAndInvalidate();
      this.speakAt(this.index, this.charOffset);
      return;
    }
    window.speechSynthesis.resume();
    this.setStatus('playing');
    const remaining = this.chunks[this.index]?.slice(this.charOffset).length ?? 0;
    this.armWatchdog(this.index, this.token, remaining);
  }

  stop(): void {
    this.cancelAndInvalidate();
    this.index = 0;
    this.charOffset = 0;
    this.pendingRestart = false;
    this.setStatus('idle');
  }

  setRate(rate: number): void {
    this._rate = rate;
    if (this._status === 'playing') {
      const index = this.index;
      const offset = this.charOffset;
      this.cancelAndInvalidate();
      const token = this.token;
      window.setTimeout(() => {
        if (this.token !== token || this._status !== 'playing') return;
        this.speakAt(index, offset);
      }, 0);
    } else if (this._status === 'paused') {
      this.cancelAndInvalidate();
      this.pendingRestart = true;
    } else {
      this.emit();
    }
  }

  openInstall(): void {
    // No-op on web.
  }
}
