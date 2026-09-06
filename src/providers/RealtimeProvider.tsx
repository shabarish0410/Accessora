import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { AppUser } from '../services/auth';

interface RealtimeContextType {
  lastEvent: any | null;
  isConnected: boolean;
}

const RealtimeContext = createContext<RealtimeContextType>({
  lastEvent: null,
  isConnected: false,
});

export function useRealtime() {
  return useContext(RealtimeContext);
}

export function RealtimeProvider({ children, user }: { children: React.ReactNode, user: AppUser }) {
  const [lastEvent, setLastEvent] = useState<any | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!user) return;

    console.log(`[Realtime] Connecting for user: ${user.username} (${user.role})`);

    const channel = supabase.channel('public:visitors')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'visitors' }, (payload) => {
        console.log('[Realtime] Received event:', payload.eventType, 'for record ID:', payload.new?.id || payload.old?.id);
        // Add a timestamp to force state update even if the same payload object reference is used (though Supabase returns a new object)
        setLastEvent({ ...payload, _ts: Date.now() });
      })
      .subscribe((status) => {
        console.log('[Realtime] Subscription status:', status);
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          setIsConnected(false);
        }
      });

    return () => {
      console.log('[Realtime] Disconnecting channel');
      supabase.removeChannel(channel);
      setIsConnected(false);
    };
  }, [user]);

  return (
    <RealtimeContext.Provider value={{ lastEvent, isConnected }}>
      {children}
    </RealtimeContext.Provider>
  );
}
