import { ISpeechRecognition, SpeechService, SpeechRecognitionEvent, SpeechRecognitionErrorEvent } from '../../types/speech';

let ExpoSpeechRecognitionModule: any = null;

try {
  const expoSpeech = require('expo-speech-recognition');
  ExpoSpeechRecognitionModule = expoSpeech?.ExpoSpeechRecognitionModule || null;
} catch (e) {
  // ExpoSpeechRecognitionModule is unavailable (e.g. running inside Expo Go)
  ExpoSpeechRecognitionModule = null;
}

class NativeSpeechRecognition implements ISpeechRecognition {
  public lang: string = 'en-IN';
  public interimResults: boolean = true;
  public continuous: boolean = false;

  public onresult: ((event: SpeechRecognitionEvent) => void) | null = null;
  public onerror: ((event: SpeechRecognitionErrorEvent) => void) | null = null;
  public onend: (() => void) | null = null;
  public onstart: (() => void) | null = null;

  private startSubscription: any = null;
  private resultSubscription: any = null;
  private errorSubscription: any = null;
  private endSubscription: any = null;

  constructor() {
    if (!ExpoSpeechRecognitionModule) return;
    try {
      this.startSubscription = ExpoSpeechRecognitionModule.addListener('start', () => {
        if (this.onstart) this.onstart();
      });
      this.resultSubscription = ExpoSpeechRecognitionModule.addListener('result', (event: any) => {
        if (this.onresult) this.onresult(event);
      });
      this.errorSubscription = ExpoSpeechRecognitionModule.addListener('error', (event: any) => {
        if (this.onerror) this.onerror({ error: event.error, message: event.message });
      });
      this.endSubscription = ExpoSpeechRecognitionModule.addListener('end', () => {
        if (this.onend) this.onend();
      });
    } catch (e) {
      console.warn("Failed to subscribe to ExpoSpeechRecognitionModule events", e);
    }
  }

  start(): void {
    if (!ExpoSpeechRecognitionModule) return;
    try {
      ExpoSpeechRecognitionModule.start({
        lang: this.lang,
        interimResults: this.interimResults,
        continuous: this.continuous,
      });
    } catch (e) {
      console.warn("Failed to start ExpoSpeechRecognitionModule", e);
    }
  }

  stop(): void {
    if (!ExpoSpeechRecognitionModule) return;
    try {
      ExpoSpeechRecognitionModule.stop();
    } catch (e) {
      console.warn("Failed to stop ExpoSpeechRecognitionModule", e);
    }
  }

  abort(): void {
    if (!ExpoSpeechRecognitionModule) return;
    try {
      ExpoSpeechRecognitionModule.abort();
    } catch (e) {
      console.warn("Failed to abort ExpoSpeechRecognitionModule", e);
    }
    if (this.startSubscription?.remove) this.startSubscription.remove();
    if (this.resultSubscription?.remove) this.resultSubscription.remove();
    if (this.errorSubscription?.remove) this.errorSubscription.remove();
    if (this.endSubscription?.remove) this.endSubscription.remove();
  }
}

export const nativeSpeechService: SpeechService = {
  isSupported: () => {
    return !!ExpoSpeechRecognitionModule;
  },

  requestPermission: async () => {
    if (!ExpoSpeechRecognitionModule) return false;
    try {
      const response = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      return !!response?.granted;
    } catch (e) {
      return false;
    }
  },

  createRecognition: () => {
    if (!ExpoSpeechRecognitionModule) return null;
    return new NativeSpeechRecognition();
  }
};
