'use client'

import React from 'react'
import { ErrorBoundary as ReactErrorBoundary, FallbackProps } from 'react-error-boundary'
import { captureReactError } from '../lib/sentry'

// Track chunk loading failures to prevent infinite reload loops
let chunkReloadAttempted = false

function isChunkLoadError(error: unknown): boolean {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase()
    return (
      msg.includes('failed to fetch dynamically imported module') ||
      msg.includes('loading chunk') ||
      msg.includes('loading css chunk') ||
      msg.includes('importing a module script') ||
      (msg.includes('mime type') && msg.includes('text/html'))
    )
  }
  return false
}

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  // Auto-reload for chunk loading errors (deployment update scenario)
  React.useEffect(() => {
    if (isChunkLoadError(error) && !chunkReloadAttempted) {
      chunkReloadAttempted = true
      console.log('🔄 Chunk load error detected — reloading page to get updated assets...')
      // Small delay to allow logging
      setTimeout(() => window.location.reload(), 500)
    }
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center bg-background">
      <div className="mx-auto flex size-20 items-center justify-center rounded-2xl bg-red-50 dark:bg-red-950/20">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-red-500"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <h1 className="mt-6 text-2xl font-bold text-foreground">Something went wrong</h1>
      <p className="mt-2 max-w-md text-muted-foreground">
        {isChunkLoadError(error)
          ? 'The app has been updated. Reloading to get the latest version...'
          : 'An unexpected error occurred. This has been logged and our team will look into it.'
        }
      </p>
      {(() => {
        const errMsg = error instanceof Error ? error.message : null
        return errMsg && !isChunkLoadError(error) ? (
          <div className="mt-4 max-w-lg rounded-lg bg-muted p-3 text-left">
            <p className="text-sm font-mono text-muted-foreground break-words">{errMsg}</p>
          </div>
        ) : null
      })()}
      <div className="mt-6 flex gap-3">
        <button
          onClick={resetErrorBoundary}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0A1F44] via-[#132D5E] to-[#FFD54F] px-6 py-3 text-white shadow-lg transition-opacity hover:opacity-90"
        >
          Try Again
        </button>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3 text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:border-gray-300"
        >
          Reload Page
        </button>
      </div>
    </div>
  )
}

function logError(error: unknown, info: React.ErrorInfo) {
  // Don't log chunk load errors as critical — they're caused by deployments
  if (isChunkLoadError(error)) {
    console.warn('⚠️ Chunk load error (likely deployment update):', error)
    return
  }
  console.error('🔴 ErrorBoundary caught:', error)
  console.error('Component stack:', info.componentStack)
  if (error instanceof Error) {
    captureReactError(error, info)
  }
}

export function ErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={logError}
      onReset={() => {
        // Reset the window location to clear the error state
        chunkReloadAttempted = false
        window.location.reload()
      }}
    >
      {children}
    </ReactErrorBoundary>
  )
}
