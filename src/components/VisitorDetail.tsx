import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SignedImage } from './SignedImage';
import { Visitor, C, fmtTime, fmtDuration } from '../types';
import { BackBar, PurposePill, StatusPill } from './Atoms';

export function VisitorDetail({
  visitor,
  onBack,
  onExit,
  onDecide,
}: {
  visitor: Visitor;
  onBack: () => void;
  onExit?: () => void;
  onDecide?: (d: 'accepted' | 'waiting' | 'rejected') => void;
}) {
  const infoRows = [
    { icon: '📱', label: 'Mobile', val: visitor.mobile },
    { icon: '🏢', label: 'From', val: visitor.origin },
    { icon: '🕐', label: 'Arrived', val: fmtTime(visitor.arrivalTime) },
    ...(visitor.departureTime
      ? [{ icon: '🚪', label: 'Departed', val: `${fmtTime(visitor.departureTime)} (${fmtDuration(visitor.arrivalTime, visitor.departureTime)})` }]
      : []),
    ...(visitor.decidedBy ? [{ icon: '✍️', label: 'Decided by', val: visitor.decidedBy }] : []),
  ];

  // Translations
  const originDisplay = visitor.originEnglish || visitor.origin;
  const originOriginal = visitor.originOriginal;
  const purposeDisplay = visitor.purposeEnglish || visitor.purpose;
  const purposeOriginal = visitor.purposeOriginal;
  
  // Chairman Feedback Banner
  const showChairmanFeedback = !!visitor.chairmanDecision;

  return (
    <View style={styles.container}>
      <BackBar title="Visitor Details" onBack={onBack} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Photo + Identity */}
        <View style={styles.card}>
          <SignedImage path={visitor.photoUrl} style={styles.photo} />
          <View style={styles.cardBody}>
            <View style={styles.headerRow}>
              <View style={styles.headerInfo}>
                <Text style={styles.name}>{visitor.name}</Text>
                <Text style={styles.origin}>{originDisplay}</Text>
                {originOriginal && originOriginal !== originDisplay && (
                  <Text style={styles.originalText}>Original: {originOriginal}</Text>
                )}
              </View>
              <Text style={styles.tempId}>#{visitor.tempId}</Text>
            </View>
            <View style={styles.pillRow}>
              <PurposePill purpose={visitor.purpose} />
              <StatusPill status={visitor.status} />
            </View>
            {purposeDisplay && purposeDisplay !== visitor.purpose && (
               <View style={{ marginTop: 12 }}>
                 <Text style={{ fontSize: 14, fontWeight: '700', color: C.textPrimary }}>Purpose Description:</Text>
                 <Text style={{ fontSize: 14, color: C.textSecondary, marginTop: 4 }}>{purposeDisplay}</Text>
                 {purposeOriginal && purposeOriginal !== purposeDisplay && (
                    <Text style={[styles.originalText, { marginTop: 2 }]}>Original: {purposeOriginal}</Text>
                 )}
               </View>
            )}
            {!purposeDisplay && visitor.reason && (
               <View style={{ marginTop: 12 }}>
                 <Text style={{ fontSize: 14, fontWeight: '700', color: C.textPrimary }}>Purpose Description:</Text>
                 <Text style={{ fontSize: 14, color: C.textSecondary, marginTop: 4 }}>{visitor.reason}</Text>
               </View>
            )}
          </View>
        </View>

        {/* Chairman Feedback Prominent Section */}
        {showChairmanFeedback && (
          <View style={[styles.feedbackCard, 
            visitor.chairmanDecision === 'accepted' ? { borderColor: C.success, backgroundColor: '#f6ffed' } :
            visitor.chairmanDecision === 'rejected' ? { borderColor: C.error, backgroundColor: '#fff2f0' } :
            { borderColor: C.warning, backgroundColor: '#fffbe6' }
          ]}>
            <Text style={[styles.feedbackTitle, 
              visitor.chairmanDecision === 'accepted' ? { color: C.success } :
              visitor.chairmanDecision === 'rejected' ? { color: C.error } :
              { color: C.warning }
            ]}>
              {visitor.chairmanDecision === 'accepted' && '✅ Chairman Approved'}
              {visitor.chairmanDecision === 'rejected' && '❌ Chairman Rejected'}
              {visitor.chairmanDecision === 'waiting' && '⏳ Chairman placed visitor on Hold'}
            </Text>
            
            {visitor.holdDuration && (
              <Text style={styles.feedbackText}>Duration: {visitor.holdDuration}</Text>
            )}
            {visitor.chairmanFeedback && (
              <Text style={styles.feedbackText}>Reason: {visitor.chairmanFeedback}</Text>
            )}
            {visitor.decisionAt && (
              <Text style={[styles.feedbackText, { color: C.textMuted, fontSize: 12, marginTop: 4 }]}>
                Decision time: {fmtTime(visitor.decisionAt)}
              </Text>
            )}
          </View>
        )}

        {/* Info Rows */}
        <View style={styles.infoCard}>
          {infoRows.map((row, i) => (
            <View key={row.label} style={[styles.infoRow, i < infoRows.length - 1 && styles.infoRowBorder]}>
              <Text style={styles.infoIcon}>{row.icon}</Text>
              <View>
                <Text style={styles.infoLabel}>{row.label}</Text>
                <Text style={styles.infoVal}>{row.val}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Chairman Decision Buttons */}
        {onDecide && visitor.status === 'pending' && (
          <View style={styles.decisionRow}>
            {([
              { d: 'accepted', icon: '✓', label: 'Allow', color: C.success },
              { d: 'waiting', icon: '⏸', label: 'Hold', color: C.warning },
              { d: 'rejected', icon: '✕', label: 'Deny', color: C.error },
            ] as const).map((btn) => (
              <TouchableOpacity
                key={btn.d}
                onPress={() => onDecide(btn.d)}
                style={[styles.decisionBtn, { backgroundColor: `${btn.color}15`, borderColor: btn.color }]}
              >
                <Text style={styles.decisionIcon}>{btn.icon}</Text>
                <Text style={[styles.decisionLabel, { color: btn.color }]}>{btn.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Exit Button */}
        {visitor.status === 'accepted' && onExit && (
          <TouchableOpacity onPress={onExit} style={styles.fullExitBtn}>
            <Text style={styles.fullExitBtnText}>↩ Mark as Exited</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.background,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 48,
  },
  card: {
    backgroundColor: C.surface,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: C.border,
    elevation: 3,
    shadowColor: C.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  photo: {
    width: '100%',
    height: 220,
    resizeMode: 'cover',
  },
  cardBody: {
    padding: 18,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  headerInfo: {
    flex: 1,
  },
  name: {
    fontWeight: '900',
    fontSize: 22,
    color: C.textPrimary,
  },
  origin: {
    color: C.textSecondary,
    fontSize: 13,
    marginTop: 4,
  },
  tempId: {
    fontWeight: '900',
    fontSize: 22,
    color: C.primary,
  },
  originalText: {
    fontSize: 12,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  feedbackCard: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  feedbackTitle: {
    fontWeight: '900',
    fontSize: 18,
    marginBottom: 8,
  },
  feedbackText: {
    fontSize: 15,
    color: C.textPrimary,
    marginBottom: 4,
  },
  pillRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    flexWrap: 'wrap',
  },
  infoCard: {
    backgroundColor: C.surface,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: C.border,
  },
  infoRow: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  infoIcon: {
    fontSize: 20,
  },
  infoLabel: {
    fontSize: 11,
    color: C.textSecondary,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  infoVal: {
    fontSize: 15,
    color: C.textPrimary,
    fontWeight: '600',
    marginTop: 2,
  },
  decisionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  decisionBtn: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: 'center',
    gap: 6,
  },
  decisionIcon: {
    fontSize: 26,
  },
  decisionLabel: {
    fontSize: 14,
    fontWeight: '800',
  },
  fullExitBtn: {
    width: '100%',
    backgroundColor: C.primaryDark,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullExitBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
});
