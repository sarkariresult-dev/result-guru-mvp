'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, type ReactNode, Component, type ErrorInfo } from 'react'
import { STALE_TIME } from '@/config/constants'

function makeQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: STALE_TIME.POSTS,
                gcTime: 1000 * 60 * 10,            // garbage-collect after 10 min
                refetchOnWindowFocus: false,
                refetchOnReconnect: 'always',       // refetch when network recovers
                retry: (failureCount, error) => {
                    // Don't retry 4xx errors (bad input), only retry transient errors
                    if (error instanceof Error && /^4\d{2}/.test(error.message)) return false
                    return failureCount < 2
                },
                retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
            },
            mutations: {
                retry: false,                       // never auto-retry mutations
            },
        },
    })
}

/**
 * Ultra-safe wrapper around next-themes ThemeProvider.
 * In cross-origin iframes (AdSense preview), ThemeProvider can crash
 * because it accesses localStorage during hydration. Since it wraps
 * the ENTIRE app, this crash kills everything. This boundary catches
 * it and renders children without theming instead.
 */
class SafeThemeProvider extends Component<
    { children: ReactNode },
    { hasError: boolean }
> {
    state = { hasError: false }

    static getDerivedStateFromError(): { hasError: boolean } {
        return { hasError: true }
    }

    componentDidCatch(error: Error, info: ErrorInfo) {

    }

    render() {
        if (this.state.hasError) {
            // Render children without theming — better than a dead page
            return this.props.children
        }
        return (
            <NextThemesProvider
                attribute="class"
                defaultTheme="light"
                enableSystem
                disableTransitionOnChange
            >
                {this.props.children}
            </NextThemesProvider>
        )
    }
}

export function Providers({ children }: { children: ReactNode }) {
    const [queryClient] = useState(makeQueryClient)

    return (
        <QueryClientProvider client={queryClient}>
            <SafeThemeProvider>
                {children}
            </SafeThemeProvider>
        </QueryClientProvider>
    )
}
