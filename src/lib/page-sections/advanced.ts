import type { ComponentType } from 'react'

type PageLoader = () => Promise<{ default: ComponentType }>

export const loaders: Record<string, PageLoader> = {
  'franchise-dashboard': () => import('@/components/pages/advanced/franchise-dashboard-page').then(m => ({ default: m.FranchiseDashboardPage })),
  'franchise-management': () => import('@/components/pages/advanced/franchise-management-page').then(m => ({ default: m.FranchiseManagementPage })),
  'crm-dashboard': () => import('@/components/pages/advanced/crm-dashboard-page').then(m => ({ default: m.CRMDashboardPage })),
  'lead-management': () => import('@/components/pages/advanced/lead-management-page').then(m => ({ default: m.LeadManagementPage })),
  'vendor-management': () => import('@/components/pages/advanced/vendor-management-page').then(m => ({ default: m.VendorManagementPage })),
  'inventory-management': () => import('@/components/pages/advanced/inventory-management-page').then(m => ({ default: m.InventoryManagementPage })),
  'escrow-management': () => import('@/components/pages/advanced/escrow-management-page').then(m => ({ default: m.EscrowManagementPage })),
  'dynamic-pricing': () => import('@/components/pages/advanced/dynamic-pricing-page').then(m => ({ default: m.DynamicPricingPage })),
  'recommendation-engine': () => import('@/components/pages/advanced/recommendation-engine-page').then(m => ({ default: m.RecommendationEnginePage })),
  'ai-suggestions': () => import('@/components/pages/advanced/ai-suggestions-page').then(m => ({ default: m.AISuggestionsPage })),
  'loyalty-rewards': () => import('@/components/pages/advanced/loyalty-rewards-page').then(m => ({ default: m.LoyaltyRewardsPage })),
}
