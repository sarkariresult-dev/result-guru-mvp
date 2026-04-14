'use client'

/**
 * Global Error Boundary - catches errors in the root layout itself.
 * This MUST provide its own <html>/<body> since the root layout is broken.
 * Only triggered when app/layout.tsx or Providers crash.
 */

import { useEffect } from 'react'

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error('[Global Error Boundary]', {
            message: error.message,
            digest: error.digest,
            stack: error.stack,
        })
    }, [error])

    return (
        <html lang="en-IN" dir="ltr">
            <head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <title>Something went wrong - Result Guru</title>
            </head>
            <body
                style={{
                    margin: 0,
                    fontFamily:
                        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    backgroundColor: '#fafafa',
                    color: '#111',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '100vh',
                    padding: '1rem',
                }}
            >
                <div
                    style={{
                        maxWidth: 440,
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 24,
                    }}
                >
                    {/* Inline SVG - no external deps */}
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="56"
                        height="56"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#dc2626"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden
                    >
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                        <line x1="12" y1="9" x2="12" y2="13" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>

                    <div>
                        <h1 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 8px' }}>
                            Something went wrong
                        </h1>
                        <p
                            style={{
                                fontSize: 14,
                                lineHeight: 1.6,
                                color: '#555',
                                margin: 0,
                            }}
                        >
                            A critical error occurred. Please try refreshing the page. If the
                            issue persists, contact support.
                        </p>
                        {error?.message && (
                            <p
                                style={{
                                    marginTop: 12,
                                    fontSize: 12,
                                    color: '#b91c1c',
                                    fontFamily: 'monospace',
                                    padding: '8px',
                                    background: '#fee2e2',
                                    borderRadius: 4,
                                    textAlign: 'left'
                                }}
                            >
                                <strong>Technical Details:</strong><br />
                                {error.message}
                            </p>
                        )}
                        {error?.digest && (
                            <p
                                style={{
                                    marginTop: 12,
                                    fontSize: 12,
                                    color: '#888',
                                    fontFamily: 'monospace',
                                }}
                            >
                                Error ID:{' '}
                                <code
                                    style={{
                                        background: '#eee',
                                        padding: '2px 6px',
                                        borderRadius: 4,
                                    }}
                                >
                                    {error.digest}
                                </code>
                            </p>
                        )}
                    </div>

                    <div style={{ display: 'flex', gap: 12 }}>
                        <button
                            onClick={reset}
                            style={{
                                padding: '10px 24px',
                                fontSize: 14,
                                fontWeight: 600,
                                color: '#fff',
                                backgroundColor: '#2563eb',
                                border: 'none',
                                borderRadius: 8,
                                cursor: 'pointer',
                            }}
                        >
                            Try Again
                        </button>
                        {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- global-error replaces root layout, next/link unavailable */}
                        <a
                            href="/"
                            style={{
                                padding: '10px 24px',
                                fontSize: 14,
                                fontWeight: 600,
                                color: '#333',
                                backgroundColor: '#fff',
                                border: '1px solid #ddd',
                                borderRadius: 8,
                                textDecoration: 'none',
                                display: 'inline-flex',
                                alignItems: 'center',
                            }}
                        >
                            Go Home
                        </a>
                    </div>
                </div>
            </body>
        </html>
    )
}
