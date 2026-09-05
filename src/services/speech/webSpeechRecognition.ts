import { ISpeechRecognition, SpeechService, SpeechRecognitionEvent, SpeechRecognitionErrorEvent } from '../../types/speech';

class WebSpeechRecognition implements ISpeechRecognition {
  private recognition: any;
  public lang: string = 'en-IN';
  public interimResults: boolean = true;
  public continuous: boolean = false;

  public onresult: ((event: SpeechRecognitionEvent) => void) | null = null;
  public onerror: ((event: SpeechRecognitionErrorEvent) => void) | null = null;
  public onend: (() => void) | null = null;
  public onstart: (() => void) | null = null;

  constructor(NativeSpeechRecognition: any) {
    this.recognition = new NativeSpeechRecognition();
    
    this.recognition.onresult = (event: any) => {
      if (!this.onresult) return;
      const results = Array.from(event.results).map((res: any) => ({
        transcript: res[0].transcript,
        isFinal: res.isFinal,
      }));
      this.onresult({ results });
    };

    this.recognition.onerror = (event: any) => {
      if (this.onerror) {
        this.onerror({ error: event.error, message: event.message });
      }
    };

    this.recognition.onend = () => {
      if (this.onend) this.onend();
    };

    this.recognition.onstart = () => {
      if (this.onstart) this.onstart();
    };
  }

  start(): void {
    this.recognition.lang = this.lang;
    this.recognition.interimResults = this.interimResults;
    this.recognition.continuous = this.continuous;
    this.recognition.start();
  }

  stop(): void {
    this.recognition.stop();
  }

  abort(): void {
    this.recognition.abort();
  }
}

export const webSpeechService: SpeechService = {
  isSupported: () => {
    return typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
  },
  
  requestPermission: async () => {
    if (!webSpeechService.isSupported()) return false;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (e) {
      return false;
    }
  },

  createRecognition: () => {
    if (!webSpeechService.isSupported()) return null;
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    return new WebSpeechRecognition(SpeechRec);
  }
};
