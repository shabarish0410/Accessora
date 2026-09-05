import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, TextInputProps, TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

export interface VoiceTextInputProps extends TextInputProps {
  voiceEnabled?: boolean;
  onVoiceError?: (error: string) => void;
  lang?: 'en-IN' | 'te-IN' | 'hi-IN' | 'ta-IN' | 'kn-IN';
}

export function VoiceTextInput({
  voiceEnabled,
  secureTextEntry,
  value,
  onChangeText,
  style,
  onVoiceError,
  lang = 'en-IN',
  ...props
}: VoiceTextInputProps) {
  // Disable voice by default for passwords
  const isVoiceEnabled = voiceEnabled ?? !secureTextEntry;

  const [text, setText] = useState(value || '');
  const originalTextRef = useRef(value || '');

  // Keep internal text state in sync with external value
  useEffect(() => {
    if (value !== undefined) {
      setText(value);
      if (!isListening) {
        originalTextRef.current = value;
      }
    }
  }, [value]);

  const {
    isListening,
    isProcessing,
    isSupported,
    error,
    startListening,
    stopListening,
  } = useSpeechRecognition({
    lang,
    onResult: (transcript, isFinal) => {
      // Append the new transcript to the text that existed before listening started
      const newText = originalTextRef.current + (originalTextRef.current && transcript ? ' ' : '') + transcript;
      setText(newText);
      if (onChangeText) {
        onChangeText(newText);
      }
      if (isFinal) {
        originalTextRef.current = newText;
      }
    },
    onError: (err) => {
      if (onVoiceError) onVoiceError(err);
    }
  });

  const handleMicPress = () => {
    if (isListening || isProcessing) {
      stopListening();
    } else {
      originalTextRef.current = text; // Snapshot current text
      startListening();
    }
  };

  const handleTextChange = (newText: string) => {
    setText(newText);
    originalTextRef.current = newText;
    if (onChangeText) {
      onChangeText(newText);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        {...props}
        value={text}
        onChangeText={handleTextChange}
        secureTextEntry={secureTextEntry}
        style={[style, isVoiceEnabled && styles.inputWithMic]}
      />
      
      {isVoiceEnabled && (
        <TouchableOpacity
          onPress={handleMicPress}
          style={[styles.micButton, !isSupported && { opacity: 0.4 }]}
          accessibilityLabel="Voice input"
        >
          {isProcessing ? (
            <ActivityIndicator size="small" color="#4a90e2" />
          ) : isListening ? (
            <Text style={styles.iconListening}>🎙️</Text>
          ) : error ? (
            <Text style={styles.iconError}>⚠️</Text>
          ) : (
            <Text style={styles.iconIdle}>🎤</Text>
          )}
        </TouchableOpacity>
      )}
      
      {/* We can show an error message below the input if needed, but per UX rules:
          "Never expose raw browser/native error objects... use user-friendly messages."
          If we want to show it, we can. The hook already provides friendly messages.
          For now, just a tiny indicator if there's an error. 
      */}
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: '100%',
  },
  inputWithMic: {
    paddingRight: 40, // leave space for mic button
  },
  micButton: {
    position: 'absolute',
    right: 8,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    width: 32,
    zIndex: 10,
  },
  iconIdle: {
    fontSize: 18,
    opacity: 0.6,
  },
  iconListening: {
    fontSize: 20,
    color: 'red', // red doesn't apply to emoji on all platforms, but sometimes works
  },
  iconError: {
    fontSize: 18,
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 12,
    marginTop: 4,
    marginBottom: 4,
  }
});
