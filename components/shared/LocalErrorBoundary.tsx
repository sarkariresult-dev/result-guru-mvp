'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  name?: string
}

interface State {
  hasError: boolean
}

/**
 * LocalErrorBoundary - Result Guru
 * 
 * Prevents a single component (like an ad or tracker) from crashing
 * the whole page. If the child fails, it logs the error and
 * renders the fallback (default: null).
 */
export class LocalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  }

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`LocalErrorBoundary (${this.props.name || 'unnamed'}):`, error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback !== undefined) return this.props.fallback
      
      // Default subtle debug fallback to identify failing components inrestricted previews
      return (
        <div className="my-2 border border-dashed border-red-200 bg-red-50/30 px-2 py-1 text-[9px] font-medium text-red-500/60 rounded">
          [!] {this.props.name || 'Component'} Restricted
        </div>
      )
    }

    return this.props.children
  }
}
