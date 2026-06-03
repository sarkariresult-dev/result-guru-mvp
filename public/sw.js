// public/sw.js
self.addEventListener('push', function (event) {
    if (!event.data) return;

    try {
        const data = event.data.json();
        
        const title = data.title || 'Result Guru';
        const options = {
            body: data.body,
            icon: data.icon || '/icon-192x192.png',
            badge: data.badge || '/badge.png',
            data: {
                url: data.url || '/',
                broadcastId: data.broadcastId
            }
        };

        if (data.image) {
            options.image = data.image;
        }

        event.waitUntil(self.registration.showNotification(title, options));
    } catch (err) {
        console.error('Error parsing push payload', err);
    }
});

self.addEventListener('notificationclick', function (event) {
    event.notification.close();

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
            }).catch(err => console.error('Error tracking click:', err))
        );
    }

    // Open the window
    promiseChain.push(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (windowClients) {
            let matchingClient = null;
            for (let i = 0; i < windowClients.length; i++) {
                const windowClient = windowClients[i];
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
