'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Cookie,
  Shield,
  BarChart3,
  Megaphone,
  Settings,
  Clock,
  CheckCircle2,
  AlertCircle,
  Info,
  ExternalLink,
  Globe,
  Eye,
  Lock,
  ToggleLeft,
  Monitor,
} from 'lucide-react'

const cookieCategories = [
  {
    id: 'essential',
    title: 'Essential Cookies',
    icon: Shield,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    badgeColor: 'bg-green-100 text-green-700',
    required: true,
    description: 'These cookies are strictly necessary for the platform to function. They cannot be disabled as the platform would not work without them.',
    cookies: [
      { name: 'bms_session', purpose: 'Maintains your login session across pages', duration: 'Session', type: 'First-party' },
      { name: 'bms_auth', purpose: 'Stores authentication token for secure access', duration: '30 days', type: 'First-party' },
      { name: 'bms_csrf', purpose: 'Prevents cross-site request forgery attacks', duration: 'Session', type: 'First-party' },
      { name: 'bms_region', purpose: 'Stores your city/region for service availability', duration: '1 year', type: 'First-party' },
      { name: 'bms_lang', purpose: 'Remembers your language preference', duration: '1 year', type: 'First-party' },
    ],
  },
  {
    id: 'functional',
    title: 'Functional Cookies',
    icon: Settings,
    color: 'text-[#0A1F44]',
    bgColor: 'bg-[#FFD54F]/10',
    borderColor: 'border-[#FFD54F]/20',
    badgeColor: 'bg-[#FFD54F]/10 text-[#0A1F44]',
    required: false,
    description: 'These cookies enable enhanced functionality and personalization. They may be set by us or by third-party providers whose services we have added to our pages.',
    cookies: [
      { name: 'bms_prefs', purpose: 'Remembers your service preferences and filters', duration: '1 year', type: 'First-party' },
      { name: 'bms_recent', purpose: 'Stores recently viewed services and providers', duration: '30 days', type: 'First-party' },
      { name: 'bms_address', purpose: 'Remembers your saved addresses for quick booking', duration: '1 year', type: 'First-party' },
      { name: 'bms_theme', purpose: 'Stores your dark/light mode preference', duration: '1 year', type: 'First-party' },
    ],
  },
  {
    id: 'analytics',
    title: 'Analytics Cookies',
    icon: BarChart3,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    badgeColor: 'bg-amber-100 text-amber-700',
    required: false,
    description: 'These cookies help us understand how visitors interact with our platform by collecting and reporting information anonymously. This helps us improve our services.',
    cookies: [
      { name: '_ga', purpose: 'Google Analytics - distinguishes unique visitors', duration: '2 years', type: 'Third-party (Google)' },
      { name: '_ga_*', purpose: 'Google Analytics - maintains session state', duration: '2 years', type: 'Third-party (Google)' },
      { name: 'bms_anon', purpose: 'Anonymized usage patterns and feature analytics', duration: '1 year', type: 'First-party' },
      { name: 'mp_*', purpose: 'Mixpanel - feature usage and funnel analytics', duration: '1 year', type: 'Third-party (Mixpanel)' },
    ],
  },
  {
    id: 'marketing',
    title: 'Marketing Cookies',
    icon: Megaphone,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    badgeColor: 'bg-purple-100 text-purple-700',
    required: false,
    description: 'These cookies are used to track visitors across websites to display relevant advertisements. They are set by our advertising partners and help measure the effectiveness of our campaigns.',
    cookies: [
      { name: '_fbp', purpose: 'Facebook Pixel - tracks conversions for Facebook ads', duration: '90 days', type: 'Third-party (Meta)' },
      { name: '_gcl_au', purpose: 'Google Ads - tracks conversions for Google ads', duration: '90 days', type: 'Third-party (Google)' },
      { name: 'bms_utm', purpose: 'Tracks campaign source and medium for attribution', duration: '30 days', type: 'First-party' },
      { name: 'bms_promo', purpose: 'Stores active promotional banner dismissals', duration: '7 days', type: 'First-party' },
    ],
  },
]

const thirdPartyServices = [
  { name: 'Google Analytics', purpose: 'Website analytics and user behavior', cookies: ['_ga', '_ga_*'], privacyUrl: 'https://policies.google.com/privacy' },
  { name: 'Mixpanel', purpose: 'Product analytics and feature usage', cookies: ['mp_*'], privacyUrl: 'https://mixpanel.com/legal/privacy-policy/' },
  { name: 'Razorpay', purpose: 'Payment processing and fraud detection', cookies: ['rzp_*'], privacyUrl: 'https://razorpay.com/privacy/' },
  { name: 'Meta (Facebook)', purpose: 'Advertising and conversion tracking', cookies: ['_fbp', '_fbc'], privacyUrl: 'https://www.facebook.com/privacy/policy/' },
  { name: 'Google Ads', purpose: 'Ad conversion and remarketing', cookies: ['_gcl_au'], privacyUrl: 'https://policies.google.com/privacy' },
  { name: 'OneSignal', purpose: 'Push notifications delivery', cookies: ['os_*'], privacyUrl: 'https://onesignal.com/privacy_policy' },
]

export function CookiePolicyPage() {
  const [expandedCategory, setExpandedCategory] = useState<string | null>('essential')

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 sm:py-12">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center justify-center size-10 rounded-lg bg-[#0A1F44]">
              <Cookie className="size-5 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Cookie Policy</h1>
          </div>
          <p className="text-slate-500 max-w-2xl">
            This Cookie Policy explains how BookMyService uses cookies and similar tracking technologies when you visit our platform. Learn what each cookie does and how you can manage your preferences.
          </p>
          <div className="flex items-center gap-4 mt-4">
            <Badge variant="outline" className="text-xs text-slate-500 border-slate-200">
              <Clock className="size-3 mr-1" />
              Last Updated: February 15, 2025
            </Badge>
            <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-xs">
              <Shield className="size-3 mr-1" />
              Essential Cookies Always Active
            </Badge>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 space-y-6">
        {/* What Are Cookies */}
        <Card className="bg-white rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <Cookie className="size-5 text-[#0A1F44]" />
              What Are Cookies?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-600 leading-relaxed">
              Cookies are small text files that are stored on your device (computer, tablet, or mobile) when you visit a website. They are widely used to make websites work more efficiently and to provide information to the owners of the site.
            </p>

            <div className="grid sm:grid-cols-3 gap-3">
              <div className="rounded-lg border border-slate-200 p-4 text-center">
                <Monitor className="size-8 text-[#0A1F44] mx-auto mb-2" />
                <h4 className="text-sm font-semibold text-slate-900">First-Party Cookies</h4>
                <p className="text-xs text-slate-500 mt-1">Set by BookMyService directly. Used for session management, preferences, and security.</p>
              </div>
              <div className="rounded-lg border border-slate-200 p-4 text-center">
                <Globe className="size-8 text-amber-600 mx-auto mb-2" />
                <h4 className="text-sm font-semibold text-slate-900">Third-Party Cookies</h4>
                <p className="text-xs text-slate-500 mt-1">Set by our partners (Google, Razorpay, etc.) for analytics, payments, and advertising.</p>
              </div>
              <div className="rounded-lg border border-slate-200 p-4 text-center">
                <ToggleLeft className="size-8 text-purple-600 mx-auto mb-2" />
                <h4 className="text-sm font-semibold text-slate-900">Similar Technologies</h4>
                <p className="text-xs text-slate-500 mt-1">Local storage, session storage, and pixel tags that serve similar tracking purposes.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cookie Categories */}
        <Card className="bg-white rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <Eye className="size-5 text-[#0A1F44]" />
              Cookie Categories
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-slate-600 mb-4">
              We categorize our cookies into four types. Click on each category to see the specific cookies used and their purposes.
            </p>

            {cookieCategories.map((category) => {
              const Icon = category.icon
              const isExpanded = expandedCategory === category.id

              return (
                <div key={category.id} className={`rounded-xl border ${isExpanded ? category.borderColor : 'border-slate-200'} overflow-hidden`}>
                  <button
                    onClick={() => setExpandedCategory(isExpanded ? null : category.id)}
                    className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex items-center justify-center size-10 rounded-lg ${category.bgColor}`}>
                        <Icon className={`size-5 ${category.color}`} />
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-slate-900">{category.title}</span>
                          {category.required && (
                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-xs">Required</Badge>
                          )}
                          {!category.required && (
                            <Badge variant="outline" className="text-xs text-slate-500 border-slate-200">Optional</Badge>
                          )}
                        </div>
                        <span className="text-xs text-slate-500">{category.cookies.length} cookies</span>
                      </div>
                    </div>
                    <Badge className={category.badgeColor}>{isExpanded ? 'Hide' : 'Show'} Details</Badge>
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4">
                      <Separator className="mb-4" />
                      <p className="text-sm text-slate-600 mb-4">{category.description}</p>

                      <div className="overflow-x-auto">
                        <table className="w-full text-sm border-collapse">
                          <thead>
                            <tr className="border-b border-slate-200">
                              <th className="text-left py-2 px-3 font-semibold text-slate-900">Cookie Name</th>
                              <th className="text-left py-2 px-3 font-semibold text-slate-900">Purpose</th>
                              <th className="text-left py-2 px-3 font-semibold text-slate-900">Duration</th>
                              <th className="text-left py-2 px-3 font-semibold text-slate-900">Type</th>
                            </tr>
                          </thead>
                          <tbody className="text-slate-600">
                            {category.cookies.map((cookie) => (
                              <tr key={cookie.name} className="border-b border-slate-100">
                                <td className="py-2 px-3"><code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded font-mono">{cookie.name}</code></td>
                                <td className="py-2 px-3 text-xs">{cookie.purpose}</td>
                                <td className="py-2 px-3 text-xs">{cookie.duration}</td>
                                <td className="py-2 px-3 text-xs">{cookie.type}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Third-Party Cookies */}
        <Card className="bg-white rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <Globe className="size-5 text-[#0A1F44]" />
              Third-Party Services
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-600 leading-relaxed">
              The following third-party services may set cookies when you use our platform. We carefully vet each partner to ensure they meet our data protection standards.
            </p>

            <div className="grid sm:grid-cols-2 gap-3">
              {thirdPartyServices.map((service) => (
                <div key={service.name} className="rounded-lg border border-slate-200 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-slate-900">{service.name}</h4>
                    <a
                      href={service.privacyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#0A1F44] hover:text-[#0A1F44] flex items-center gap-1"
                    >
                      Privacy <ExternalLink className="size-3" />
                    </a>
                  </div>
                  <p className="text-xs text-slate-500 mb-2">{service.purpose}</p>
                  <div className="flex flex-wrap gap-1">
                    {service.cookies.map((cookie) => (
                      <code key={cookie} className="text-xs bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-600">{cookie}</code>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* How to Manage Cookies */}
        <Card className="bg-white rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <Settings className="size-5 text-[#0A1F44]" />
              How to Manage Your Cookies
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-600 leading-relaxed">
              You have several options for managing your cookie preferences. Note that disabling certain cookies may affect your experience on our platform.
            </p>

            <div className="space-y-3">
              <div className="rounded-lg border border-slate-200 p-4">
                <h4 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
                  <Lock className="size-4 text-[#0A1F44]" />
                  In-App Cookie Preferences
                </h4>
                <p className="text-xs text-slate-600 mb-3">
                  Access cookie settings directly from the BookMyService app: Settings → Privacy → Cookie Preferences. You can enable or disable each non-essential category.
                </p>
                <Button size="sm" className="bg-[#0A1F44] hover:bg-[#0A1F44]/90 text-white rounded-xl">
                  Open Cookie Settings
                </Button>
              </div>

              <div className="rounded-lg border border-slate-200 p-4">
                <h4 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
                  <Monitor className="size-4 text-[#0A1F44]" />
                  Browser Settings
                </h4>
                <p className="text-xs text-slate-600 mb-3">
                  You can also control cookies through your browser settings. Here&apos;s how for popular browsers:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { browser: 'Chrome', path: 'Settings → Privacy → Cookies' },
                    { browser: 'Firefox', path: 'Settings → Privacy → Cookies' },
                    { browser: 'Safari', path: 'Preferences → Privacy' },
                    { browser: 'Edge', path: 'Settings → Cookies → Manage' },
                  ].map((item) => (
                    <div key={item.browser} className="rounded-lg bg-slate-50 p-2 text-center">
                      <p className="text-xs font-semibold text-slate-900">{item.browser}</p>
                      <p className="text-xs text-slate-500">{item.path}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 p-4">
                <h4 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
                  <AlertCircle className="size-4 text-amber-600" />
                  Do Not Track (DNT)
                </h4>
                <p className="text-xs text-slate-600">
                  If your browser sends a Do Not Track signal, we respect this preference and limit non-essential cookie usage. However, DNT is not uniformly supported across all browsers and may not fully prevent all tracking.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Impact of Disabling Cookies */}
        <Card className="bg-white rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <AlertCircle className="size-5 text-amber-600" />
              Impact of Disabling Cookies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-2 px-3 font-semibold text-slate-900">If You Disable...</th>
                    <th className="text-left py-2 px-3 font-semibold text-slate-900">Impact</th>
                  </tr>
                </thead>
                <tbody className="text-slate-600">
                  <tr className="border-b border-slate-100">
                    <td className="py-2 px-3"><Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-xs">Essential</Badge></td>
                    <td className="py-2 px-3 text-xs">Cannot be disabled. Platform will not function without these cookies.</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="py-2 px-3"><Badge className="bg-[#FFD54F]/10 text-[#0A1F44] hover:bg-[#FFD54F]/10 text-xs">Functional</Badge></td>
                    <td className="py-2 px-3 text-xs">Preferences won&apos;t be saved. You&apos;ll need to re-enter addresses and filters each visit.</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="py-2 px-3"><Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 text-xs">Analytics</Badge></td>
                    <td className="py-2 px-3 text-xs">We won&apos;t be able to improve the platform based on usage patterns. No personal impact on your experience.</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3"><Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 text-xs">Marketing</Badge></td>
                    <td className="py-2 px-3 text-xs">You may see less relevant advertisements. Campaign offers may not be personalized to your interests.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Cookie Consent */}
        <Card className="bg-white rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <CheckCircle2 className="size-5 text-[#0A1F44]" />
              Your Consent
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-600 leading-relaxed">
              When you first visit BookMyService, we present a cookie consent banner that allows you to choose which categories of cookies you wish to accept. You can modify your preferences at any time.
            </p>

            <div className="space-y-2">
              {[
                'Essential cookies are always active and do not require consent.',
                'Functional, Analytics, and Marketing cookies require your explicit consent.',
                'You can withdraw consent at any time by updating your cookie preferences.',
                'We review and update our cookie practices regularly and will notify you of any material changes.',
                'Cookie consent is stored for 12 months, after which you will be prompted again.',
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="size-4 text-[#0A1F44] mt-0.5 shrink-0" />
                  <p className="text-sm text-slate-600">{item}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <Button className="gap-2 bg-[#0A1F44] hover:bg-[#0A1F44]/90 text-white rounded-xl">
                <Settings className="size-4" />
                Manage Cookie Preferences
              </Button>
              <Button variant="outline" className="gap-2 border-slate-200 rounded-xl">
                <Cookie className="size-4" />
                Accept All Cookies
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Changes & Contact */}
        <Card className="bg-white rounded-xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <Info className="size-5 text-[#0A1F44]" />
              <h3 className="text-lg font-bold text-slate-900">Changes to This Policy</h3>
            </div>
            <p className="text-sm text-slate-600 mb-4">
              We may update this Cookie Policy from time to time. The &quot;Last Updated&quot; date at the top of this page indicates when the policy was last revised. If we make material changes, we will notify you through the platform or by email.
            </p>
            <p className="text-sm text-slate-600">
              For questions about our cookie practices, contact us at <span className="text-[#0A1F44] font-medium">privacy@bookmyservice.in</span>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
