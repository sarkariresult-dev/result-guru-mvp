import { createBrowserClient } from '@supabase/ssr'
import { env } from '@/config/env'

let client: ReturnType<typeof createBrowserClient> | undefined;

/**
 * Check if localStorage is accessible in the current browser context.
 * In cross-origin iframes (like AdSense preview), storage access can throw.
 */
function isLocalStorageAvailable() {
    try {
        if (typeof window === 'undefined') return false;
        const test = '__storage_test__';
        window.localStorage.setItem(test, test);
        window.localStorage.removeItem(test);
        return true;
    } catch (e) {
        return false;
    }
}

/**
 * Check if navigator.locks (LockManager API) is safely usable.
 * In cross-origin iframes, navigator.locks exists but calling
 * .request() throws SecurityError. We proactively detect this.
 */
function isLockManagerAvailable(): boolean {
    try {
        if (typeof navigator === 'undefined') return false;
        if (!navigator.locks) return false;
        // In cross-origin iframes, the object exists but is non-functional.
        // We can't reliably test without calling .request(), so we check
        // for iframe + storage restriction as a proxy.
        if (typeof window !== 'undefined') {
            try {
                // If we can't even access storage, locks are almost certainly blocked too
                window.localStorage.getItem('__lock_test__');
            } catch {
                return false;
            }
        }
        return true;
    } catch {
        return false;
    }
}

/**
 * Browser-side Supabase client.
 * Uses the public anon key - safe to call from client components.
 * Singleton pattern ensures only one instance is created on the client,
 * preventing LockManager contention.
 *
 * Hardened for cross-origin iframes (AdSense preview, embeds):
 * - Disables session persistence when storage is blocked
 * - Provides a no-op lock when navigator.locks is restricted
 * - Disables auto-refresh and URL session detection in restricted contexts
 */
export function createClient() {
    if (client) return client;

    const useStorage = isLocalStorageAvailable();
    const useLocks = isLockManagerAvailable();

    client = createBrowserClient(
        env.NEXT_PUBLIC_SUPABASE_URL,
        env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
            auth: {
                persistSession: useStorage,
                autoRefreshToken: useStorage,
                detectSessionInUrl: useStorage, // Disabled in restricted iframes
                // When navigator.locks is unavailable (cross-origin iframe),
                // provide a no-op lock to prevent SecurityError crashes.
                ...(!useLocks ? {
                    lock: async (_name: string, _acquireTimeout: number, fn: (lock: unknown) => Promise<unknown>) => {
                        return await fn('noop-lock')
                    }
                } : {}),
            }
        }
    )

    return client;
}
