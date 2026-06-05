'use client';

import { useState, useEffect } from 'react';
import { env } from '@/config/env';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Bell, Loader2, Smartphone } from 'lucide-react';

const DISMISS_KEY = 'rg_push_dismissed_at';
const DISMISS_DAYS = 7;
const SCROLL_THRESHOLD = 35; // Show when 35% of the page is scrolled
const FALLBACK_DELAY_MS = 15000; // 15 seconds fallback if page isn't scrollable

/** Detect iOS Safari (includes iPadOS with desktop user agent) */
function isIOSSafari(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  // iOS: iPhone/iPad/iPod, iPadOS 13+ reports as Macintosh but has touch
  const isIOS = /iPhone|iPad|iPod/.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  // Check it's Safari and NOT Chrome/Firefox/etc on iOS
  const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|OPiOS|EdgiOS/.test(ua);
  return isIOS && isSafari;
}

/** Check if the app is running as a standalone PWA (added to Home Screen) */
function isStandalonePWA(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    ('standalone' in window.navigator && (window.navigator as unknown as { standalone: boolean }).standalone === true)
  );
}

export function GlobalPushModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    // 1. Check support
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      // On iOS Safari (not in standalone PWA mode), show the iOS guide instead
      if (isIOSSafari() && !isStandalonePWA()) {
        setShowIOSGuide(true);
        setIsSupported(true); // Let the modal render, but with iOS guidance
      }
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
      } catch (err: unknown) {
        console.error('[GlobalPushModal] Failed to check push status:', err);
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
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
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
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('[GlobalPushModal] Subscribe failed:', message);
      if (message === 'Permission not granted for Notification') {
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
          {showIOSGuide ? <Smartphone className="h-8 w-8" /> : <Bell className="h-8 w-8" />}
        </div>

        {showIOSGuide ? (
          <>
            <h2 className="text-xl font-bold">Get Instant Alerts on iPhone</h2>
            <p className="text-foreground-muted max-w-sm">
              To receive push notifications on iOS Safari, add this site to your Home Screen first:
            </p>
            <ol className="text-left text-sm text-foreground-muted space-y-2 w-full max-w-sm">
              <li className="flex items-start gap-2">
                <span className="step-number shrink-0">1</span>
                <span>Tap the <strong>Share</strong> button (rectangle with arrow) at the bottom of Safari</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="step-number shrink-0">2</span>
                <span>Scroll down and tap <strong>&quot;Add to Home Screen&quot;</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="step-number shrink-0">3</span>
                <span>Open Result Guru from the Home Screen icon and enable notifications</span>
              </li>
            </ol>
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold">Never Miss an Update!</h2>
            <p className="text-foreground-muted max-w-sm">
              Get instant alerts on your device for new sarkari results, admit cards, and job notifications as soon as they are announced.
            </p>
          </>
        )}

        {error && <p className="text-sm font-medium text-error w-full bg-error/10 p-2 rounded-md">{error}</p>}

        <div className="flex w-full flex-col gap-3 pt-4">
          {!showIOSGuide && (
            <Button onClick={handleSubscribe} disabled={isLoading} className="w-full" size="lg">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enable Push Notifications
            </Button>
          )}
          <Button variant="ghost" onClick={handleDismiss} disabled={isLoading} className="w-full text-foreground-subtle hover:text-foreground">
            {showIOSGuide ? 'Got it!' : 'Maybe Later'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
