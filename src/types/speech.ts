export type SpeechState = 'idle' | 'listening' | 'processing' | 'error' | 'done';
export type SpeechLang = 'en-IN' | 'te-IN' | 'hi-IN' | 'ta-IN' | 'kn-IN';

export interface SpeechRecognitionResult {
  transcript: string;
  isFinal: boolean;
}

export interface SpeechRecognitionEvent {
  results: SpeechRecognitionResult[];
}

export interface SpeechRecognitionErrorEvent {
  error: 'not-allowed' | 'no-speech' | 'network' | 'aborted' | string;
  message?: string;
}

export interface ISpeechRecognition {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;

  start(): void;
  stop(): void;
  abort(): void;
}

export interface SpeechService {
  isSupported(): boolean;
  requestPermission(): Promise<boolean>;
  createRecognition(): ISpeechRecognition | null;
}
