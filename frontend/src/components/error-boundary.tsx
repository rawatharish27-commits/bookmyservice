'use client'

import React from 'react'
import { ErrorBoundary as ReactErrorBoundary, FallbackProps } from 'react-error-boundary'

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
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
        An unexpected error occurred. This has been logged and our team will look into it.
      </p>
      {(() => {
        const errMsg = error instanceof Error ? error.message : null
        return errMsg ? (
          <div className="mt-4 max-w-lg rounded-lg bg-muted p-3 text-left">
            <p className="text-sm font-mono text-muted-foreground break-words">{errMsg}</p>
          </div>
        ) : null
      })()}
      <div className="mt-6 flex gap-3">
        <button
          onClick={resetErrorBoundary}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0a1628] to-[#2d5a8e] px-6 py-3 text-white shadow-lg transition-opacity hover:opacity-90"
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
  console.error('🔴 ErrorBoundary caught:', error)
  console.error('Component stack:', info.componentStack)
}

export function ErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={logError}
      onReset={() => {
        // Reset the window location to clear the error state
        window.location.reload()
      }}
    >
      {children}
    </ReactErrorBoundary>
  )
}
