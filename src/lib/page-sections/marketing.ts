import type { ComponentType } from 'react'

type PageLoader = () => Promise<{ default: ComponentType }>

export const loaders: Record<string, PageLoader> = {
  'about': () => import('@/components/pages/marketing/about-page').then(m => ({ default: m.AboutPage })),
  'contact': () => import('@/components/pages/marketing/contact-page').then(m => ({ default: m.ContactPage })),
  'faq': () => import('@/components/pages/marketing/faq-page').then(m => ({ default: m.FaqPage })),
  'how-it-works': () => import('@/components/pages/marketing/how-it-works-page').then(m => ({ default: m.HowItWorksPage })),
  'become-provider': () => import('@/components/pages/marketing/become-provider-page').then(m => ({ default: m.BecomeProviderPage })),
  'careers': () => import('@/components/pages/marketing/careers-page').then(m => ({ default: m.CareersPage })),
  'blog': () => import('@/components/pages/marketing/blog-page').then(m => ({ default: m.BlogPage })),
  'blog-detail': () => import('@/components/pages/marketing/blog-detail-page').then(m => ({ default: m.BlogDetailPage })),
  'press': () => import('@/components/pages/marketing/press-page').then(m => ({ default: m.PressPage })),
  'testimonials': () => import('@/components/pages/marketing/testimonials-page').then(m => ({ default: m.TestimonialsPage })),
  'partner-program': () => import('@/components/pages/marketing/partner-program-page').then(m => ({ default: m.PartnerProgramPage })),
}
