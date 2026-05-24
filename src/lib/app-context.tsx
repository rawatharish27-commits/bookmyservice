'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { type Page, type NavigationState } from '@/lib/navigation'

interface AppContextType {
  nav: NavigationState
  navigate: (page: Page, params?: Record<string, string>) => void
  goBack: () => void
  history: NavigationState[]
  role: 'admin' | 'client' | 'provider' | 'public'
  setRole: (role: 'admin' | 'client' | 'provider' | 'public') => void
}

const AppContext = createContext<AppContextType | null>(null)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<'admin' | 'client' | 'provider' | 'public'>('client')
  const [history, setHistory] = useState<NavigationState[]>([
    { page: 'home' as Page, params: {} },
  ])
  const [nav, setNav] = useState<NavigationState>({
    page: 'home' as Page,
    params: {},
  })

  const navigate = useCallback((page: Page, params: Record<string, string> = {}) => {
    setNav({ page, params })
    setHistory(prev => [...prev.slice(-49), { page, params }])
    window.scrollTo(0, 0)
  }, [])

  const goBack = useCallback(() => {
    setHistory(prev => {
      if (prev.length <= 1) return prev
      const newHistory = prev.slice(0, -1)
      const last = newHistory[newHistory.length - 1]
      if (last) setNav(last)
      return newHistory
    })
  }, [])

  return (
    <AppContext.Provider value={{ nav, navigate, goBack, history, role, setRole }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) throw new Error('useApp must be used within AppProvider')
  return context
}
