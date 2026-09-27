import { useEffect, useRef, useState } from 'react';
import { SpeechController, type SpeechStatus } from '../lib/speech';

interface UseSpeechResult {
  status: SpeechStatus;
  rate: number;
  play: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  setRate: (rate: number) => void;
  supported: boolean;
}

export function useSpeech(text: string): UseSpeechResult {
  const controllerRef = useRef<SpeechController | null>(null);
  if (!controllerRef.current) {
    controllerRef.current = new SpeechController();
  }
  const controller = controllerRef.current;

  const [status, setStatus] = useState<SpeechStatus>(controller.status);
  const [rate, setRateState] = useState<number>(controller.rate);

  useEffect(() => {
    controller.load(text);
  }, [text, controller]);

  useEffect(() => {
    return controller.subscribe(() => {
      setStatus(controller.status);
      setRateState(controller.rate);
    });
  }, [controller]);

  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  return {
    status,
    rate,
    play: () => controller.play(),
    pause: () => controller.pause(),
    resume: () => controller.resume(),
    stop: () => controller.stop(),
    setRate: (r: number) => controller.setRate(r),
    supported,
  };
}
