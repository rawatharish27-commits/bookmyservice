'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  FileText,
  UserPlus,
  CalendarCheck,
  CreditCard,
  RotateCcw,
  Wrench,
  Copyright,
  ShieldAlert,
  Scale,
  Landmark,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Info,
  IndianRupee,
} from 'lucide-react'

const tocItems = [
  { id: 'acceptance', label: 'Acceptance of Terms', icon: FileText },
  { id: 'account-registration', label: 'Account Registration', icon: UserPlus },
  { id: 'service-booking', label: 'Service Booking', icon: CalendarCheck },
  { id: 'payment-terms', label: 'Payment Terms', icon: CreditCard },
  { id: 'cancellation-refund', label: 'Cancellation & Refund', icon: RotateCcw },
  { id: 'provider-terms', label: 'Provider Terms', icon: Wrench },
  { id: 'intellectual-property', label: 'Intellectual Property', icon: Copyright },
  { id: 'limitation-liability', label: 'Limitation of Liability', icon: ShieldAlert },
  { id: 'dispute-resolution', label: 'Dispute Resolution', icon: Scale },
  { id: 'governing-law', label: 'Governing Law', icon: Landmark },
]

export function TermsPage() {
  const [activeSection, setActiveSection] = useState('acceptance')

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
              <FileText className="size-5 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Terms of Service</h1>
          </div>
          <p className="text-slate-500 max-w-2xl">
            These Terms of Service govern your use of the BookMyService platform. By accessing or using our services, you agree to be bound by these terms. Please read them carefully before using our platform.
          </p>
          <div className="flex items-center gap-4 mt-4">
            <Badge variant="outline" className="text-xs text-slate-500 border-slate-200">
              <Clock className="size-3 mr-1" />
              Effective: January 1, 2025
            </Badge>
            <Badge variant="outline" className="text-xs text-[#1D63FF] border-blue-200 bg-blue-50">
              <CheckCircle2 className="size-3 mr-1" />
              Version 3.2
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-72 shrink-0">
            <div className="lg:sticky lg:top-8">
              <Card className="bg-white rounded-xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-slate-900">Table of Contents</CardTitle>
                </CardHeader>
                <CardContent className="p-0 pb-2">
                  <ScrollArea className="max-h-[75vh]">
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

              <Card className="bg-white rounded-xl mt-4">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="size-4 text-[#1D63FF]" />
                    <span className="text-sm font-semibold text-slate-900">Key Highlights</span>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-500">
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="size-3 text-green-500 mt-0.5 shrink-0" />
                      Free cancellation within 2 hours of booking
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="size-3 text-green-500 mt-0.5 shrink-0" />
                      100% refund for unfulfilled services
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="size-3 text-green-500 mt-0.5 shrink-0" />
                      Dispute resolution within 7 business days
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="size-3 text-green-500 mt-0.5 shrink-0" />
                      Governed by Indian laws
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0 space-y-6">
            {/* Section 1: Acceptance */}
            <Card id="acceptance" className="bg-white rounded-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
                  <FileText className="size-5 text-[#1D63FF]" />
                  1. Acceptance of Terms
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-600 leading-relaxed">
                  By downloading, accessing, or using the BookMyService mobile application, website, or any related services (collectively, the &quot;Platform&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms, you must not use the Platform.
                </p>
                <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
                  <h4 className="text-sm font-semibold text-blue-900 mb-2">Important Acknowledgments</h4>
                  <ul className="space-y-1.5 text-xs text-[#0B3D91]">
                    <li className="flex items-start gap-2"><CheckCircle2 className="size-4 text-blue-500 mt-0.5 shrink-0" /> You have read and understood these Terms in their entirety</li>
                    <li className="flex items-start gap-2"><CheckCircle2 className="size-4 text-blue-500 mt-0.5 shrink-0" /> You are at least 18 years of age</li>
                    <li className="flex items-start gap-2"><CheckCircle2 className="size-4 text-blue-500 mt-0.5 shrink-0" /> You have the legal capacity to enter into a binding agreement</li>
                    <li className="flex items-start gap-2"><CheckCircle2 className="size-4 text-blue-500 mt-0.5 shrink-0" /> You agree to comply with all applicable laws and regulations</li>
                  </ul>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  BookMyService Technologies Pvt. Ltd. (&quot;Company&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) reserves the right to modify these Terms at any time. Continued use of the Platform after modifications constitutes your acceptance of the revised Terms.
                </p>
              </CardContent>
            </Card>

            {/* Section 2: Account Registration */}
            <Card id="account-registration" className="bg-white rounded-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
                  <UserPlus className="size-5 text-[#1D63FF]" />
                  2. Account Registration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-600 leading-relaxed">
                  To use certain features of the Platform, you must register for an account. You may register as a Customer or a Service Provider, each with specific requirements:
                </p>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="rounded-lg border border-slate-200 p-4">
                    <h4 className="text-sm font-semibold text-slate-900 mb-3">Customer Account</h4>
                    <ul className="space-y-2 text-xs text-slate-600">
                      <li className="flex items-start gap-2"><CheckCircle2 className="size-3 text-green-500 mt-0.5 shrink-0" /> Valid mobile number (Indian)</li>
                      <li className="flex items-start gap-2"><CheckCircle2 className="size-3 text-green-500 mt-0.5 shrink-0" /> Email address verification</li>
                      <li className="flex items-start gap-2"><CheckCircle2 className="size-3 text-green-500 mt-0.5 shrink-0" /> Complete residential address</li>
                      <li className="flex items-start gap-2"><CheckCircle2 className="size-3 text-green-500 mt-0.5 shrink-0" /> Age verification (18+)</li>
                    </ul>
                  </div>
                  <div className="rounded-lg border border-slate-200 p-4">
                    <h4 className="text-sm font-semibold text-slate-900 mb-3">Service Provider Account</h4>
                    <ul className="space-y-2 text-xs text-slate-600">
                      <li className="flex items-start gap-2"><CheckCircle2 className="size-3 text-blue-500 mt-0.5 shrink-0" /> All Customer requirements</li>
                      <li className="flex items-start gap-2"><CheckCircle2 className="size-3 text-blue-500 mt-0.5 shrink-0" /> Aadhaar / PAN verification</li>
                      <li className="flex items-start gap-2"><CheckCircle2 className="size-3 text-blue-500 mt-0.5 shrink-0" /> Professional certifications (if applicable)</li>
                      <li className="flex items-start gap-2"><CheckCircle2 className="size-3 text-blue-500 mt-0.5 shrink-0" /> Bank account for payouts</li>
                      <li className="flex items-start gap-2"><CheckCircle2 className="size-3 text-blue-500 mt-0.5 shrink-0" /> Background verification clearance</li>
                    </ul>
                  </div>
                </div>

                <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="size-4 text-amber-600" />
                    <span className="text-sm font-semibold text-amber-800">Account Security</span>
                  </div>
                  <p className="text-xs text-amber-700">
                    You are responsible for maintaining the confidentiality of your account credentials. Any activity under your account is your responsibility. Notify us immediately of any unauthorized access at security@bookmyservice.in.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Section 3: Service Booking */}
            <Card id="service-booking" className="bg-white rounded-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
                  <CalendarCheck className="size-5 text-[#1D63FF]" />
                  3. Service Booking
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-600 leading-relaxed">
                  When you book a service through BookMyService, you enter into a service agreement with the assigned Service Provider. BookMyService acts as an intermediary platform facilitating the connection between customers and providers.
                </p>

                <div className="space-y-3">
                  <div className="rounded-lg border border-slate-200 p-4">
                    <h4 className="text-sm font-semibold text-slate-900 mb-2">Booking Process</h4>
                    <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                      {['Select Service', 'Choose Provider', 'Pick Date/Time', 'Confirm & Pay', 'Service Delivered'].map((step, i) => (
                        <div key={step} className="flex items-center gap-2">
                          <div className="flex items-center justify-center size-6 rounded-full bg-[#1D63FF] text-white text-xs font-bold">{i + 1}</div>
                          <span className="text-xs text-slate-600">{step}</span>
                          {i < 4 && <ChevronRight className="size-3 text-slate-300 hidden sm:block" />}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-lg border border-slate-200 p-4">
                    <h4 className="text-sm font-semibold text-slate-900 mb-2">Booking Terms</h4>
                    <ul className="space-y-1.5 text-sm text-slate-600">
                      <li className="flex items-start gap-2"><CheckCircle2 className="size-4 text-[#1D63FF] mt-0.5 shrink-0" /> Service prices are inclusive of all applicable taxes (GST)</li>
                      <li className="flex items-start gap-2"><CheckCircle2 className="size-4 text-[#1D63FF] mt-0.5 shrink-0" /> Estimated service duration may vary based on actual work required</li>
                      <li className="flex items-start gap-2"><CheckCircle2 className="size-4 text-[#1D63FF] mt-0.5 shrink-0" /> Additional charges may apply for extra work not included in the original booking</li>
                      <li className="flex items-start gap-2"><CheckCircle2 className="size-4 text-[#1D63FF] mt-0.5 shrink-0" /> You must ensure access to the service location at the scheduled time</li>
                      <li className="flex items-start gap-2"><CheckCircle2 className="size-4 text-[#1D63FF] mt-0.5 shrink-0" /> Service providers carry valid ID that must be verified before granting access</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section 4: Payment Terms */}
            <Card id="payment-terms" className="bg-white rounded-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
                  <CreditCard className="size-5 text-[#1D63FF]" />
                  4. Payment Terms
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-600 leading-relaxed">
                  All payments on the Platform are processed in Indian Rupees (INR) through our authorized payment partners. The following payment terms apply:
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-2 px-3 font-semibold text-slate-900">Payment Method</th>
                        <th className="text-left py-2 px-3 font-semibold text-slate-900">Processing Time</th>
                        <th className="text-left py-2 px-3 font-semibold text-slate-900">Platform Fee</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-600">
                      <tr className="border-b border-slate-100">
                        <td className="py-2 px-3">UPI (GPay, PhonePe, Paytm)</td>
                        <td className="py-2 px-3">Instant</td>
                        <td className="py-2 px-3">No extra charge</td>
                      </tr>
                      <tr className="border-b border-slate-100">
                        <td className="py-2 px-3">Debit Card</td>
                        <td className="py-2 px-3">Instant</td>
                        <td className="py-2 px-3">No extra charge</td>
                      </tr>
                      <tr className="border-b border-slate-100">
                        <td className="py-2 px-3">Credit Card</td>
                        <td className="py-2 px-3">Instant</td>
                        <td className="py-2 px-3">1.5% surcharge</td>
                      </tr>
                      <tr className="border-b border-slate-100">
                        <td className="py-2 px-3">Net Banking</td>
                        <td className="py-2 px-3">1-2 hours</td>
                        <td className="py-2 px-3">No extra charge</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3">BookMyService Wallet</td>
                        <td className="py-2 px-3">Instant</td>
                        <td className="py-2 px-3">No extra charge</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="rounded-lg border border-slate-200 p-4">
                  <h4 className="text-sm font-semibold text-slate-900 mb-2">Important Payment Notes</h4>
                  <ul className="space-y-1.5 text-xs text-slate-600">
                    <li className="flex items-start gap-2"><IndianRupee className="size-3 text-[#1D63FF] mt-0.5 shrink-0" /> All prices include 18% GST unless otherwise stated</li>
                    <li className="flex items-start gap-2"><IndianRupee className="size-3 text-[#1D63FF] mt-0.5 shrink-0" /> Payment is authorized at booking and captured upon service completion</li>
                    <li className="flex items-start gap-2"><IndianRupee className="size-3 text-[#1D63FF] mt-0.5 shrink-0" /> Platform commission of 15-20% is deducted from provider payout</li>
                    <li className="flex items-start gap-2"><IndianRupee className="size-3 text-[#1D63FF] mt-0.5 shrink-0" /> Invoices are auto-generated and available in your account</li>
                    <li className="flex items-start gap-2"><IndianRupee className="size-3 text-[#1D63FF] mt-0.5 shrink-0" /> Cash payments are not accepted for safety and transparency</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Section 5: Cancellation & Refund */}
            <Card id="cancellation-refund" className="bg-white rounded-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
                  <RotateCcw className="size-5 text-[#1D63FF]" />
                  5. Cancellation & Refund
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-600 leading-relaxed">
                  You may cancel a booking subject to the following conditions. Please refer to our separate Cancellation Policy and Refund Policy for detailed procedures.
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-2 px-3 font-semibold text-slate-900">Cancellation Time</th>
                        <th className="text-left py-2 px-3 font-semibold text-slate-900">Fee</th>
                        <th className="text-left py-2 px-3 font-semibold text-slate-900">Refund</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-600">
                      <tr className="border-b border-slate-100">
                        <td className="py-2 px-3">Within 2 hours of booking</td>
                        <td className="py-2 px-3"><Badge className="bg-green-100 text-green-700 hover:bg-green-100">Free</Badge></td>
                        <td className="py-2 px-3">100% refund</td>
                      </tr>
                      <tr className="border-b border-slate-100">
                        <td className="py-2 px-3">2-24 hours before service</td>
                        <td className="py-2 px-3"><Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">₹50</Badge></td>
                        <td className="py-2 px-3">Refund minus fee</td>
                      </tr>
                      <tr className="border-b border-slate-100">
                        <td className="py-2 px-3">1-6 hours before service</td>
                        <td className="py-2 px-3"><Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">25%</Badge></td>
                        <td className="py-2 px-3">75% refund</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3">Less than 1 hour / No-show</td>
                        <td className="py-2 px-3"><Badge className="bg-red-100 text-red-700 hover:bg-red-100">100%</Badge></td>
                        <td className="py-2 px-3">No refund</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <p className="text-xs text-slate-400">
                  Refunds are processed within 5-7 business days to the original payment method. For wallet refunds, processing is instant.
                </p>
              </CardContent>
            </Card>

            {/* Section 6: Provider Terms */}
            <Card id="provider-terms" className="bg-white rounded-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
                  <Wrench className="size-5 text-[#1D63FF]" />
                  6. Service Provider Terms
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-600 leading-relaxed">
                  Service Providers (&quot;Providers&quot;) are independent contractors and not employees of BookMyService. By registering as a Provider, you agree to the following additional terms:
                </p>

                <div className="space-y-3">
                  {[
                    { title: 'Independent Contractor Status', desc: 'You are an independent service provider. BookMyService does not control your methods, tools, or work schedule. You are responsible for your own taxes, insurance, and compliance.' },
                    { title: 'Quality Standards', desc: 'You must maintain professional standards, arrive on time, carry proper equipment, and deliver services as described. Customer ratings below 3.5 stars may result in account review.' },
                    { title: 'Background Verification', desc: 'You consent to criminal background verification, address verification, and professional reference checks. BookMyService reserves the right to deactivate accounts that fail verification.' },
                    { title: 'Payout Terms', desc: 'Earnings are transferred to your registered bank account every Tuesday and Friday. Minimum payout threshold is ₹200. Platform commission is deducted before payout.' },
                    { title: 'Service Guarantee', desc: 'You guarantee the quality of your work for 7 days post-service. If a customer reports an issue within this period, you must address it at no additional charge.' },
                  ].map((item) => (
                    <div key={item.title} className="rounded-lg border border-slate-200 p-4">
                      <h4 className="text-sm font-semibold text-slate-900 mb-1">{item.title}</h4>
                      <p className="text-xs text-slate-500">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Section 7: Intellectual Property */}
            <Card id="intellectual-property" className="bg-white rounded-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
                  <Copyright className="size-5 text-[#1D63FF]" />
                  7. Intellectual Property
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-600 leading-relaxed">
                  All content, features, and functionality of the Platform, including but not limited to text, graphics, logos, icons, images, audio clips, software, and their compilation, are the exclusive property of BookMyService Technologies Pvt. Ltd. and are protected by Indian and international copyright, trademark, and other intellectual property laws.
                </p>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="rounded-lg border border-slate-200 p-4">
                    <h4 className="text-sm font-semibold text-slate-900 mb-2">Our Rights</h4>
                    <ul className="space-y-1.5 text-xs text-slate-600">
                      <li>• &quot;BookMyService&quot; name and logo are registered trademarks</li>
                      <li>• Platform design, code, and content are proprietary</li>
                      <li>• Service categories and pricing structures are protected</li>
                      <li>• Unauthorized reproduction is strictly prohibited</li>
                    </ul>
                  </div>
                  <div className="rounded-lg border border-slate-200 p-4">
                    <h4 className="text-sm font-semibold text-slate-900 mb-2">Your License</h4>
                    <ul className="space-y-1.5 text-xs text-slate-600">
                      <li>• Limited, non-exclusive, non-transferable license to use the Platform</li>
                      <li>• You retain ownership of content you submit (reviews, photos)</li>
                      <li>• By posting content, you grant us a worldwide, royalty-free license</li>
                      <li>• License terminates upon account deletion</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section 8: Limitation of Liability */}
            <Card id="limitation-liability" className="bg-white rounded-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
                  <ShieldAlert className="size-5 text-[#1D63FF]" />
                  8. Limitation of Liability
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg bg-red-50 border border-red-200 p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="size-4 text-red-600" />
                    <span className="text-sm font-semibold text-red-800">Please Read Carefully</span>
                  </div>
                  <p className="text-xs text-red-700">
                    This section limits our liability. By using the Platform, you agree to these limitations.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="rounded-lg border border-slate-200 p-4">
                    <h4 className="text-sm font-semibold text-slate-900 mb-2">To the Maximum Extent Permitted by Law:</h4>
                    <ul className="space-y-1.5 text-xs text-slate-600">
                      <li className="flex items-start gap-2"><AlertTriangle className="size-3 text-amber-500 mt-0.5 shrink-0" /> BookMyService is not liable for the quality, safety, or legality of services provided by Service Providers</li>
                      <li className="flex items-start gap-2"><AlertTriangle className="size-3 text-amber-500 mt-0.5 shrink-0" /> We are not liable for any indirect, incidental, special, consequential, or punitive damages</li>
                      <li className="flex items-start gap-2"><AlertTriangle className="size-3 text-amber-500 mt-0.5 shrink-0" /> Our total liability shall not exceed the amount paid by you to us in the 12 months preceding the claim</li>
                      <li className="flex items-start gap-2"><AlertTriangle className="size-3 text-amber-500 mt-0.5 shrink-0" /> We are not liable for service delays caused by force majeure events</li>
                    </ul>
                  </div>

                  <div className="rounded-lg border border-slate-200 p-4">
                    <h4 className="text-sm font-semibold text-slate-900 mb-2">What We Do Guarantee:</h4>
                    <ul className="space-y-1.5 text-xs text-slate-600">
                      <li className="flex items-start gap-2"><CheckCircle2 className="size-3 text-green-500 mt-0.5 shrink-0" /> Full refund if a confirmed booking is not fulfilled by the provider</li>
                      <li className="flex items-start gap-2"><CheckCircle2 className="size-3 text-green-500 mt-0.5 shrink-0" /> Resolution of payment disputes within 7 business days</li>
                      <li className="flex items-start gap-2"><CheckCircle2 className="size-3 text-green-500 mt-0.5 shrink-0" /> Data security as per our Privacy Policy commitments</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section 9: Dispute Resolution */}
            <Card id="dispute-resolution" className="bg-white rounded-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
                  <Scale className="size-5 text-[#1D63FF]" />
                  9. Dispute Resolution
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-600 leading-relaxed">
                  We encourage you to contact us first to resolve any disputes. Most issues can be resolved through our customer support team.
                </p>

                <div className="space-y-3">
                  {[
                    { step: '1', title: 'Contact Support', desc: 'Raise a complaint through the app or email support@bookmyservice.in. We aim to respond within 24 hours.' },
                    { step: '2', title: 'Escalation', desc: 'If unresolved within 48 hours, escalate to our Grievance Officer at grievance@bookmyservice.in.' },
                    { step: '3', title: 'Mediation', desc: 'For disputes exceeding ₹50,000, we offer mediation through an independent mediator mutually agreed upon.' },
                    { step: '4', title: 'Arbitration', desc: 'Unresolved disputes shall be referred to arbitration under the Arbitration and Conciliation Act, 1996. The arbitration shall be conducted in English.' },
                  ].map((item) => (
                    <div key={item.step} className="flex gap-3">
                      <div className="flex items-center justify-center size-8 rounded-full bg-[#1D63FF] text-white text-sm font-bold shrink-0">{item.step}</div>
                      <div>
                        <h4 className="text-sm font-semibold text-slate-900">{item.title}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Section 10: Governing Law */}
            <Card id="governing-law" className="bg-white rounded-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
                  <Landmark className="size-5 text-[#1D63FF]" />
                  10. Governing Law & Jurisdiction
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-600 leading-relaxed">
                  These Terms are governed by and construed in accordance with the laws of India. The following legal frameworks apply:
                </p>

                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    { law: 'Information Technology Act, 2000', scope: 'Electronic commerce, data protection' },
                    { law: 'Consumer Protection Act, 2019', scope: 'Consumer rights, e-commerce rules' },
                    { law: 'Indian Contract Act, 1872', scope: 'Service agreements, contracts' },
                    { law: 'GST Act, 2017', scope: 'Taxation on services' },
                    { law: 'Arbitration & Conciliation Act, 1996', scope: 'Dispute resolution' },
                    { law: 'Copyright Act, 1957', scope: 'Intellectual property' },
                  ].map((item) => (
                    <div key={item.law} className="rounded-lg border border-slate-100 bg-slate-50/50 p-3">
                      <h4 className="text-xs font-semibold text-slate-900">{item.law}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{item.scope}</p>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="rounded-lg border border-slate-200 p-4">
                  <h4 className="text-sm font-semibold text-slate-900 mb-2">Jurisdiction</h4>
                  <p className="text-xs text-slate-600">
                    The courts of Noida, Uttar Pradesh, India shall have exclusive jurisdiction over any disputes arising from these Terms. You agree to submit to the personal jurisdiction of these courts.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mt-4">
                  <Button className="gap-2 bg-[#1D63FF] hover:bg-[#0B3D91] rounded-xl">
                    <FileText className="size-4" />
                    Download Full Terms (PDF)
                  </Button>
                  <Button variant="outline" className="gap-2 border-slate-200 rounded-xl">
                    Contact Legal Team
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
