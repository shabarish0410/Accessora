import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, TextInput, ActivityIndicator, Platform } from 'react-native';
import { Visitor, C, fmtTime, fmtDuration, STATUS } from '../types';
import { PurposePill, StatusPill, SectionHead, SettingsCard, SettingsRow, Toggle } from './Atoms';
import { VisitorRow } from './VisitorRow';
import { AuthService, AppUser } from '../services/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

export function GuardHome({
  visitors,
  guardName,
  onAddVisitor,
  onLeaving,
  onLookup,
  onViewDetail,
  onExit,
  onRefresh,
}: {
  visitors: Visitor[];
  guardName?: string;
  onAddVisitor: () => void;
  onLeaving: () => void;
  onLookup: () => void;
  onViewDetail: (id: string | number) => void;
  onExit: (id: string | number) => void;
  onRefresh?: () => void;
}) {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  const hour = time.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const inside = visitors.filter((v) => v.status === 'accepted' || v.status === 'approved' || v.status === 'inside');
  const pending = visitors.filter((v) => v.status === 'pending');
  const waiting = visitors.filter((v) => v.status === 'waiting');

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>{greeting} 👋</Text>
            <Text style={styles.guardName}>Guard {guardName || 'Officer'}</Text>
            <Text style={styles.shiftBadge}>🔑 Gate A · Morning Shift</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            {onRefresh && (
              <TouchableOpacity onPress={onRefresh} style={styles.shieldIcon}>
                <Text style={{ fontSize: 20 }}>🔄</Text>
              </TouchableOpacity>
            )}
            <View style={styles.shieldIcon}>
              <Text style={{ fontSize: 28 }}>🛡️</Text>
            </View>
          </View>
        </View>

        <View style={styles.statsGrid}>
          {[
            { n: inside.length, label: 'Inside', color: C.success },
            { n: pending.length, label: 'Pending', color: C.warning },
            { n: visitors.filter((v) => v.status === 'completed').length, label: 'Exited', color: C.textMuted },
          ].map((s) => (
            <View key={s.label} style={styles.statBox}>
              <Text style={[styles.statNum, { color: s.color }]}>{s.n}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.body}>
        {/* Primary CTA */}
        <TouchableOpacity onPress={onAddVisitor} activeOpacity={0.8} style={styles.primaryCta}>
          <Text style={{ fontSize: 26 }}>➕</Text>
          <Text style={styles.primaryCtaText}>Add New Visitor</Text>
        </TouchableOpacity>

        <View style={styles.actionsGrid}>
          <TouchableOpacity onPress={onLeaving} style={styles.actionBtn}>
            <Text style={{ fontSize: 28 }}>🚪</Text>
            <Text style={styles.actionBtnText}>Visitor Leaving</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onLookup} style={styles.actionBtn}>
            <Text style={{ fontSize: 28 }}>🔍</Text>
            <Text style={styles.actionBtnText}>Check Pass ID</Text>
          </TouchableOpacity>
        </View>

        {inside.length > 0 && (
          <View style={{ marginTop: 8 }}>
            <SectionHead label={`Inside Now (${inside.length})`} />
            <View style={styles.visitorList}>
              {inside.map((v) => (
                <VisitorRow key={v.id} visitor={v} onPress={() => onViewDetail(v.id)} onExit={() => onExit(v.id)} />
              ))}
            </View>
          </View>
        )}

        {pending.length > 0 && (
          <View style={{ marginTop: 8 }}>
            <SectionHead label={`Awaiting Decision (${pending.length})`} />
            <View style={styles.visitorList}>
              {pending.map((v) => (
                <VisitorRow key={v.id} visitor={v} onPress={() => onViewDetail(v.id)} />
              ))}
            </View>
          </View>
        )}

        {waiting.length > 0 && (
          <View style={{ marginTop: 8 }}>
            <SectionHead label={`On Hold by Chairman (${waiting.length})`} />
            <View style={styles.visitorList}>
              {waiting.map((v) => (
                <VisitorRow key={v.id} visitor={v} onPress={() => onViewDetail(v.id)} />
              ))}
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

export function HistoryScreen({ visitors, onViewDetail, onRefresh }: { visitors: Visitor[]; onViewDetail: (id: string | number) => void; onRefresh?: () => void }) {
  const [filter, setFilter] = useState<'today' | 'all'>('today');
  const [hiddenIds, setHiddenIds] = useState<string[]>([]);

  useEffect(() => {
    AsyncStorage.getItem('hidden_visitors').then(val => {
      if (val) setHiddenIds(JSON.parse(val));
    });
  }, []);

  const hideVisitor = (id: string | number) => {
    const newHidden = [...hiddenIds, String(id)];
    setHiddenIds(newHidden);
    AsyncStorage.setItem('hidden_visitors', JSON.stringify(newHidden));
    Toast.show({ type: 'success', text1: 'Visitor hidden from screen' });
  };

  const exportCSV = () => {
    try {
      const header = 'Name,Purpose,Status,Arrival Time,Exit Time\n';
      const rows = list.map(v => `${v.name},${v.purpose},${v.status},${v.arrivalTime.toISOString()},${v.departureTime ? v.departureTime.toISOString() : ''}`).join('\n');
      const csvContent = header + rows;
      
      if (Platform.OS === 'web') {
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `visitors_export_${new Date().getTime()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        Toast.show({ type: 'success', text1: 'CSV Exported successfully!' });
      } else {
        Toast.show({ type: 'info', text1: 'Export not supported on this platform' });
      }
    } catch(e) {
      Toast.show({ type: 'error', text1: 'Failed to export CSV' });
    }
  };

  const today = new Date().toDateString();
  const list = (filter === 'today'
      ? visitors.filter((v) => v.arrivalTime.toDateString() === today)
      : [...visitors].sort((a, b) => b.arrivalTime.getTime() - a.arrivalTime.getTime()))
      .filter((v) => !hiddenIds.includes(String(v.id)));

  return (
    <View style={styles.container}>
      <View style={styles.historyHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 16 }}>
          <Text style={styles.historyTitle}>Visitor History</Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity onPress={exportCSV} style={{ padding: 8, backgroundColor: C.primary, borderRadius: 8 }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#fff' }}>⬇ Export CSV</Text>
            </TouchableOpacity>
            {onRefresh && (
              <TouchableOpacity onPress={onRefresh} style={{ padding: 8, backgroundColor: '#fff', borderRadius: 8 }}>
                <Text style={{ fontSize: 18 }}>🔄</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        <View style={{ paddingHorizontal: 20, paddingBottom: 12, flexDirection: 'row', gap: 8 }}>
          {(['today', 'all'] as const).map((f) => (
            <TouchableOpacity
              key={f}
              onPress={() => setFilter(f)}
              style={[
                styles.filterBtn,
                { backgroundColor: filter === f ? C.primaryDark : C.surface, borderColor: filter === f ? C.primaryDark : C.border },
              ]}
            >
              <Text style={[styles.filterBtnText, { color: filter === f ? '#fff' : C.textSecondary }]}>
                {f === 'today' ? 'Today' : 'All Time'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 48, gap: 10 }}>
        {list.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>📋</Text>
            <Text style={{ fontWeight: '700', color: C.textSecondary }}>No records found</Text>
          </View>
        ) : (
          list.map((v) => (
            <TouchableOpacity
              key={v.id}
              onPress={() => onViewDetail(v.id)}
              style={styles.historyCard}
            >
              <View style={styles.historyAvatarContainer}>
                <Text style={{ fontSize: 24 }}>👤</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '700', fontSize: 15, color: C.textPrimary }}>{v.name}</Text>
                <View style={{ flexDirection: 'row', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                  <PurposePill purpose={v.purpose} />
                  <StatusPill status={v.status} />
                </View>
                <Text style={{ fontSize: 12, color: C.textSecondary, marginTop: 4 }}>
                  {fmtTime(v.arrivalTime)}
                  {v.departureTime ? ` → ${fmtTime(v.departureTime)} · ${fmtDuration(v.arrivalTime, v.departureTime)}` : ''}
                </Text>
              </View>
              <TouchableOpacity onPress={() => hideVisitor(v.id)} style={{ padding: 8, backgroundColor: '#fff1f0', borderRadius: 8, marginLeft: 10 }}>
                <Text style={{ fontSize: 16 }}>🗑️</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

export function GuardSettings({ onSignOut, user }: { onSignOut: () => void; user?: AppUser }) {
  const [notifSound, setNotifSound] = useState(true);
  const [vibration, setVibration] = useState(true);

  // Change Password State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: 'error' | 'success' } | null>(null);

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword) {
      setMsg({ text: 'Please enter both passwords', type: 'error' });
      return;
    }
    if (newPassword.length < 6) {
      setMsg({ text: 'New password must be at least 6 characters', type: 'error' });
      return;
    }

    setLoading(true);
    setMsg(null);
    try {
      await AuthService.changePassword(oldPassword, newPassword);
      setMsg({ text: 'Password changed successfully!', type: 'success' });
      setOldPassword('');
      setNewPassword('');
    } catch (e: any) {
      setMsg({ text: e.message || 'Failed to change password', type: 'error' });
    }
    setLoading(false);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20, paddingBottom: 48, gap: 16 }}>
      <Text style={styles.historyTitle}>Settings</Text>

      <View style={styles.profileCard}>
        <View style={styles.profileIcon}>
          <Text style={{ fontSize: 30 }}>{user?.role === 'guard' ? '🛡️' : user?.role === 'chairman' ? '👔' : '👤'}</Text>
        </View>
        <View>
          <Text style={{ fontWeight: '800', fontSize: 18, color: '#fff' }}>{user?.fullName || user?.username || 'User'}</Text>
          <Text style={{ color: C.accent, fontSize: 13, marginTop: 3, fontWeight: '600' }}>
            {user?.role === 'guard' ? 'Gate A · ' : ''}
            {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : ''} ID: @{user?.username}
          </Text>
          {user?.role === 'guard' && (
            <Text style={{ color: 'rgba(255,255,255,.6)', fontSize: 12, marginTop: 2 }}>Morning Shift · 06:00 – 14:00</Text>
          )}
        </View>
      </View>

      <SettingsCard title="Notifications">
        <SettingsRow label="🔔 Alert Sound" right={<Toggle on={notifSound} onToggle={() => setNotifSound((n) => !n)} />} />
        <SettingsRow label="📳 Vibration" right={<Toggle on={vibration} onToggle={() => setVibration((n) => !n)} />} last />
      </SettingsCard>

      <SettingsCard title="Account">
        {user?.role === 'guard' && (
          <>
            <SettingsRow label="👔 Linked Chairman" right={<Text style={{ fontSize: 13, color: C.textSecondary }}>Chairman</Text>} />
            <SettingsRow label="🔑 Gate Assignment" right={<Text style={{ fontSize: 13, color: C.textSecondary }}>Gate A</Text>} last />
          </>
        )}
        {user?.role === 'chairman' && (
           <SettingsRow label="🏢 Office" right={<Text style={{ fontSize: 13, color: C.textSecondary }}>Main Block</Text>} last />
        )}
        {user?.role === 'incharge' && (
           <SettingsRow label="🏢 Department" right={<Text style={{ fontSize: 13, color: C.textSecondary }}>Security HQ</Text>} last />
        )}
      </SettingsCard>

      <SettingsCard title="Security">
        <View style={{ padding: 16, gap: 12 }}>
          <Text style={{ fontWeight: '700', color: C.textPrimary, marginBottom: 4 }}>Change Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Current Password"
            placeholderTextColor={C.textMuted}
            secureTextEntry
            value={oldPassword}
            onChangeText={setOldPassword}
          />
          <TextInput
            style={styles.input}
            placeholder="New Password"
            placeholderTextColor={C.textMuted}
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
          />
          {msg && (
            <Text style={{ color: msg.type === 'error' ? C.error : C.success, fontSize: 13 }}>
              {msg.type === 'error' ? '⚠️ ' : '✅ '}{msg.text}
            </Text>
          )}
          <TouchableOpacity onPress={handleChangePassword} disabled={loading} style={styles.changePwdBtn}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: '700' }}>Update Password</Text>}
          </TouchableOpacity>
        </View>
      </SettingsCard>

      <SettingsCard title="App">
        <SettingsRow label="🌐 Language" right={<Text style={{ fontSize: 13, color: C.textSecondary }}>English</Text>} />
        <SettingsRow label="ℹ️ About Accessora" right={<Text style={{ fontSize: 13, color: C.textSecondary }}>v1.0.0</Text>} last />
      </SettingsCard>

      <TouchableOpacity onPress={onSignOut} style={styles.signOutBtn}>
        <Text style={styles.signOutText}>🚪 Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.background,
  },
  header: {
    backgroundColor: C.primaryDark,
    paddingTop: 28,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  greeting: {
    color: 'rgba(255,255,255,.65)',
    fontSize: 13,
  },
  guardName: {
    fontWeight: '900',
    fontSize: 22,
    color: '#fff',
    marginTop: 2,
  },
  shiftBadge: {
    color: C.accent,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 4,
  },
  shieldIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,.08)',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  statNum: {
    fontWeight: '900',
    fontSize: 24,
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,.65)',
    fontWeight: '600',
    marginTop: 2,
  },
  body: {
    padding: 20,
    gap: 16,
  },
  primaryCta: {
    backgroundColor: C.primary,
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    elevation: 4,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  primaryCtaText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '900',
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: C.surface,
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 12,
    alignItems: 'center',
    gap: 8,
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: C.textPrimary,
  },
  visitorList: {
    gap: 10,
    marginTop: 6,
  },
  historyHeader: {
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    backgroundColor: C.background,
  },
  historyTitle: {
    fontWeight: '900',
    fontSize: 20,
    color: C.textPrimary,
    marginBottom: 14,
  },
  filterBtn: {
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderWidth: 1,
  },
  filterBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  historyCard: {
    backgroundColor: C.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: C.border,
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
  },
  historyAvatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileCard: {
    backgroundColor: C.primaryDark,
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  profileIcon: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signOutBtn: {
    backgroundColor: `${C.error}15`,
    borderWidth: 2,
    borderColor: C.error,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  signOutText: {
    fontSize: 15,
    fontWeight: '800',
    color: C.error,
  },
  input: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    backgroundColor: C.background,
    color: C.textPrimary,
  },
  changePwdBtn: {
    backgroundColor: C.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
});
