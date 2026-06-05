// public/sw.js — Result Guru Service Worker
// Handles Web Push notifications and click tracking.
// Version is used to force SW update when this file changes.
const SW_VERSION = '1.1.0';

// ── Lifecycle Events ────────────────────────────────────────

self.addEventListener('install', function (event) {
    // Skip waiting so the new SW activates immediately on update
    self.skipWaiting();
});

self.addEventListener('activate', function (event) {
    // Claim all open clients so they're controlled immediately
    event.waitUntil(self.clients.claim());
});

// ── Push Event ──────────────────────────────────────────────

self.addEventListener('push', function (event) {
    if (!event.data) return;

    try {
        const data = event.data.json();

        const title = data.title || 'Result Guru';
        const options = {
            body: data.body,
            icon: data.icon || '/icon-192x192.png',
            badge: data.badge || '/badge.png',
            tag: data.tag || 'rg-notification',
            renotify: true,
            data: {
                url: data.url || '/',
                broadcastId: data.broadcastId
            },
            // Android haptic vibration pattern (ms): vibrate-pause-vibrate
            vibrate: [100, 50, 100],
        };

        if (data.image) {
            options.image = data.image;
        }

        // Rich notification actions (supported on Chrome Android, Chrome Desktop)
        if (data.url) {
            options.actions = [
                { action: 'open', title: '📖 View Details' },
                { action: 'dismiss', title: 'Dismiss' },
            ];
        }

        event.waitUntil(self.registration.showNotification(title, options));
    } catch (err) {
        console.error('[SW] Error parsing push payload:', err);
    }
});

// ── Notification Click Event ────────────────────────────────

self.addEventListener('notificationclick', function (event) {
    event.notification.close();

    // Handle the "dismiss" action button — just close, no navigation
    if (event.action === 'dismiss') {
        return;
    }

    const urlToOpen = new URL(event.notification.data.url, self.location.origin).href;
    const broadcastId = event.notification.data.broadcastId;

    const promiseChain = [];

    // Track the click if broadcastId exists
    if (broadcastId) {
        promiseChain.push(
            fetch('/api/analytics/push-click', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ broadcastId })
            }).catch(function (err) {
                console.error('[SW] Error tracking click:', err);
            })
        );
    }

    // Open the window — focus existing tab or open new
    promiseChain.push(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (windowClients) {
            var matchingClient = null;
            for (var i = 0; i < windowClients.length; i++) {
                var windowClient = windowClients[i];
                if (windowClient.url === urlToOpen) {
                    matchingClient = windowClient;
                    break;
                }
            }

            if (matchingClient) {
                return matchingClient.focus();
            } else {
                return clients.openWindow(urlToOpen);
            }
        })
    );

    event.waitUntil(Promise.all(promiseChain));
});

// ── Notification Close Event (analytics) ────────────────────

self.addEventListener('notificationclose', function (event) {
    // Optional: track dismissals in the future
});
