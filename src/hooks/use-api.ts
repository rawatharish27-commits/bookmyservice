'use client'

import { useState, useEffect, useCallback } from 'react'

interface ApiState<T> {
  data: T | null
  isLoading: boolean
  error: string | null
}

/**
 * URL-based API hook — fetches data from an API endpoint.
 * Falls back gracefully when the API is unavailable.
 */
export function useApi<T>(url: string, options?: RequestInit): ApiState<T> & { refetch: () => void } {
  const [state, setState] = useState<ApiState<T>>({ data: null, isLoading: true, error: null })

  const fetchData = useCallback(async () => {
    setState({ data: null, isLoading: true, error: null })
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || ''
      const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`
      const res = await fetch(fullUrl, {
        headers: { 'Content-Type': 'application/json', ...options?.headers },
        ...options,
      })
      if (!res.ok) throw new Error(`API error: ${res.status}`)
      const result = await res.json()
      setState({ data: result as T, isLoading: false, error: null })
    } catch (err) {
      // Graceful fallback: set empty data instead of erroring out
      setState({ data: null, isLoading: false, error: err instanceof Error ? err.message : 'Something went wrong' })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { ...state, refetch: fetchData }
}

/**
 * Fetcher-based API hook — takes an async function instead of a URL.
 */
export function useFetcherApi<T>(fetcher: () => Promise<T>, deps: unknown[] = []): ApiState<T> & { refetch: () => void } {
  const [state, setState] = useState<ApiState<T>>({ data: null, isLoading: true, error: null })

  const fetchData = useCallback(async () => {
    setState({ data: null, isLoading: true, error: null })
    try {
      const result = await fetcher()
      setState({ data: result, isLoading: false, error: null })
    } catch (err) {
      setState({ data: null, isLoading: false, error: err instanceof Error ? err.message : 'Something went wrong' })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { ...state, refetch: fetchData }
}
