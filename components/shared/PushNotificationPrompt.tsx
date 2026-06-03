'use client';

import { useState, useEffect } from 'react';
import { env } from '@/config/env';
import { Button } from '@/components/ui/Button'; // Assuming you have this
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card'; // Assuming this exists
import { Bell, BellOff, Loader2 } from 'lucide-react';

export function PushNotificationPrompt() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      registerServiceWorker();
    }
  }, []);

  const registerServiceWorker = async () => {
    try {
      const reg = await navigator.serviceWorker.register('/sw.js');
      setRegistration(reg);

      const sub = await reg.pushManager.getSubscription();
      setIsSubscribed(!!sub);
    } catch (err) {
      void 0;
    }
  };

  const urlB64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const handleSubscribe = async () => {
    if (!registration) return;
    setIsLoading(true);

    try {
      // Prompt for permission if not already granted
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        throw new Error('Permission not granted for Notification');
      }

      // Subscribe to PushManager
      const applicationServerKey = urlB64ToUint8Array(env.NEXT_PUBLIC_VAPID_PUBLIC_KEY as string);
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });

      // Send to backend
      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription.toJSON()),
      });

      if (!res.ok) throw new Error('Failed to save subscription on server');

      setIsSubscribed(true);
      setError(null);
    } catch (err: any) {
      void 0;
      if (err.message === 'Permission not granted for Notification') {
        setError('Permission denied. Please enable notifications in your browser settings.');
      } else {
        setError('Failed to enable push notifications. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    if (!registration) return;
    setIsLoading(true);

    try {
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        // Remove from backend
        const res = await fetch('/api/push/unsubscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });

        if (!res.ok) throw new Error('Failed to remove subscription on server');

        // Unsubscribe from PushManager
        await subscription.unsubscribe();
      }
      setIsSubscribed(false);
    } catch (err) {
      void 0;
    } finally {
      setIsLoading(false);
    }
  };

  if (!isSupported) return null;

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          {isSubscribed ? <Bell className="text-brand-500 h-5 w-5" /> : <BellOff className="text-foreground-muted h-5 w-5" />}
          Notifications
        </CardTitle>
        <CardDescription>
          {isSubscribed
            ? 'You are receiving instant updates for sarkari results and jobs.'
            : 'Get instant alerts for new sarkari results, admit cards, and job notifications.'}
        </CardDescription>
      </CardHeader>
      <CardFooter className="flex-col gap-3">
        {error && <p className="text-sm font-medium text-error w-full text-center bg-error/10 p-2 rounded-md">{error}</p>}
        {isSubscribed ? (
          <Button variant="secondary" className="w-full" onClick={handleUnsubscribe} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Unsubscribe
          </Button>
        ) : (
          <Button className="w-full" onClick={handleSubscribe} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Enable Push Notifications
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
