import type { ComponentType } from 'react'

type PageLoader = () => Promise<{ default: ComponentType }>

export const loaders: Record<string, PageLoader> = {
  'login': () => import('@/components/pages/auth/login-page').then(m => ({ default: m.LoginPage })),
  'signup': () => import('@/components/pages/auth/signup-page').then(m => ({ default: m.SignupPage })),
  'forgot-password': () => import('@/components/pages/auth/forgot-password-page').then(m => ({ default: m.ForgotPasswordPage })),
  'reset-password': () => import('@/components/pages/auth/reset-password-page').then(m => ({ default: m.ResetPasswordPage })),
  'otp-verification': () => import('@/components/pages/auth/otp-verification-page').then(m => ({ default: m.OtpVerificationPage })),
  'email-verification': () => import('@/components/pages/auth/email-verification-page').then(m => ({ default: m.EmailVerificationPage })),
  'phone-verification': () => import('@/components/pages/auth/phone-verification-page').then(m => ({ default: m.PhoneVerificationPage })),
  'role-selection': () => import('@/components/pages/auth/role-selection-page').then(m => ({ default: m.RoleSelectionPage })),
  'social-callback': () => import('@/components/pages/auth/social-callback-page').then(m => ({ default: m.SocialCallbackPage })),
}
