import React, { useState, useEffect } from 'react';
import { View, StyleSheet, StatusBar, ActivityIndicator, Text, Platform, Modal, TouchableOpacity } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { Visitor, GuardTab, ChairTab, InchargeTab, C } from './types';
import { AuthService, AppUser } from './services/auth';
import { PushService } from './services/push';
import { AuthScreen } from './components/AuthScreen';
import { GuardHome, HistoryScreen, GuardSettings } from './components/GuardScreens';
import { QueueScreen } from './components/ChairScreens';
import { VisitorDetail } from './components/VisitorDetail';
import { AddVisitorFlow } from './components/AddVisitorFlow';
import { LookupScreen } from './components/LookupScreen';
import { LeavingScreen } from './components/LeavingScreen';
import { ManageGuardsScreen } from './components/InchargeScreens';
import { BottomNav } from './components/BottomNav';
import { GlobalBanner } from './components/GlobalBanner';
import { VisitorService, parseVisitor } from './services/visitors';
import { RealtimeProvider, useRealtime } from './providers/RealtimeProvider';
import { useAppUpdate } from './hooks/useAppUpdate';
import { AppUpdateModal } from './components/AppUpdateModal';

const GUARD_TABS: { id: GuardTab; icon: string; label: string }[] = [
  { id: 'home', icon: '🏠', label: 'Home' },
  { id: 'history', icon: '📋', label: 'History' },
  { id: 'settings', icon: '⚙️', label: 'Settings' },
];

const CHAIR_TABS: { id: ChairTab; icon: string; label: string }[] = [
  { id: 'queue', icon: '⏳', label: 'Queue' },
  { id: 'history', icon: '📋', label: 'History' },
  { id: 'settings', icon: '⚙️', label: 'Settings' },
];

const INCHARGE_TABS: { id: InchargeTab; icon: string; label: string }[] = [
  { id: 'manage_guards', icon: '👥', label: 'Guards' },
  { id: 'settings', icon: '⚙️', label: 'Settings' },
];

function useVisitors(activeOnly: boolean, onNotification?: (payload: any) => void) {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const { lastEvent } = useRealtime();

  const refetch = async () => {
    setLoading(true);
    const data = activeOnly ? await VisitorService.getActiveVisitors() : await VisitorService.getHistoryVisitors();
    setVisitors(data);
    setLoading(false);
  };

  useEffect(() => {
    refetch();
  }, [activeOnly]);

  useEffect(() => {
    if (!lastEvent) return;
    
    const { eventType, new: newRow, old: oldRow } = lastEvent;
    
    setVisitors((prev) => {
      if (eventType === 'INSERT') {
        const parsed = parseVisitor(newRow);
        // Only add if it matches the current filter
        if (activeOnly && ['completed', 'rejected', 'exited'].includes(parsed.status)) return prev;
        if (!activeOnly && !['completed', 'rejected', 'exited'].includes(parsed.status)) return prev;
        return [parsed, ...prev];
      } else if (eventType === 'UPDATE') {
        const parsed = parseVisitor(newRow);
        
        // Handle transitions between active/history tabs
        const isHistoryView = !activeOnly;
        const isHistoryStatus = ['completed', 'rejected', 'exited'].includes(parsed.status);
        
        if (activeOnly && isHistoryStatus) {
           // Moved to history, remove from active
           return prev.filter(v => v.id !== parsed.id);
        } else if (isHistoryView && !isHistoryStatus) {
           // Moved to active, remove from history
           return prev.filter(v => v.id !== parsed.id);
        }
        
        // If it still belongs in the current list, update it. Or add it if it just moved into this list.
        const exists = prev.some(v => v.id === parsed.id);
        if (exists) {
          return prev.map(v => v.id === parsed.id ? parsed : v);
        } else {
          // If it didn't exist but now belongs here, add it
          if ((activeOnly && !isHistoryStatus) || (isHistoryView && isHistoryStatus)) {
            return [parsed, ...prev].sort((a, b) => b.arrivalTime.getTime() - a.arrivalTime.getTime());
          }
        }
      } else if (eventType === 'DELETE') {
        return prev.filter(v => v.id !== oldRow.id);
      }
      return prev;
    });

    if (onNotification) onNotification(lastEvent);
  }, [lastEvent, activeOnly]);

  return { visitors, setVisitors, loading, refetch };
}

function GuardApp({ onSignOut, user, onUpdateUser, onCheckUpdate }: { onSignOut: () => void; user: AppUser; onUpdateUser: (user: AppUser) => void; onCheckUpdate?: () => Promise<void> }) {
  const [tab, setTab] = useState<GuardTab>('home');
  const [screen, setScreen] = useState<'main' | 'add' | 'leaving' | 'lookup' | 'detail'>('main');
  const [activeVisitorId, setActiveVisitorId] = useState<string | number | null>(null);
  
  // Guard Home needs active visitors. History needs completed.
  const { visitors, loading, refetch } = useVisitors(tab !== 'history', (payload) => {
    if (payload.eventType === 'UPDATE') {
      const oldStatus = payload.old?.status;
      const newStatus = payload.new?.status;
      if (oldStatus !== newStatus && (newStatus === 'accepted' || newStatus === 'rejected' || newStatus === 'waiting')) {
         const name = payload.new.name;
         let title = '';
         let body = '';
         if (newStatus === 'accepted') { title = '✅ Visitor Approved'; body = `${name} has been allowed to enter.`; }
         if (newStatus === 'rejected') { title = '❌ Visitor Rejected'; body = `${name}'s visit was denied.`; }
         if (newStatus === 'waiting') { title = '⏸ Visitor On Hold'; body = `${name} is waiting for approval.`; }
         Toast.show({ type: 'info', text1: title, text2: body, position: 'top' });
      }
    }
  });

  const addVisitor = () => {
    // AddVisitorFlow handles database creation and photo upload atomically!
    setScreen('main');
  };

  const markExit = async (id: string | number) => {
    await VisitorService.updateStatus(id, 'completed');
  };

  const viewDetail = (id: string | number) => {
    setActiveVisitorId(id);
    setScreen('detail');
  };

  const activeVisitor = visitors.find((v) => v.id === activeVisitorId);

  if (screen === 'add') {
    return <AddVisitorFlow onBack={() => setScreen('main')} onSubmit={() => addVisitor()} />;
  }

  if (screen === 'leaving') {
    return (
      <LeavingScreen
        visitors={visitors}
        onExit={markExit}
        onBack={() => setScreen('main')}
        onViewDetail={viewDetail}
      />
    );
  }

  if (screen === 'lookup') {
    return <LookupScreen visitors={visitors} onExit={markExit} onBack={() => setScreen('main')} />;
  }

  if (screen === 'detail' && activeVisitor) {
    return (
      <VisitorDetail
        visitor={activeVisitor}
        onBack={() => setScreen('main')}
        onExit={activeVisitor.status === 'accepted' || activeVisitor.status === 'approved' ? () => { markExit(activeVisitor.id); setScreen('main'); } : undefined}
      />
    );
  }

  const handleRefresh = () => {
    refetch();
    Toast.show({ type: 'success', text1: 'Refreshed!', text2: 'Latest data fetched successfully.' });
  };

  return (
    <View style={styles.appContainer}>
      <View style={styles.mainContent}>
        {tab === 'home' && <GuardHome visitors={visitors} guardName={user.fullName || user.username} onAddVisitor={() => setScreen('add')} onLeaving={() => setScreen('leaving')} onLookup={() => setScreen('lookup')} onViewDetail={viewDetail} onExit={markExit} onRefresh={handleRefresh} />}
        {tab === 'history' && <HistoryScreen visitors={visitors} onViewDetail={viewDetail} onRefresh={handleRefresh} />}
        {tab === 'settings' && <GuardSettings onSignOut={onSignOut} user={user} onUpdateUser={onUpdateUser} onCheckUpdate={onCheckUpdate} />}
      </View>
      <BottomNav
        tabs={GUARD_TABS}
        active={tab}
        onChange={(t) => {
          setTab(t as GuardTab);
          setScreen('main');
        }}
      />
    </View>
  );
}

function ChairApp({ onSignOut, user, onUpdateUser, onCheckUpdate }: { onSignOut: () => void, user: AppUser, onUpdateUser: (user: AppUser) => void, onCheckUpdate?: () => Promise<void> }) {
  const [tab, setTab] = useState<ChairTab>('queue');
  const [activeVisitorId, setActiveVisitorId] = useState<string | number | null>(null);
  const [incomingVisitor, setIncomingVisitor] = useState<any | null>(null);
  
  const { visitors, loading, refetch } = useVisitors(tab !== 'history', (payload) => {
    if (payload.eventType === 'INSERT') {
       setIncomingVisitor(payload.new);
    }
  });

  const decide = async (
    id: string | number, 
    d: 'accepted' | 'waiting' | 'rejected' | 'approved', 
    chairmanFeedback?: string, 
    holdDuration?: string
  ) => {
    let decBy = `Chairman ${user.fullName || user.username}`;
    const chairmanDecision = d === 'approved' ? 'accepted' : d;
    await VisitorService.updateStatus(id, d, decBy, chairmanDecision, chairmanFeedback, holdDuration);
  };

  const markExit = async (id: string | number) => {
    await VisitorService.updateStatus(id, 'completed');
  };

  const viewDetail = (id: string | number) => {
    setActiveVisitorId(id);
  };

  const activeVisitor = visitors.find((v) => v.id === activeVisitorId);

  if (activeVisitor) {
    return (
      <VisitorDetail
        visitor={activeVisitor}
        onBack={() => setActiveVisitorId(null)}
        onExit={activeVisitor.status === 'accepted' || activeVisitor.status === 'approved' ? () => { markExit(activeVisitor.id); setActiveVisitorId(null); } : undefined}
        onDecide={(d) => { decide(activeVisitor.id, d); setActiveVisitorId(null); }}
      />
    );
  }

  const handleRefresh = () => {
    refetch();
    Toast.show({ type: 'success', text1: 'Refreshed!', text2: 'Latest data fetched successfully.' });
  };

  return (
    <View style={styles.appContainer}>
      <Modal visible={!!incomingVisitor} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={{ fontSize: 40, textAlign: 'center', marginBottom: 10 }}>🚨</Text>
            <Text style={{ fontSize: 22, fontWeight: '900', color: C.textPrimary, textAlign: 'center' }}>NEW VISITOR</Text>
            {incomingVisitor && (
              <View style={{ marginTop: 20, gap: 10 }}>
                <Text style={{ fontSize: 16, color: C.textSecondary }}><Text style={{ fontWeight: '700', color: C.textPrimary }}>Name:</Text> {incomingVisitor.name}</Text>
                <Text style={{ fontSize: 16, color: C.textSecondary }}><Text style={{ fontWeight: '700', color: C.textPrimary }}>Purpose:</Text> {incomingVisitor.purpose}</Text>
                <Text style={{ fontSize: 16, color: C.textSecondary }}><Text style={{ fontWeight: '700', color: C.textPrimary }}>Origin:</Text> {incomingVisitor.organisation || incomingVisitor.origin}</Text>
              </View>
            )}
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 30 }}>
              <TouchableOpacity onPress={() => setIncomingVisitor(null)} style={[styles.modalBtn, { backgroundColor: C.border }]}>
                <Text style={{ fontWeight: '700', color: C.textPrimary }}>DISMISS</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setTab('queue'); setActiveVisitorId(incomingVisitor?.id); setIncomingVisitor(null); }} style={[styles.modalBtn, { backgroundColor: C.primary }]}>
                <Text style={{ fontWeight: '700', color: '#fff' }}>VIEW VISITOR</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.mainContent}>
        {tab === 'queue' && (
          <QueueScreen visitors={visitors} onDecide={decide as any} onExit={markExit} onViewDetail={viewDetail} onRefresh={handleRefresh} />
        )}
        {tab === 'history' && <HistoryScreen visitors={visitors} onViewDetail={viewDetail} onRefresh={handleRefresh} />}
        {tab === 'settings' && <GuardSettings onSignOut={onSignOut} user={user} onUpdateUser={onUpdateUser} onCheckUpdate={onCheckUpdate} />}
      </View>
      <BottomNav
        tabs={CHAIR_TABS}
        active={tab}
        onChange={(t) => {
          setTab(t as ChairTab);
          setActiveVisitorId(null);
        }}
      />
    </View>
  );
}

function InchargeApp({ onSignOut, user, onUpdateUser, onCheckUpdate }: { onSignOut: () => void, user: AppUser, onUpdateUser: (user: AppUser) => void, onCheckUpdate?: () => Promise<void> }) {
  const [tab, setTab] = useState<InchargeTab>('manage_guards');

  return (
    <View style={styles.appContainer}>
      <View style={styles.mainContent}>
        {tab === 'manage_guards' && <ManageGuardsScreen />}
        {tab === 'settings' && <GuardSettings onSignOut={onSignOut} user={user} onUpdateUser={onUpdateUser} onCheckUpdate={onCheckUpdate} />}
      </View>
      <BottomNav
        tabs={INCHARGE_TABS}
        active={tab}
        onChange={(t) => setTab(t as InchargeTab)}
      />
    </View>
  );
}

export default function App() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [initializing, setInitializing] = useState(true);
  const update = useAppUpdate();

  useEffect(() => {
    // Restore persisted session on app start
    AuthService.restoreSession().then((restored) => {
      setUser(restored);
      setInitializing(false);
      if (restored && Platform.OS === 'web') {
        PushService.register(restored.userId, restored.role);
      }
    });
  }, []);

  const handleSignIn = (loggedInUser: AppUser) => {
    setUser(loggedInUser);
    if (Platform.OS === 'web') {
      PushService.register(loggedInUser.userId, loggedInUser.role);
    }
  };

  const handleSignOut = async () => {
    await AuthService.logout();
    setUser(null);
  };

  if (initializing) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color={C.primary} />
          <Text style={{ marginTop: 12, color: C.textSecondary }}>Loading application...</Text>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor={C.background} />
        <GlobalBanner />
      {!user ? (
        <AuthScreen onSignIn={handleSignIn} />
      ) : (
        <RealtimeProvider user={user}>
          <View style={styles.screenWrapper}>
            {user.role === 'chairman' ? (
              <ChairApp onSignOut={handleSignOut} user={user} onUpdateUser={setUser} onCheckUpdate={update.checkForAppUpdate} />
            ) : user.role === 'incharge' ? (
              <InchargeApp onSignOut={handleSignOut} user={user} onUpdateUser={setUser} onCheckUpdate={update.checkForAppUpdate} />
            ) : (
              <GuardApp onSignOut={handleSignOut} user={user} onUpdateUser={setUser} onCheckUpdate={update.checkForAppUpdate} />
            )}
          </View>
        </RealtimeProvider>
      )}
      <AppUpdateModal
        status={update.status}
        downloadProgress={update.downloadProgress}
        errorMessage={update.errorMessage}
        onLater={update.dismissError}
        onUpdateNow={update.downloadUpdate}
        onRestart={update.applyUpdate}
        onDismissError={update.dismissError}
      />
      <Toast />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: C.background,
  },
  screenWrapper: {
    flex: 1,
  },
  appContainer: {
    flex: 1,
    backgroundColor: C.background,
  },
  mainContent: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  modalBtn: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
});
