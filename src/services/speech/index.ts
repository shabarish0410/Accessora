import { Platform } from 'react-native';
import { SpeechService } from '../../types/speech';
import { webSpeechService } from './webSpeechRecognition';
import { nativeSpeechService } from './nativeSpeechRecognition';

export const Speech: SpeechService = Platform.OS === 'web' ? webSpeechService : nativeSpeechService;
