'use client'

import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#D4A017] p-8">
      <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-md w-full text-center">
        <div className="flex items-center justify-center size-20 rounded-full bg-red-100 mx-auto mb-6">
          <AlertTriangle className="size-10 text-red-500" />
        </div>
        <h1 className="text-2xl font-extrabold text-[#0A1F44] mb-3">Oops! Something broke</h1>
        <p className="text-slate-500 mb-2">
          {error?.message || 'An unexpected error occurred'}
        </p>
        {error?.digest && (
          <p className="text-xs text-slate-400 mb-6">Error ID: {error.digest}</p>
        )}
        <div className="flex flex-col gap-3 mt-6">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#0A1F44] text-[#FFD54F] font-bold hover:bg-[#132D5E] transition-all"
          >
            <RefreshCw className="size-4" /> Try Again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-[#0A1F44]/20 text-[#0A1F44] font-semibold hover:bg-[#0A1F44]/5 transition-all"
          >
            <Home className="size-4" /> Go Home
          </a>
        </div>
      </div>
    </div>
  )
}
