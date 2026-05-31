'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Shield,
  Eye,
  Lock,
  Cookie,
  Users,
  Baby,
  FileText,
  Mail,
  ChevronRight,
  Database,
  Server,
  Bell,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Info,
} from 'lucide-react'

const tocItems = [
  { id: 'information-collection', label: 'Information We Collect', icon: Database },
  { id: 'how-we-use', label: 'How We Use Your Data', icon: Eye },
  { id: 'data-sharing', label: 'Data Sharing & Disclosure', icon: Users },
  { id: 'cookies', label: 'Cookies & Tracking', icon: Cookie },
  { id: 'data-security', label: 'Data Security', icon: Lock },
  { id: 'user-rights', label: 'Your Rights', icon: Shield },
  { id: 'children-privacy', label: "Children's Privacy", icon: Baby },
  { id: 'changes', label: 'Changes to This Policy', icon: FileText },
  { id: 'contact', label: 'Contact Us', icon: Mail },
]

export function PrivacyPolicyPage() {
  const [activeSection, setActiveSection] = useState('information-collection')

  const scrollToSection = (id: string) => {
    setActiveSection(id)
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center justify-center size-10 rounded-lg bg-[#1D63FF]">
              <Shield className="size-5 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Privacy Policy</h1>
          </div>
          <p className="text-slate-500 max-w-2xl">
            At BookMyService, we are committed to protecting your privacy and ensuring the security of your personal information. This policy describes how we collect, use, and safeguard your data.
          </p>
          <div className="flex items-center gap-4 mt-4">
            <Badge variant="outline" className="text-xs text-slate-500 border-slate-200">
              <Clock className="size-3 mr-1" />
              Last Updated: March 1, 2025
            </Badge>
            <Badge variant="outline" className="text-xs text-[#1D63FF] border-blue-200 bg-blue-50">
              <CheckCircle2 className="size-3 mr-1" />
              Effective Immediately
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Table of Contents */}
          <aside className="lg:w-72 shrink-0">
            <div className="lg:sticky lg:top-8">
              <Card className="bg-white rounded-xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-slate-900">Table of Contents</CardTitle>
                </CardHeader>
                <CardContent className="p-0 pb-2">
                  <ScrollArea className="max-h-[70vh]">
                    <nav className="space-y-0.5 px-2">
                      {tocItems.map((item) => {
                        const Icon = item.icon
                        const isActive = activeSection === item.id
                        return (
                          <button
                            key={item.id}
                            onClick={() => scrollToSection(item.id)}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-sm transition-colors ${
                              isActive
                                ? 'bg-blue-50 text-[#1D63FF] font-medium'
                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                            }`}
                          >
                            <Icon className="size-4 shrink-0" />
                            <span className="truncate">{item.label}</span>
                            {isActive && <ChevronRight className="size-3 ml-auto shrink-0" />}
                          </button>
                        )
                      })}
                    </nav>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Quick Info Card */}
              <Card className="bg-white rounded-xl mt-4">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="size-4 text-[#1D63FF]" />
                    <span className="text-sm font-semibold text-slate-900">Quick Summary</span>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-500">
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="size-3 text-green-500 mt-0.5 shrink-0" />
                      We only collect data necessary to provide our services
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="size-3 text-green-500 mt-0.5 shrink-0" />
                      Your data is never sold to third parties
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="size-3 text-green-500 mt-0.5 shrink-0" />
                      You can request data deletion at any time
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="size-3 text-green-500 mt-0.5 shrink-0" />
                      256-bit SSL encryption for all data
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 min-w-0 space-y-6">
            {/* Section 1: Information Collection */}
            <Card id="information-collection" className="bg-white rounded-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
                  <Database className="size-5 text-[#1D63FF]" />
                  1. Information We Collect
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-sm text-slate-600 leading-relaxed">
                  We collect information you provide directly to us, information collected automatically when you use our platform, and information from third-party sources. Below is a detailed breakdown of the categories of information we collect.
                </p>

                <div className="space-y-4">
                  <div className="rounded-lg border border-slate-200 p-4">
                    <h3 className="text-sm font-semibold text-slate-900 mb-2">Personal Information</h3>
                    <ul className="space-y-1.5 text-sm text-slate-600">
                      <li className="flex items-start gap-2"><CheckCircle2 className="size-4 text-[#1D63FF] mt-0.5 shrink-0" /> Full name, email address, and phone number</li>
                      <li className="flex items-start gap-2"><CheckCircle2 className="size-4 text-[#1D63FF] mt-0.5 shrink-0" /> Residential and billing addresses</li>
                      <li className="flex items-start gap-2"><CheckCircle2 className="size-4 text-[#1D63FF] mt-0.5 shrink-0" /> Date of birth and gender (optional)</li>
                      <li className="flex items-start gap-2"><CheckCircle2 className="size-4 text-[#1D63FF] mt-0.5 shrink-0" /> Government-issued ID (for KYC verification of service providers)</li>
                      <li className="flex items-start gap-2"><CheckCircle2 className="size-4 text-[#1D63FF] mt-0.5 shrink-0" /> Profile photographs (optional)</li>
                    </ul>
                  </div>

                  <div className="rounded-lg border border-slate-200 p-4">
                    <h3 className="text-sm font-semibold text-slate-900 mb-2">Payment Information</h3>
                    <ul className="space-y-1.5 text-sm text-slate-600">
                      <li className="flex items-start gap-2"><CheckCircle2 className="size-4 text-[#1D63FF] mt-0.5 shrink-0" /> Payment method details (credit/debit card, UPI, wallets)</li>
                      <li className="flex items-start gap-2"><CheckCircle2 className="size-4 text-[#1D63FF] mt-0.5 shrink-0" /> Billing history and transaction records</li>
                      <li className="flex items-start gap-2"><CheckCircle2 className="size-4 text-[#1D63FF] mt-0.5 shrink-0" /> Bank account details (for service provider payouts)</li>
                    </ul>
                    <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                      <AlertTriangle className="size-3" />
                      Payment card data is processed securely through Razorpay/Stripe and never stored on our servers.
                    </p>
                  </div>

                  <div className="rounded-lg border border-slate-200 p-4">
                    <h3 className="text-sm font-semibold text-slate-900 mb-2">Usage & Device Information</h3>
                    <ul className="space-y-1.5 text-sm text-slate-600">
                      <li className="flex items-start gap-2"><CheckCircle2 className="size-4 text-[#1D63FF] mt-0.5 shrink-0" /> Device type, operating system, and browser information</li>
                      <li className="flex items-start gap-2"><CheckCircle2 className="size-4 text-[#1D63FF] mt-0.5 shrink-0" /> IP address and approximate location (city-level)</li>
                      <li className="flex items-start gap-2"><CheckCircle2 className="size-4 text-[#1D63FF] mt-0.5 shrink-0" /> Pages visited, features used, and time spent on the platform</li>
                      <li className="flex items-start gap-2"><CheckCircle2 className="size-4 text-[#1D63FF] mt-0.5 shrink-0" /> Search queries and service preferences</li>
                      <li className="flex items-start gap-2"><CheckCircle2 className="size-4 text-[#1D63FF] mt-0.5 shrink-0" /> Push notification and communication preferences</li>
                    </ul>
                  </div>

                  <div className="rounded-lg border border-slate-200 p-4">
                    <h3 className="text-sm font-semibold text-slate-900 mb-2">Information from Third Parties</h3>
                    <ul className="space-y-1.5 text-sm text-slate-600">
                      <li className="flex items-start gap-2"><CheckCircle2 className="size-4 text-[#1D63FF] mt-0.5 shrink-0" /> Google/Facebook account data (when using social login)</li>
                      <li className="flex items-start gap-2"><CheckCircle2 className="size-4 text-[#1D63FF] mt-0.5 shrink-0" /> Referral information from existing users</li>
                      <li className="flex items-start gap-2"><CheckCircle2 className="size-4 text-[#1D63FF] mt-0.5 shrink-0" /> Background check results (for service providers)</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section 2: How We Use Data */}
            <Card id="how-we-use" className="bg-white rounded-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
                  <Eye className="size-5 text-[#1D63FF]" />
                  2. How We Use Your Data
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-600 leading-relaxed">
                  We use the information we collect to provide, maintain, and improve our services, to process transactions, and to communicate with you. Specifically, we use your data for the following purposes:
                </p>

                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    { title: 'Service Delivery', desc: 'Matching you with service providers, scheduling bookings, and managing appointments' },
                    { title: 'Account Management', desc: 'Creating and verifying your account, authentication, and account security' },
                    { title: 'Payment Processing', desc: 'Processing payments, refunds, issuing invoices, and managing wallet transactions' },
                    { title: 'Communication', desc: 'Sending booking confirmations, reminders, updates, and customer support responses' },
                    { title: 'Safety & Trust', desc: 'Verifying provider identities, background checks, fraud prevention, and platform safety' },
                    { title: 'Personalization', desc: 'Recommending services, personalized offers, and improving your experience' },
                    { title: 'Analytics & Improvement', desc: 'Understanding usage patterns, fixing bugs, and improving platform performance' },
                    { title: 'Legal Compliance', desc: 'Meeting regulatory requirements under Indian IT Act, GST laws, and tax obligations' },
                  ].map((item) => (
                    <div key={item.title} className="rounded-lg border border-slate-100 bg-slate-50/50 p-3">
                      <h4 className="text-sm font-semibold text-slate-900 mb-1">{item.title}</h4>
                      <p className="text-xs text-slate-500">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Section 3: Data Sharing */}
            <Card id="data-sharing" className="bg-white rounded-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
                  <Users className="size-5 text-[#1D63FF]" />
                  3. Data Sharing & Disclosure
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-600 leading-relaxed">
                  We do not sell your personal data. We share your information only in the following circumstances:
                </p>

                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="flex items-center justify-center size-8 rounded-full bg-blue-50 text-[#1D63FF] shrink-0 text-sm font-bold">1</div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">With Service Providers</h4>
                      <p className="text-xs text-slate-500 mt-0.5">We share your name, address, and phone number with the assigned service professional to facilitate the booking. This information is necessary for them to reach your location and provide the service.</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex gap-3">
                    <div className="flex items-center justify-center size-8 rounded-full bg-blue-50 text-[#1D63FF] shrink-0 text-sm font-bold">2</div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">With Payment Partners</h4>
                      <p className="text-xs text-slate-500 mt-0.5">We share transaction data with Razorpay, Stripe, and banking partners to process payments securely. Card details are never stored on our servers.</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex gap-3">
                    <div className="flex items-center justify-center size-8 rounded-full bg-blue-50 text-[#1D63FF] shrink-0 text-sm font-bold">3</div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">With Analytics Partners</h4>
                      <p className="text-xs text-slate-500 mt-0.5">We use Google Analytics and Mixpanel to understand platform usage. All data is anonymized and aggregated before analysis.</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex gap-3">
                    <div className="flex items-center justify-center size-8 rounded-full bg-blue-50 text-[#1D63FF] shrink-0 text-sm font-bold">4</div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">For Legal Requirements</h4>
                      <p className="text-xs text-slate-500 mt-0.5">We may disclose information when required by law, court order, or government authority under the Information Technology Act, 2000, or other applicable Indian laws.</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex gap-3">
                    <div className="flex items-center justify-center size-8 rounded-full bg-blue-50 text-[#1D63FF] shrink-0 text-sm font-bold">5</div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">Business Transfers</h4>
                      <p className="text-xs text-slate-500 mt-0.5">In the event of a merger, acquisition, or sale of assets, your data may be transferred to the acquiring entity with the same level of protection.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section 4: Cookies */}
            <Card id="cookies" className="bg-white rounded-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
                  <Cookie className="size-5 text-[#1D63FF]" />
                  4. Cookies & Tracking Technologies
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-600 leading-relaxed">
                  We use cookies and similar tracking technologies to enhance your experience on BookMyService. Cookies are small data files stored on your device that help us recognize you and remember your preferences.
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-2 px-3 font-semibold text-slate-900">Cookie Type</th>
                        <th className="text-left py-2 px-3 font-semibold text-slate-900">Purpose</th>
                        <th className="text-left py-2 px-3 font-semibold text-slate-900">Duration</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-600">
                      <tr className="border-b border-slate-100">
                        <td className="py-2 px-3"><Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">Essential</Badge></td>
                        <td className="py-2 px-3">Session management, authentication, security</td>
                        <td className="py-2 px-3">Session / 30 days</td>
                      </tr>
                      <tr className="border-b border-slate-100">
                        <td className="py-2 px-3"><Badge variant="outline" className="text-xs bg-blue-50 text-[#0B3D91] border-blue-200">Functional</Badge></td>
                        <td className="py-2 px-3">Remember preferences, language, region</td>
                        <td className="py-2 px-3">1 year</td>
                      </tr>
                      <tr className="border-b border-slate-100">
                        <td className="py-2 px-3"><Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">Analytics</Badge></td>
                        <td className="py-2 px-3">Usage patterns, performance monitoring</td>
                        <td className="py-2 px-3">2 years</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3"><Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">Marketing</Badge></td>
                        <td className="py-2 px-3">Targeted advertising, campaign tracking</td>
                        <td className="py-2 px-3">90 days</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-slate-400">You can manage your cookie preferences through your browser settings. Disabling essential cookies may affect platform functionality.</p>
              </CardContent>
            </Card>

            {/* Section 5: Data Security */}
            <Card id="data-security" className="bg-white rounded-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
                  <Lock className="size-5 text-[#1D63FF]" />
                  5. Data Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-600 leading-relaxed">
                  We implement industry-standard security measures to protect your personal data from unauthorized access, alteration, disclosure, or destruction.
                </p>

                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    { title: '256-bit SSL Encryption', desc: 'All data transmission is encrypted using TLS 1.3', icon: '🔐' },
                    { title: 'PCI DSS Compliant', desc: 'Payment data handled through PCI DSS Level 1 certified processors', icon: '💳' },
                    { title: 'Regular Security Audits', desc: 'Third-party penetration testing conducted quarterly', icon: '🔍' },
                    { title: 'Access Controls', desc: 'Role-based access with multi-factor authentication for staff', icon: '🛡️' },
                    { title: 'Data Encryption at Rest', desc: 'AES-256 encryption for all stored personal data', icon: '🗄️' },
                    { title: 'Incident Response', desc: '24/7 security monitoring with <1 hour breach response time', icon: '🚨' },
                  ].map((item) => (
                    <div key={item.title} className="rounded-lg border border-slate-100 bg-slate-50/50 p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{item.icon}</span>
                        <h4 className="text-sm font-semibold text-slate-900">{item.title}</h4>
                      </div>
                      <p className="text-xs text-slate-500 ml-7">{item.desc}</p>
                    </div>
                  ))}
                </div>

                <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="size-4 text-amber-600" />
                    <span className="text-sm font-semibold text-amber-800">Important Note</span>
                  </div>
                  <p className="text-xs text-amber-700">
                    While we strive to protect your data, no method of electronic transmission or storage is 100% secure. We encourage you to use strong passwords and enable two-factor authentication.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Section 6: User Rights */}
            <Card id="user-rights" className="bg-white rounded-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
                  <Shield className="size-5 text-[#1D63FF]" />
                  6. Your Rights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-600 leading-relaxed">
                  Under the Information Technology Act, 2000, and applicable data protection regulations, you have the following rights regarding your personal data:
                </p>

                <div className="space-y-3">
                  {[
                    { title: 'Right to Access', desc: 'You can request a copy of all personal data we hold about you. We will provide this within 30 days of receiving your request.' },
                    { title: 'Right to Correction', desc: 'You can update or correct your personal information at any time through your account settings or by contacting us.' },
                    { title: 'Right to Deletion', desc: 'You can request deletion of your account and associated data. Some data may be retained for legal or legitimate business purposes.' },
                    { title: 'Right to Data Portability', desc: 'You can request your data in a machine-readable format (JSON/CSV) for transfer to another service provider.' },
                    { title: 'Right to Object', desc: 'You can object to the processing of your data for marketing purposes at any time by updating your communication preferences.' },
                    { title: 'Right to Withdraw Consent', desc: 'Where processing is based on your consent, you may withdraw it at any time without affecting the lawfulness of prior processing.' },
                  ].map((item) => (
                    <div key={item.title} className="rounded-lg border border-slate-200 p-4">
                      <h4 className="text-sm font-semibold text-slate-900 mb-1">{item.title}</h4>
                      <p className="text-xs text-slate-500">{item.desc}</p>
                    </div>
                  ))}
                </div>

                <p className="text-xs text-slate-400">
                  To exercise any of these rights, please contact our Data Protection Officer at privacy@bookmyservice.in or use the in-app privacy settings.
                </p>
              </CardContent>
            </Card>

            {/* Section 7: Children's Privacy */}
            <Card id="children-privacy" className="bg-white rounded-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
                  <Baby className="size-5 text-[#1D63FF]" />
                  7. Children&apos;s Privacy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-600 leading-relaxed">
                  BookMyService is not intended for use by individuals under the age of 18. We do not knowingly collect personal information from children.
                </p>
                <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                  <p className="text-sm text-red-700">
                    If we discover that we have inadvertently collected personal data from a person under 18, we will take immediate steps to delete such information from our servers. If you believe a child has provided us with personal data, please contact us immediately.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Section 8: Changes to Policy */}
            <Card id="changes" className="bg-white rounded-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
                  <FileText className="size-5 text-[#1D63FF]" />
                  8. Changes to This Policy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-600 leading-relaxed">
                  We may update this Privacy Policy from time to time to reflect changes in our practices, technologies, legal requirements, or other factors. When we make material changes:
                </p>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-start gap-2"><CheckCircle2 className="size-4 text-[#1D63FF] mt-0.5 shrink-0" /> We will notify you via email and in-app notification at least 15 days before the changes take effect</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="size-4 text-[#1D63FF] mt-0.5 shrink-0" /> The &quot;Last Updated&quot; date at the top of this page will be revised</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="size-4 text-[#1D63FF] mt-0.5 shrink-0" /> Continued use of our platform after changes constitutes acceptance of the revised policy</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="size-4 text-[#1D63FF] mt-0.5 shrink-0" /> For significant changes, we may require your explicit consent</li>
                </ul>
              </CardContent>
            </Card>

            {/* Section 9: Contact */}
            <Card id="contact" className="bg-white rounded-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
                  <Mail className="size-5 text-[#1D63FF]" />
                  9. Contact Us
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-600 leading-relaxed">
                  If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us through the following channels:
                </p>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="rounded-lg border border-slate-200 p-4">
                    <h4 className="text-sm font-semibold text-slate-900 mb-2">Data Protection Officer</h4>
                    <p className="text-xs text-slate-500">privacy@bookmyservice.in</p>
                    <p className="text-xs text-slate-500">+91-1800-123-4567 (Toll Free)</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 p-4">
                    <h4 className="text-sm font-semibold text-slate-900 mb-2">Registered Office</h4>
                    <p className="text-xs text-slate-500">BookMyService Technologies Pvt. Ltd.</p>
                    <p className="text-xs text-slate-500">123, Sector 62, Noida, Uttar Pradesh 201309, India</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button className="gap-2 bg-[#1D63FF] hover:bg-[#0B3D91] text-white rounded-xl">
                    <Mail className="size-4" />
                    Email Privacy Team
                  </Button>
                  <Button variant="outline" className="gap-2 border-slate-200 rounded-xl">
                    <Bell className="size-4" />
                    Raise a Grievance
                  </Button>
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </div>
  )
}
