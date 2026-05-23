'use client'

import { useState, useEffect, useCallback } from 'react'

interface ApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { ...state, refetch: fetchData }
}

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
