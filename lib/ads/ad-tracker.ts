/**
 * AdEventTracker
 * 
 * A client-side utility to batch ad impression and click events.
 * This drastically reduces the number of serverless function invocations on Vercel,
 * saving costs while maintaining accurate data.
 */

export type AdEventType = 'impression' | 'click'

interface AdEvent {
    adId: string
    zoneId?: string
    postId?: string
    eventType: AdEventType
    device: string
    occurredAt: string
}

class AdEventTracker {
    private buffer: AdEvent[] = []
    private flushInterval: number = 10000 // 10 seconds
    private maxBufferSize: number = 20
    private timer: NodeJS.Timeout | null = null

    constructor() {
        if (typeof window !== 'undefined') {
            // Flush on page visibility change or unload
            window.addEventListener('visibilitychange', () => {
                if (document.visibilityState === 'hidden') {
                    this.flush()
                }
            })
            window.addEventListener('beforeunload', () => this.flush())
        }
    }

    private getDeviceType(): string {
        if (typeof window === 'undefined') return 'desktop'
        const width = window.innerWidth
        if (width < 768) return 'mobile'
        if (width < 1024) return 'tablet'
        return 'desktop'
    }

    public recordEvent(adId: string, eventType: AdEventType, zoneId?: string, postId?: string) {
        const event: AdEvent = {
            adId,
            zoneId,
            postId,
            eventType,
            device: this.getDeviceType(),
            occurredAt: new Date().toISOString()
        }

        this.buffer.push(event)

        if (this.buffer.length >= this.maxBufferSize) {
            this.flush()
        } else if (!this.timer) {
            this.timer = setTimeout(() => this.flush(), this.flushInterval)
        }
    }

    public async flush() {
        if (this.buffer.length === 0) return

        if (this.timer) {
            clearTimeout(this.timer)
            this.timer = null
        }

        const eventsToFlush = [...this.buffer]
        this.buffer = []

        try {
            // Use sendBeacon for more reliable delivery on unload
            if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
                const blob = new Blob([JSON.stringify({ events: eventsToFlush })], { type: 'application/json' })
                navigator.sendBeacon('/api/ads/event', blob)
            } else {
                await fetch('/api/ads/event', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ events: eventsToFlush }),
                    keepalive: true
                })
            }
        } catch (error) {
            void 0;
            // Restore events to buffer to try again later
            this.buffer = [...eventsToFlush, ...this.buffer]
        }
    }
}

// Export a singleton instance
export const adTracker = typeof window !== 'undefined' ? new AdEventTracker() : null
