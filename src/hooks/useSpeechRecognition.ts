import { useState, useRef, useEffect, useCallback } from 'react';
import { Speech } from '../services/speech';
import { SpeechState, ISpeechRecognition, SpeechLang } from '../types/speech';

export interface UseSpeechRecognitionOptions {
  lang?: SpeechLang;
  onResult?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
}

export function useSpeechRecognition(options: UseSpeechRecognitionOptions = {}) {
  const { lang = 'en-IN', onResult, onError } = options;

  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState('');

  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const stateRef = useRef<SpeechState>('idle');

  const isSupported = Speech.isSupported();

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const startListening = useCallback(async () => {
    if (!isSupported) {
      setError('Speech recognition is not supported on this device/browser.');
      return;
    }

    if (stateRef.current === 'listening') return;

    setError(null);
    const hasPermission = await Speech.requestPermission();
    if (!hasPermission) {
      setError('Microphone permission is required for voice input. You can continue typing normally.');
      if (onError) onError('not-allowed');
      return;
    }

    if (!recognitionRef.current) {
      recognitionRef.current = Speech.createRecognition();
    }

    const rec = recognitionRef.current;
    if (!rec) return;

    rec.lang = lang;
    rec.interimResults = true;
    rec.continuous = false;

    rec.onstart = () => {
      setIsListening(true);
      stateRef.current = 'listening';
      setTranscript('');
    };

    rec.onresult = (event) => {
      const results = event.results;
      if (!results || results.length === 0) return;

      const lastResult = results[results.length - 1];
      setTranscript(lastResult.transcript);

      if (onResult) {
        onResult(lastResult.transcript, lastResult.isFinal);
      }

      if (lastResult.isFinal) {
        setIsProcessing(true);
        stateRef.current = 'processing';
        rec.stop();
      }
    };

    rec.onerror = (e) => {
      let friendlyMessage = 'An error occurred during speech recognition.';
      if (e.error === 'not-allowed') {
        friendlyMessage = 'Microphone permission denied. You can continue typing normally.';
      } else if (e.error === 'no-speech') {
        friendlyMessage = 'No speech detected. Please tap the mic and try again.';
      } else if (e.error === 'network') {
        friendlyMessage = 'Network error. Please check your connection and try again.';
      }
      
      setError(friendlyMessage);
      if (onError) onError(e.error);
      
      setIsListening(false);
      setIsProcessing(false);
      stateRef.current = 'error';
    };

    rec.onend = () => {
      setIsListening(false);
      setIsProcessing(false);
      stateRef.current = 'idle';
    };

    try {
      rec.start();
    } catch (err) {
      // In case it's already started
      console.warn("Speech recognition failed to start", err);
    }
  }, [isSupported, lang, onResult, onError]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  const cancelListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }
    setIsListening(false);
    setIsProcessing(false);
    stateRef.current = 'idle';
  }, []);

  return {
    isSupported,
    isListening,
    isProcessing,
    transcript,
    error,
    startListening,
    stopListening,
    cancelListening,
  };
}
