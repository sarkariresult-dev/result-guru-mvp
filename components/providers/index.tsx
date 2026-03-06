'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, type ReactNode } from 'react'
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

export function Providers({ children }: { children: ReactNode }) {
    const [queryClient] = useState(makeQueryClient)

    return (
        <QueryClientProvider client={queryClient}>
            <NextThemesProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
            >
                {children}
            </NextThemesProvider>
        </QueryClientProvider>
    )
}
