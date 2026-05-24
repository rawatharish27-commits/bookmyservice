import type { ComponentType } from 'react'

type PageLoader = () => Promise<{ default: ComponentType }>

export const loaders: Record<string, PageLoader> = {
  'install-app': () => import('@/components/pages/pwa/install-app-page').then(m => ({ default: m.InstallAppPage })),
  'offline-sync': () => import('@/components/pages/pwa/offline-sync-page').then(m => ({ default: m.OfflineSyncPage })),
  'push-permission': () => import('@/components/pages/pwa/push-permission-page').then(m => ({ default: m.PushPermissionPage })),
  'device-sessions': () => import('@/components/pages/pwa/device-sessions-page').then(m => ({ default: m.DeviceSessionsPage })),
}
