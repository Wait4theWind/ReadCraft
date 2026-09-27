import { Capacitor } from '@capacitor/core';
import type { SpeechController } from './types';
import { WebSpeechController } from './web';
import { NativeSpeechController } from './native';

export type { SpeechController, SpeechStatus } from './types';
export { RATES, splitIntoSentences, toSpeechText } from './utils';

export function createSpeechController(): SpeechController {
  const isAndroidNative = Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';
  return isAndroidNative ? new NativeSpeechController() : new WebSpeechController();
}
