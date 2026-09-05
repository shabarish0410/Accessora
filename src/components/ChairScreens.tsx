import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, TextInput } from 'react-native';
import { Visitor, C, effectivePriority } from '../types';
import { SectionHead } from './Atoms';
import { VisitorRow } from './VisitorRow';

export function QueueScreen({
  visitors,
  onDecide,
  onExit,
  onViewDetail,
  onRefresh,
}: {
  visitors: Visitor[];
  onDecide: (id: string | number, d: 'accepted' | 'waiting' | 'rejected' | 'approved', chairmanFeedback?: string, holdDuration?: string) => void;
  onExit: (id: string | number) => void;
  onViewDetail: (id: string | number) => void;
  onRefresh?: () => void;
}) {
  const [holdVisitorId, setHoldVisitorId] = useState<string | number | null>(null);
  const [rejectVisitorId, setRejectVisitorId] = useState<string | number | null>(null);
  const [holdMessage, setHoldMessage] = useState<string>('');
  const [rejectMessage, setRejectMessage] = useState<string>('');
  const [holdDuration, setHoldDuration] = useState<string>('');
  const pending = visitors
    .filter((v) => v.status === 'pending')
    .sort((a, b) => effectivePriority(a) - effectivePriority(b));

  const onHold = visitors.filter((v) => v.status === 'waiting');
  const inside = visitors.filter((v) => v.status === 'accepted');

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20, paddingBottom: 48, gap: 16 }}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Approvals Queue</Text>
          <Text style={styles.headerSub}>Real-time visitor requests</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          {pending.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{pending.length} pending</Text>
            </View>
          )}
          {onRefresh && (
            <TouchableOpacity onPress={onRefresh} style={{ padding: 8, backgroundColor: '#fff', borderRadius: 8 }}>
              <Text style={{ fontSize: 18 }}>🔄</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {pending.length === 0 && onHold.length === 0 && inside.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={{ fontSize: 56, marginBottom: 12 }}>🎉</Text>
          <Text style={{ fontWeight: '800', fontSize: 16, color: C.textPrimary }}>All caught up!</Text>
          <Text style={{ color: C.textSecondary, fontSize: 13, marginTop: 4 }}>No visitors waiting for approval</Text>
        </View>
      ) : (
        <>
          {pending.length > 0 && (
            <View>
              <SectionHead label={`Pending Approval (${pending.length})`} />
              <View style={styles.list}>
                {pending.map((v, i) => (
                  <View key={v.id} style={styles.queueCard}>
                    <View style={styles.rankRow}>
                      <View style={styles.rankBadge}>
                        <Text style={styles.rankText}>#{i + 1}</Text>
                      </View>
                      <TouchableOpacity style={{ flex: 1 }} onPress={() => onViewDetail(v.id)}>
                        <VisitorRow visitor={v} onPress={() => onViewDetail(v.id)} />
                      </TouchableOpacity>
                    </View>

                    {holdVisitorId === v.id ? (
                      <View style={styles.holdMenu}>
                        <TextInput
                          style={styles.holdInput}
                          placeholder="Hold Reason (e.g. Currently unavailable)"
                          placeholderTextColor={C.textMuted}
                          value={holdMessage}
                          onChangeText={setHoldMessage}
                        />
                        <View style={{ flexDirection: 'row', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
                          {['30 secs', '60 secs', '5 mins', '10 mins'].map((t) => (
                            <TouchableOpacity key={t} onPress={() => setHoldDuration(t)} style={[styles.quickTimeBtn, holdDuration === t && { backgroundColor: C.primary, borderColor: C.primary }]}>
                              <Text style={[styles.quickTimeTxt, holdDuration === t && { color: '#fff' }]}>{t}</Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                        <View style={styles.actionRow}>
                          <TouchableOpacity onPress={() => { onDecide(v.id, 'waiting', holdMessage, holdDuration); setHoldVisitorId(null); }} style={[styles.decisionBtn, { backgroundColor: C.warning }]}>
                            <Text style={styles.btnText}>Submit Hold</Text>
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => setHoldVisitorId(null)} style={[styles.decisionBtn, { backgroundColor: C.border }]}>
                            <Text style={[styles.btnText, { color: C.textPrimary }]}>Cancel</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ) : rejectVisitorId === v.id ? (
                      <View style={styles.holdMenu}>
                        <TextInput
                          style={styles.holdInput}
                          placeholder="Rejection Reason (e.g. Meeting not approved)"
                          placeholderTextColor={C.textMuted}
                          value={rejectMessage}
                          onChangeText={setRejectMessage}
                        />
                        <View style={styles.actionRow}>
                          <TouchableOpacity onPress={() => { onDecide(v.id, 'rejected', rejectMessage); setRejectVisitorId(null); }} style={[styles.decisionBtn, { backgroundColor: C.error }]}>
                            <Text style={styles.btnText}>Submit Reject</Text>
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => setRejectVisitorId(null)} style={[styles.decisionBtn, { backgroundColor: C.border }]}>
                            <Text style={[styles.btnText, { color: C.textPrimary }]}>Cancel</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ) : (
                      <View style={styles.actionRow}>
                        <TouchableOpacity onPress={() => onDecide(v.id, 'accepted')} style={[styles.decisionBtn, { backgroundColor: C.success }]}>
                          <Text style={styles.btnText}>✓ Allow</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => { setHoldVisitorId(v.id); setHoldMessage(''); setHoldDuration(''); setRejectVisitorId(null); }} style={[styles.decisionBtn, { backgroundColor: C.warning }]}>
                          <Text style={styles.btnText}>⏸ Hold</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => { setRejectVisitorId(v.id); setRejectMessage(''); setHoldVisitorId(null); }} style={[styles.decisionBtn, { backgroundColor: C.error }]}>
                          <Text style={styles.btnText}>✕ Deny</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            </View>
          )}

          {onHold.length > 0 && (
            <View>
              <SectionHead label={`On Hold (${onHold.length})`} />
              <View style={styles.list}>
                {onHold.map((v) => (
                  <VisitorRow key={v.id} visitor={v} onPress={() => onViewDetail(v.id)} />
                ))}
              </View>
            </View>
          )}

          {inside.length > 0 && (
            <View>
              <SectionHead label={`Currently Inside (${inside.length})`} />
              <View style={styles.list}>
                {inside.map((v) => (
                  <VisitorRow key={v.id} visitor={v} onPress={() => onViewDetail(v.id)} onExit={() => onExit(v.id)} />
                ))}
              </View>
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  headerTitle: {
    fontWeight: '900',
    fontSize: 22,
    color: C.textPrimary,
  },
  headerSub: {
    color: C.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  badge: {
    backgroundColor: `${C.warning}20`,
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  badgeText: {
    color: C.warning,
    fontSize: 12,
    fontWeight: '800',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  list: {
    gap: 12,
  },
  queueCard: {
    backgroundColor: C.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    padding: 12,
    gap: 12,
  },
  rankRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: `${C.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    fontWeight: '800',
    color: C.primary,
    fontSize: 13,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  decisionBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 14,
  },
  holdMenu: {
    marginTop: 8,
    backgroundColor: 'rgba(0,0,0,.03)',
    borderRadius: 12,
    padding: 12,
  },
  holdInput: {
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.surface,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 8,
    color: C.textPrimary,
  },
  quickTimeBtn: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  quickTimeTxt: {
    fontSize: 12,
    fontWeight: '600',
    color: C.textSecondary,
  },
});
