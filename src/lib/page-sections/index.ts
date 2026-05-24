import type { ComponentType } from 'react'

type PageLoader = () => Promise<{ default: ComponentType }>

// Section loaders - each section is dynamically imported on demand
export const sectionLoaderMap: Record<string, () => Promise<Record<string, PageLoader>>> = {
  public: () => import('./public').then(m => m.loaders),
  auth: () => import('./auth').then(m => m.loaders),
  customer: () => import('./customer').then(m => m.loaders),
  booking: () => import('./booking').then(m => m.loaders),
  tracking: () => import('./tracking').then(m => m.loaders),
  provider: () => import('./provider').then(m => m.loaders),
  admin: () => import('./admin').then(m => m.loaders),
  communication: () => import('./communication').then(m => m.loaders),
  marketing: () => import('./marketing').then(m => m.loaders),
  legal: () => import('./legal').then(m => m.loaders),
  advanced: () => import('./advanced').then(m => m.loaders),
  error: () => import('./error').then(m => m.loaders),
  pwa: () => import('./pwa').then(m => m.loaders),
}
