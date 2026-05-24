import type { ComponentType } from 'react'

type PageLoader = () => Promise<{ default: ComponentType }>

export const loaders: Record<string, PageLoader> = {
  'chat-inbox': () => import('@/components/pages/communication/chat-inbox-page').then(m => ({ default: m.ChatInboxPage })),
  'provider-customer-chat': () => import('@/components/pages/communication/provider-customer-chat-page').then(m => ({ default: m.ProviderCustomerChatPage })),
  'admin-support-chat': () => import('@/components/pages/communication/admin-support-chat-page').then(m => ({ default: m.AdminSupportChatPage })),
  'attachment-preview': () => import('@/components/pages/communication/attachment-preview-page').then(m => ({ default: m.AttachmentPreviewPage })),
  'video-consultation': () => import('@/components/pages/communication/video-consultation-page').then(m => ({ default: m.VideoConsultationPage })),
  'call-history': () => import('@/components/pages/communication/call-history-page').then(m => ({ default: m.CallHistoryPage })),
}
