import type { ComponentType } from 'react'

type PageLoader = () => Promise<{ default: ComponentType }>

export const loaders: Record<string, PageLoader> = {
  'privacy-policy': () => import('@/components/pages/legal/privacy-policy-page').then(m => ({ default: m.PrivacyPolicyPage })),
  'terms': () => import('@/components/pages/legal/terms-page').then(m => ({ default: m.TermsPage })),
  'refund-policy': () => import('@/components/pages/legal/refund-policy-page').then(m => ({ default: m.RefundPolicyPage })),
  'cancellation-policy': () => import('@/components/pages/legal/cancellation-policy-page').then(m => ({ default: m.CancellationPolicyPage })),
  'cookie-policy': () => import('@/components/pages/legal/cookie-policy-page').then(m => ({ default: m.CookiePolicyPage })),
  'gdpr': () => import('@/components/pages/legal/gdpr-page').then(m => ({ default: m.GDPRPage })),
}
