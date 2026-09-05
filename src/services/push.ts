import { supabase } from './supabase';

const VAPID_PUBLIC_KEY = 'BN5tMVzjfwXTNCaFhWW4KQEycn1oHBtBvTaysUOCvKZu-cVN_rgy6pM2FmA6NE03_FruE0G3luf4yoSKaQ4pFbc';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export const PushService = {
  async register(userId: string, role: string) {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.log('Push messaging is not supported.');
      return false;
    }

    try {
      // Register service worker if not already registered
      let registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        registration = await navigator.serviceWorker.register('/service-worker.js');
      }

      // Ask for permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.warn('Notification permission denied.');
        return false;
      }

      // Subscribe
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      const subJSON = subscription.toJSON();

      // Save to Supabase
      const { error } = await supabase.from('notification_subscriptions').insert({
        user_id: userId,
        role: role,
        endpoint: subJSON.endpoint,
        p256dh: subJSON.keys?.p256dh,
        auth: subJSON.keys?.auth,
      });

      if (error) {
        console.error('Failed to save push subscription:', error);
        return false;
      }

      return true;
    } catch (e) {
      console.error('Push registration error:', e);
      return false;
    }
  },
};
