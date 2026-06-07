'use client'

import { useState, useEffect, useCallback } from 'react'

interface ApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

/**
 * Fetcher-based API hook — takes an async function instead of a URL.
 * Used by most page components.
 */
export function useApi<T>(fetcher: () => Promise<T>, deps: unknown[] = []): ApiState<T> & { refetch: () => void } {
  const [state, setState] = useState<ApiState<T>>({ data: null, loading: true, error: null })

  const fetchData = useCallback(async () => {
    setState({ data: null, loading: true, error: null })
    try {
      const result = await fetcher()
      setState({ data: result, loading: false, error: null })
    } catch (err) {
      setState({ data: null, loading: false, error: err instanceof Error ? err.message : 'Something went wrong' })
    }
  }, deps)

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { ...state, refetch: fetchData }
}

/**
 * Mock API hook — returns provided data after a delay.
 * Used for development/testing with placeholder data.
 */
export function useMockApi<T>(mockData: T, delay = 800): ApiState<T> & { refetch: () => void } {
  const [state, setState] = useState<ApiState<T>>({ data: null, loading: true, error: null })

  const fetchData = useCallback(() => {
    setState({ data: null, loading: true, error: null })
    const timer = setTimeout(() => {
      setState({ data: mockData, loading: false, error: null })
    }, delay)
    return () => clearTimeout(timer)
  }, [mockData, delay])

  useEffect(() => {
    const cleanup = fetchData()
    return cleanup
  }, [fetchData])

  return { ...state, refetch: fetchData }
}

/**
 * URL-based API hook — fetches data from an API endpoint URL.
 * Falls back gracefully when the API is unavailable.
 */
export function useUrlApi<T>(url: string, options?: RequestInit): ApiState<T> & { refetch: () => void } {
  const [state, setState] = useState<ApiState<T>>({ data: null, loading: true, error: null })

  const fetchData = useCallback(async () => {
    setState({ data: null, loading: true, error: null })
    try {
      if (!url) {
        // No URL provided — skip fetch, resolve with null
        setState({ data: null, loading: false, error: null })
        return
      }
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || ''
      const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`
      const res = await fetch(fullUrl, {
        headers: { 'Content-Type': 'application/json', ...options?.headers },
        ...options,
      })
      if (!res.ok) throw new Error(`API error: ${res.status}`)
      const result = await res.json()
      setState({ data: result as T, loading: false, error: null })
    } catch (err) {
      setState({ data: null, loading: false, error: err instanceof Error ? err.message : 'Something went wrong' })
    }
  }, [url])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { ...state, refetch: fetchData }
}
