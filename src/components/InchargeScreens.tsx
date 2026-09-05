import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, ScrollView, Platform } from 'react-native';
import { C } from '../types';
import { AuthService } from '../services/auth';
import { supabase } from '../services/supabase';

export function ManageGuardsScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [guards, setGuards] = useState<{ id: string; username: string; full_name: string }[]>([]);
  const [loadingGuards, setLoadingGuards] = useState(true);

  const fetchGuards = async () => {
    setLoadingGuards(true);
    const { data, error } = await supabase.rpc('list_guards');
    if (error) {
      console.error('Error fetching guards:', error.message);
    }
    if (data) {
      setGuards(data);
    }
    setLoadingGuards(false);
  };

  useEffect(() => {
    fetchGuards();
  }, []);

  const handleCreateGuard = async () => {
    if (!username.trim() || !password) {
      setErrorMsg('Please enter both username and password.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await AuthService.createGuard(username.trim(), password, username.trim());
      setSuccessMsg(`Guard "${username.trim()}" created successfully!`);
      setUsername('');
      setPassword('');
      fetchGuards();
    } catch (e: any) {
      setErrorMsg(e.message || 'Failed to create guard.');
    }
    setLoading(false);
  };

  const executeDelete = async (guardId: string, guardName: string) => {
    setLoadingGuards(true);
    try {
      await AuthService.deleteGuard(guardId);
      setSuccessMsg(`Guard "${guardName}" deleted successfully.`);
      fetchGuards();
    } catch (e: any) {
      if (Platform.OS === 'web') {
        window.alert(e.message || 'Failed to delete guard.');
      }
    }
    setLoadingGuards(false);
  };

  const handleDeleteGuard = (guardId: string, guardName: string) => {
    const msg = `Are you sure you want to permanently delete "${guardName}"? This cannot be undone.`;

    if (Platform.OS === 'web') {
      if (window.confirm(msg)) {
        executeDelete(guardId, guardName);
      }
    } else {
      const { Alert } = require('react-native');
      Alert.alert('Delete Guard', msg, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => executeDelete(guardId, guardName) },
      ]);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Manage Guards</Text>
      <Text style={styles.subtitle}>Create and manage security guard accounts</Text>

      <View style={styles.card}>
        <Text style={styles.sectionLabel}>CREATE NEW GUARD</Text>

        <View style={styles.formGroup}>
          <TextInput
            style={styles.input}
            placeholder="Username (e.g., ravi)"
            placeholderTextColor={C.textMuted}
            value={username}
            onChangeText={(t) => { setUsername(t); setErrorMsg(null); setSuccessMsg(null); }}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TextInput
            style={styles.input}
            placeholder="Password (min. 6 characters)"
            placeholderTextColor={C.textMuted}
            value={password}
            onChangeText={(t) => { setPassword(t); setErrorMsg(null); setSuccessMsg(null); }}
            secureTextEntry
          />

          {errorMsg && <Text style={styles.errorText}>⚠️ {errorMsg}</Text>}
          {successMsg && <Text style={styles.successText}>✓ {successMsg}</Text>}

          <TouchableOpacity onPress={handleCreateGuard} disabled={loading} activeOpacity={0.8} style={styles.btn}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Create Guard</Text>}
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.card, { marginTop: 24 }]}>
        <Text style={styles.sectionLabel}>EXISTING GUARDS ({guards.length})</Text>

        {loadingGuards ? (
          <ActivityIndicator color={C.primary} style={{ marginVertical: 20 }} />
        ) : guards.length === 0 ? (
          <Text style={styles.emptyText}>No guards found. Create one above!</Text>
        ) : (
          <View style={styles.guardsList}>
            {guards.map((g, idx) => (
              <View key={g.id || idx} style={styles.guardItem}>
                <View style={styles.guardAvatar}>
                  <Text style={styles.guardAvatarText}>
                    {(g.full_name || g.username || 'G').charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.guardInfo}>
                  <Text style={styles.guardName}>{g.full_name || g.username}</Text>
                  <Text style={styles.guardId}>@{g.username}</Text>
                </View>
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleDeleteGuard(g.id, g.username)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={styles.deleteBtnText}>🗑️</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.background,
  },
  content: {
    padding: 24,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: C.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: C.textSecondary,
    marginBottom: 24,
  },
  card: {
    backgroundColor: C.surface,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: C.border,
    elevation: 2,
    shadowColor: C.textPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
  },
  sectionLabel: {
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
  btn: {
    backgroundColor: C.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  btnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  errorText: {
    color: C.error,
    fontSize: 14,
  },
  successText: {
    color: C.success,
    fontSize: 14,
    fontWeight: '600',
  },
  emptyText: {
    color: C.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: 20,
  },
  guardsList: {
    gap: 12,
  },
  guardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: C.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
  },
  guardAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  guardAvatarText: {
    color: C.primaryDark,
    fontWeight: '700',
    fontSize: 16,
  },
  guardInfo: {
    flex: 1,
  },
  guardName: {
    fontSize: 16,
    fontWeight: '600',
    color: C.textPrimary,
  },
  guardId: {
    fontSize: 13,
    color: C.textSecondary,
    marginTop: 2,
  },
  deleteBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#fff1f0',
    borderWidth: 1,
    borderColor: '#ffccc7',
  },
  deleteBtnText: {
    fontSize: 16,
  },
});
