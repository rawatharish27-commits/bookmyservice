// ─── Frontend Sentry Integration ────────────────────────────────────────
// Tracks: React crashes, blank screens, unhandled errors, performance issues
//
// Setup: Set VITE_SENTRY_DSN in .env to enable.
// Without it, all operations are no-ops (graceful fallback).
//
// Features:
//   - Automatic crash tracking
//   - Blank screen detection
//   - React error boundary integration
//   - Performance monitoring
//   - User feedback on errors

import * as Sentry from '@sentry/react'

let sentryInitialized = false

// ─── Initialize Sentry ─────────────────────────────────────────────────
export function initSentry(): void {
  const dsn = import.meta.env.VITE_SENTRY_DSN

  if (!dsn) {
    console.log('🔍 Sentry: VITE_SENTRY_DSN not set — frontend monitoring disabled')
    return
  }

  try {
    Sentry.init({
      dsn,
      environment: import.meta.env.MODE || 'development',
      release: import.meta.env.VITE_SENTRY_RELEASE || 'bookmyservice-frontend@1.0.0',

      // Performance
      tracesSampleRate: parseFloat(import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE || '0.1'),

      // React-specific
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration({
          maskAllText: true,
          maskAllInputs: true,
          blockAllMedia: false,
        }),
      ],

      // Session replay sample rates
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,

      // Ignore noisy errors
      ignoreErrors: [
        'ResizeObserver loop limit exceeded',
        'ResizeObserver loop completed with undelivered notifications',
        'Network request failed',
        'Failed to fetch',
        'Load failed',
        'Non-Error promise rejection captured',
        'ChunkLoadError',
        'Loading CSS chunk',
      ],

      // Don't send PII
      sendDefaultPii: false,

      // Attach stack traces
      attachStacktrace: true,
    })

    sentryInitialized = true
    console.log('🔍 Sentry: Frontend monitoring enabled')
  } catch (err) {
    console.warn('🔍 Sentry: Frontend initialization failed —', err)
  }
}

// ─── Capture React Error ───────────────────────────────────────────────
export function captureReactError(
  error: Error,
  errorInfo: React.ErrorInfo
): string | undefined {
  if (!sentryInitialized) return undefined

  return Sentry.captureException(error, {
    contexts: {
      react: {
        componentStack: errorInfo.componentStack,
      },
    },
    tags: {
      category: 'react-crash',
    },
  })
}

// ─── Capture Blank Screen ──────────────────────────────────────────────
// Detects when the root element has no visible content
export function captureBlankScreen(pathname: string): string | undefined {
  if (!sentryInitialized) return undefined

  return Sentry.captureMessage('Potential blank screen detected', {
    level: 'warning',
    tags: {
      category: 'blank-screen',
      pathname,
    },
    extra: {
      rootContent: document.getElementById('root')?.innerHTML?.slice(0, 200) || 'empty',
      url: window.location.href,
      timestamp: new Date().toISOString(),
    },
  })
}

// ─── Set User Context ──────────────────────────────────────────────────
export function setSentryUser(user: { id: string; email?: string; role?: string }): void {
  if (!sentryInitialized) return
  Sentry.setUser(user)
}

// ─── Clear User Context ────────────────────────────────────────────────
export function clearSentryUser(): void {
  if (!sentryInitialized) return
  Sentry.setUser(null)
}

// ─── Add Breadcrumb ────────────────────────────────────────────────────
export function addBreadcrumb(breadcrumb: {
  category: string
  message: string
  level?: Sentry.SeverityLevel
  data?: Record<string, any>
}): void {
  if (!sentryInitialized) return
  Sentry.addBreadcrumb({
    ...breadcrumb,
    timestamp: Date.now() / 1000,
  })
}

// ─── Show User Feedback Dialog ─────────────────────────────────────────
export function showUserFeedbackDialog(eventId?: string): void {
  if (!sentryInitialized) return
  const id = eventId || Sentry.lastEventId()
  if (id) {
    Sentry.showReportDialog({ eventId: id })
  }
}

// ─── Sentry Status ─────────────────────────────────────────────────────
export function isSentryEnabled(): boolean {
  return sentryInitialized
}
