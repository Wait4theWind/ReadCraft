import { useEffect, useRef, useState } from 'react';
import { createSpeechController, type SpeechController, type SpeechStatus } from '../lib/speech';

interface UseSpeechResult {
  status: SpeechStatus;
  rate: number;
  languageReady: boolean | null;
  supported: boolean;
  play: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  setRate: (rate: number) => void;
  openInstall: () => void;
}

export function useSpeech(text: string): UseSpeechResult {
  const controllerRef = useRef<SpeechController | null>(null);
  if (!controllerRef.current) {
    controllerRef.current = createSpeechController();
  }
  const controller = controllerRef.current;

  const [status, setStatus] = useState<SpeechStatus>(controller.status);
  const [rate, setRateState] = useState<number>(controller.rate);
  const [languageReady, setLanguageReady] = useState<boolean | null>(controller.languageReady);

  useEffect(() => {
    controller.load(text);
  }, [text, controller]);

  useEffect(() => {
    const update = () => {
      setStatus(controller.status);
      setRateState(controller.rate);
      setLanguageReady(controller.languageReady);
    };
    update();
    return controller.subscribe(update);
  }, [controller]);

  return {
    status,
    rate,
    languageReady,
    supported: controller.supported,
    play: () => controller.play(),
    pause: () => controller.pause(),
    resume: () => controller.resume(),
    stop: () => controller.stop(),
    setRate: (r: number) => controller.setRate(r),
    openInstall: () => controller.openInstall(),
  };
}
