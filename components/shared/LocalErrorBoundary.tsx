'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  name?: string
  silent?: boolean
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
    if (!this.props.silent) {

    }
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || null
    }

    return this.props.children
  }
}
