import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { VoiceTextInput as TextInput } from './VoiceTextInput';
import { C } from '../types';

export function RoleSelector({ onSelect }: { onSelect: (r: 'guard' | 'chairman') => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    const user = username.trim().toLowerCase();
    if (user === 'guard' || user === 'security') {
      onSelect('guard');
    } else if (user === 'chairman' || user === 'admin') {
      onSelect('chairman');
    } else {
      Alert.alert('Invalid credentials', 'Please enter a valid username (e.g., guard or chairman)');
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <Image 
          source={{ uri: 'https://static.wixstatic.com/media/2faa6d_acc04fb02882461e906fc55049768b40~mv2.png' }} 
          style={styles.logoImage}
          resizeMode="contain"
        />
        <Text style={styles.title}>Accessora</Text>
        <Text style={styles.subtitle}>Swarna Bharathi Institute of Science & Technology</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionLabel}>ACCOUNT LOGIN</Text>
        
        <View style={styles.formGroup}>
          <TextInput
            style={styles.input}
            placeholder="Username"
            placeholderTextColor={C.textMuted}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={C.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          
          <TouchableOpacity onPress={handleLogin} activeOpacity={0.8} style={styles.loginBtn}>
            <Text style={styles.loginBtnText}>Login</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.demoSection}>
          <Text style={styles.demoText}>Quick Demo Access</Text>
          <View style={styles.demoButtons}>
            <TouchableOpacity onPress={() => onSelect('guard')} style={styles.demoBtn}>
              <Text style={styles.demoBtnText}>🛡️ Guard</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onSelect('chairman')} style={[styles.demoBtn, styles.demoBtnChairman]}>
              <Text style={styles.demoBtnText}>👔 Chairman</Text>
            </TouchableOpacity>
          </View>
        </View>

      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoImage: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: C.textPrimary,
    letterSpacing: -1,
    textAlign: 'center',
  },
  subtitle: {
    color: C.textSecondary,
    marginTop: 8,
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: C.surface,
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: C.border,
    elevation: 2,
    shadowColor: C.textPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
  },
  sectionLabel: {
    textAlign: 'center',
    color: C.textSecondary,
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 20,
  },
  formGroup: {
    gap: 16,
  },
  input: {
    backgroundColor: C.background,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: C.textPrimary,
  },
  loginBtn: {
    backgroundColor: C.primaryDark,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  loginBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  demoSection: {
    marginTop: 32,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: C.border,
    alignItems: 'center',
  },
  demoText: {
    color: C.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 16,
  },
  demoButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  demoBtn: {
    backgroundColor: `${C.primary}15`,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: `${C.primary}30`,
  },
  demoBtnChairman: {
    backgroundColor: `${C.primaryDark}15`,
    borderColor: `${C.primaryDark}30`,
  },
  demoBtnText: {
    color: C.primaryDark,
    fontWeight: '600',
    fontSize: 14,
  },
});
