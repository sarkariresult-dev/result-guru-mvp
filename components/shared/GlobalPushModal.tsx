'use client';

import { useState, useEffect } from 'react';
import { env } from '@/config/env';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Bell, Loader2 } from 'lucide-react';

const DISMISS_KEY = 'rg_push_dismissed_at';
const DISMISS_DAYS = 7;
const SCROLL_THRESHOLD = 35; // Show when 35% of the page is scrolled
const FALLBACK_DELAY_MS = 15000; // 15 seconds fallback if page isn't scrollable

export function GlobalPushModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    // 1. Check support
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      return;
    }
    setIsSupported(true);

    let triggered = false;

    const checkAndShow = async () => {
      if (triggered) return;
      triggered = true;

      try {
        // 2. Check if already dismissed recently
        const dismissedAt = localStorage.getItem(DISMISS_KEY);
        if (dismissedAt) {
          const daysSince = (Date.now() - parseInt(dismissedAt, 10)) / (1000 * 60 * 60 * 24);
          if (daysSince < DISMISS_DAYS) {
            return; // Don't show
          }
        }

        // 3. Register service worker and check existing subscription
        const reg = await navigator.serviceWorker.register('/sw.js');
        setRegistration(reg);

        const sub = await reg.pushManager.getSubscription();
        if (sub) {
          return; // Already subscribed, do not show modal
        }

        // 4. Show modal
        setIsOpen(true);
      } catch (err) {
        void 0;
      }
    };

    const handleScroll = () => {
      if (triggered) {
        window.removeEventListener('scroll', handleScroll);
        return;
      }
      
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      
      // If the page is too short to scroll, rely on the fallback timer
      if (scrollHeight <= 0) return;

      const scrolled = window.scrollY;
      const percentage = (scrolled / scrollHeight) * 100;
      
      if (percentage >= SCROLL_THRESHOLD) {
        window.removeEventListener('scroll', handleScroll);
        checkAndShow();
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Fallback timer just in case they land on a short page and don't scroll
    const timer = setTimeout(() => {
      window.removeEventListener('scroll', handleScroll);
      checkAndShow();
    }, FALLBACK_DELAY_MS);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timer);
    };
  }, []);

  const handleDismiss = () => {
    setIsOpen(false);
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
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
    setError(null);

    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        throw new Error('Permission not granted for Notification');
      }

      const applicationServerKey = urlB64ToUint8Array(env.NEXT_PUBLIC_VAPID_PUBLIC_KEY as string);
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });

      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription.toJSON()),
      });

      if (!res.ok) throw new Error('Failed to save subscription on server');

      // Success
      setIsOpen(false);
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

  if (!isSupported) return null;

  return (
    <Modal open={isOpen} onClose={handleDismiss}>
      <div className="flex flex-col items-center text-center space-y-4 pt-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-brand-600">
          <Bell className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold">Never Miss an Update!</h2>
        <p className="text-foreground-muted max-w-sm">
          Get instant alerts on your device for new sarkari results, admit cards, and job notifications as soon as they are announced.
        </p>

        {error && <p className="text-sm font-medium text-error w-full bg-error/10 p-2 rounded-md">{error}</p>}

        <div className="flex w-full flex-col gap-3 pt-4">
          <Button onClick={handleSubscribe} disabled={isLoading} className="w-full" size="lg">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Enable Push Notifications
          </Button>
          <Button variant="ghost" onClick={handleDismiss} disabled={isLoading} className="w-full text-foreground-subtle hover:text-foreground">
            Maybe Later
          </Button>
        </div>
      </div>
    </Modal>
  );
}
