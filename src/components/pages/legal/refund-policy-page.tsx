'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  RotateCcw,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  IndianRupee,
  CalendarClock,
  CreditCard,
  Wallet,
  Shield,
  ArrowRight,
  Timer,
  FileCheck,
  HelpCircle,
  Info,
} from 'lucide-react'

const faqItems = [
  {
    question: 'How long does a refund take to reflect in my bank account?',
    answer: 'Refunds to bank accounts and credit/debit cards typically take 5-7 business days after initiation. UPI refunds are usually faster, processed within 2-3 business days. Wallet refunds are instant.',
  },
  {
    question: 'What if the service provider does not show up?',
    answer: 'If a confirmed service provider does not arrive within 30 minutes of the scheduled time, you are eligible for a 100% refund plus a ₹100 BookMyService wallet credit as compensation for your time.',
  },
  {
    question: 'Can I get a partial refund if the service was incomplete?',
    answer: 'Yes. If the service was partially completed or the quality was unsatisfactory, you can raise a dispute within 48 hours. Our team will assess the issue and process a partial refund of 25-75% based on the severity.',
  },
  {
    question: 'Do I get charged for requesting a refund?',
    answer: 'No. There are no processing fees for legitimate refund requests. However, if a pattern of fraudulent refund claims is detected, your account may be reviewed and appropriate action taken.',
  },
  {
    question: 'What happens to the service provider payment when a refund is issued?',
    answer: 'When a refund is approved, the corresponding amount is deducted from the service provider\'s pending earnings. If the provider has already been paid, the amount is adjusted in their next payout cycle.',
  },
  {
    question: 'Can I get a refund for AMC (Annual Maintenance Contract) plans?',
    answer: 'AMC plans can be cancelled within 7 days of purchase for a full refund. After 7 days, a pro-rata refund is calculated based on unused months, minus a 10% administrative fee.',
  },
]

const refundTimeline = [
  { step: 1, title: 'Raise Refund Request', desc: 'Submit through app or website within 48 hours', time: 'Immediate', color: 'bg-[#0A1F44]' },
  { step: 2, title: 'Review & Verification', desc: 'Our team reviews the request and contacts provider', time: '24-48 hours', color: 'bg-[#FFD54F]/100' },
  { step: 3, title: 'Decision Made', desc: 'Refund approved, partially approved, or denied', time: '1-3 business days', color: 'bg-blue-400' },
  { step: 4, title: 'Refund Initiated', desc: 'Amount transferred to original payment method', time: 'Same day as approval', color: 'bg-green-500' },
  { step: 5, title: 'Refund Reflected', desc: 'Amount appears in your account', time: '5-7 business days', color: 'bg-green-600' },
]

export function RefundPolicyPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 sm:py-12">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center justify-center size-10 rounded-lg bg-[#0A1F44]">
              <RotateCcw className="size-5 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Refund Policy</h1>
          </div>
          <p className="text-slate-500 max-w-2xl">
            We want you to be completely satisfied with every service booked on BookMyService. If you&apos;re not happy, we&apos;re here to help with our transparent refund process.
          </p>
          <div className="flex items-center gap-4 mt-4">
            <Badge variant="outline" className="text-xs text-slate-500 border-slate-200">
              <Clock className="size-3 mr-1" />
              Last Updated: February 15, 2025
            </Badge>
            <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-xs">
              <CheckCircle2 className="size-3 mr-1" />
              100% Satisfaction Guarantee
            </Badge>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 space-y-6">
        {/* Quick Summary Cards */}
        <div className="grid sm:grid-cols-3 gap-4">
          <Card className="bg-white rounded-xl">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center size-12 rounded-full bg-[#FFD54F]/10 mx-auto mb-2">
                <Timer className="size-6 text-[#0A1F44]" />
              </div>
              <p className="text-2xl font-bold text-slate-900">48 hrs</p>
              <p className="text-xs text-slate-500">Window to raise refund</p>
            </CardContent>
          </Card>
          <Card className="bg-white rounded-xl">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center size-12 rounded-full bg-green-50 mx-auto mb-2">
                <CreditCard className="size-6 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-slate-900">5-7 days</p>
              <p className="text-xs text-slate-500">Refund processing time</p>
            </CardContent>
          </Card>
          <Card className="bg-white rounded-xl">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center size-12 rounded-full bg-amber-50 mx-auto mb-2">
                <IndianRupee className="size-6 text-amber-600" />
              </div>
              <p className="text-2xl font-bold text-slate-900">₹0</p>
              <p className="text-xs text-slate-500">No refund processing fee</p>
            </CardContent>
          </Card>
        </div>

        {/* Refund Process Timeline */}
        <Card className="bg-white rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <ArrowRight className="size-5 text-[#0A1F44]" />
              Refund Process Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-0">
              {refundTimeline.map((item, index) => (
                <div key={item.step} className="flex gap-4">
                  {/* Timeline line + dot */}
                  <div className="flex flex-col items-center">
                    <div className={`flex items-center justify-center size-10 rounded-full ${item.color} text-white text-sm font-bold shrink-0`}>
                      {item.step}
                    </div>
                    {index < refundTimeline.length - 1 && (
                      <div className="w-0.5 h-12 bg-slate-200" />
                    )}
                  </div>
                  {/* Content */}
                  <div className="pb-6">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h4 className="text-sm font-semibold text-slate-900">{item.title}</h4>
                      <Badge variant="outline" className="text-xs text-slate-500 border-slate-200">
                        <Clock className="size-2.5 mr-1" />
                        {item.time}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Eligibility Criteria */}
        <Card className="bg-white rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <FileCheck className="size-5 text-[#0A1F44]" />
              Refund Eligibility Criteria
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-600 leading-relaxed">
              You are eligible for a refund under the following circumstances:
            </p>

            <div className="space-y-3">
              <div className="rounded-lg border border-green-200 bg-green-50/50 p-4">
                <h4 className="text-sm font-semibold text-green-800 mb-2 flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-green-600" />
                  Eligible for Full Refund
                </h4>
                <ul className="space-y-1.5 text-xs text-green-700">
                  <li>• Service provider did not show up within 30 minutes of scheduled time</li>
                  <li>• Service was not delivered as described on the platform</li>
                  <li>• Wrong service was provided (different from what was booked)</li>
                  <li>• Booking was cancelled within the free cancellation window</li>
                  <li>• Duplicate payment was charged for the same booking</li>
                  <li>• Service could not be completed due to provider&apos;s fault</li>
                </ul>
              </div>

              <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-4">
                <h4 className="text-sm font-semibold text-amber-800 mb-2 flex items-center gap-2">
                  <AlertCircle className="size-4 text-amber-600" />
                  Eligible for Partial Refund (25-75%)
                </h4>
                <ul className="space-y-1.5 text-xs text-amber-700">
                  <li>• Service was partially completed but key tasks were left undone</li>
                  <li>• Quality of service was below expected standards</li>
                  <li>• Provider arrived late (more than 30 minutes) but completed the service</li>
                  <li>• Additional materials were used without prior approval</li>
                  <li>• Service took significantly longer than estimated without justification</li>
                </ul>
              </div>

              <div className="rounded-lg border border-red-200 bg-red-50/50 p-4">
                <h4 className="text-sm font-semibold text-red-800 mb-2 flex items-center gap-2">
                  <AlertCircle className="size-4 text-red-600" />
                  Not Eligible for Refund
                </h4>
                <ul className="space-y-1.5 text-xs text-red-700">
                  <li>• Service was completed as described and customer was present during delivery</li>
                  <li>• Refund request raised after 48 hours of service completion</li>
                  <li>• Customer was unavailable at the scheduled time (no-show)</li>
                  <li>• Change of mind after service completion without quality issues</li>
                  <li>• Service was provided and customer signed off on completion</li>
                  <li>• Fraudulent or repeated refund abuse detected</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Partial Refund Structure */}
        <Card className="bg-white rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <IndianRupee className="size-5 text-[#0A1F44]" />
              Partial Refund Structure
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-2 px-3 font-semibold text-slate-900">Issue Type</th>
                    <th className="text-left py-2 px-3 font-semibold text-slate-900">Refund %</th>
                    <th className="text-left py-2 px-3 font-semibold text-slate-900">Example</th>
                  </tr>
                </thead>
                <tbody className="text-slate-600">
                  <tr className="border-b border-slate-100">
                    <td className="py-2 px-3">Minor quality issue</td>
                    <td className="py-2 px-3"><Badge className="bg-green-100 text-green-700 hover:bg-green-100">25%</Badge></td>
                    <td className="py-2 px-3 text-xs">Small area not cleaned in water tank cleaning service</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="py-2 px-3">Moderate quality issue</td>
                    <td className="py-2 px-3"><Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">50%</Badge></td>
                    <td className="py-2 px-3 text-xs">AC repair but cooling not fully restored</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="py-2 px-3">Significant quality issue</td>
                    <td className="py-2 px-3"><Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">75%</Badge></td>
                    <td className="py-2 px-3 text-xs">Plumber repair but leak persists partially</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3">Service not rendered</td>
                    <td className="py-2 px-3"><Badge className="bg-red-100 text-red-700 hover:bg-red-100">100%</Badge></td>
                    <td className="py-2 px-3 text-xs">Provider no-show or service not started at all</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Service-Specific Refund Policies */}
        <Card className="bg-white rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <CalendarClock className="size-5 text-[#0A1F44]" />
              Service-Specific Refund Policies
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { category: 'Water Tank Cleaning', policy: 'If unsatisfied, free re-service within 48 hours or 50% refund', icon: '🏠' },
                { category: 'Air Conditioner', policy: '7-day service guarantee. Free re-repair or full refund if issue recurs', icon: '❄️' },
                { category: 'Plumber', policy: '30-day warranty on repairs. Full refund if problem not resolved', icon: '🔧' },
                { category: 'Electrician', policy: '15-day warranty. Free re-service or 75% refund on quality issues', icon: '⚡' },
                { category: 'Kitchen Appliances', policy: 'Inspection within 7 days. Touch-up free or 25-50% refund for uneven work', icon: '🎨' },
                { category: 'Electrician', policy: 'Same-day complaint only. 50% refund for service quality issues', icon: '💅' },
                { category: 'Water Purifier', policy: '30-day guarantee. Free re-treatment or full refund if pests return', icon: '🐛' },
                { category: 'Movers and Packers', policy: 'Damage claims within 24 hours. Full compensation for documented damages', icon: '📦' },
              ].map((item) => (
                <div key={item.category} className="rounded-lg border border-slate-200 p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{item.icon}</span>
                    <h4 className="text-sm font-semibold text-slate-900">{item.category}</h4>
                  </div>
                  <p className="text-xs text-slate-500 ml-7">{item.policy}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Refund by Payment Method */}
        <Card className="bg-white rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <Wallet className="size-5 text-[#0A1F44]" />
              Refund by Payment Method
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-2 px-3 font-semibold text-slate-900">Payment Method</th>
                    <th className="text-left py-2 px-3 font-semibold text-slate-900">Processing Time</th>
                    <th className="text-left py-2 px-3 font-semibold text-slate-900">Refund To</th>
                  </tr>
                </thead>
                <tbody className="text-slate-600">
                  <tr className="border-b border-slate-100">
                    <td className="py-2 px-3">UPI</td>
                    <td className="py-2 px-3">2-3 business days</td>
                    <td className="py-2 px-3">Original UPI account</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="py-2 px-3">Credit/Debit Card</td>
                    <td className="py-2 px-3">5-7 business days</td>
                    <td className="py-2 px-3">Original card</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="py-2 px-3">Net Banking</td>
                    <td className="py-2 px-3">5-7 business days</td>
                    <td className="py-2 px-3">Original bank account</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="py-2 px-3">BookMyService Wallet</td>
                    <td className="py-2 px-3">Instant</td>
                    <td className="py-2 px-3">Wallet balance</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3">EMI Payment</td>
                    <td className="py-2 px-3">5-7 business days</td>
                    <td className="py-2 px-3">EMI adjusted / Card credited</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="rounded-lg bg-[#FFD54F]/10 border border-[#FFD54F]/20 p-4 mt-4">
              <div className="flex items-center gap-2 mb-1">
                <Info className="size-4 text-[#0A1F44]" />
                <span className="text-sm font-semibold text-blue-900">Wallet Refund Option</span>
              </div>
              <p className="text-xs text-[#0A1F44]">
                You can choose to receive refunds in your BookMyService Wallet for instant processing. Wallet balance can be used for future bookings and never expires.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Important Notes */}
        <Card className="bg-white rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <Shield className="size-5 text-[#0A1F44]" />
              Important Notes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              'All refund requests must be raised within 48 hours of service completion through the app or website.',
              'Photographic or video evidence may be required for quality-related refund claims.',
              'Refunds are processed to the original payment method. We cannot redirect refunds to a different account.',
              'For services booked through coupons or promotional offers, the refund amount is calculated on the actual amount paid, not the original service price.',
              'In case of bank holidays, refund processing may take an additional 1-2 business days.',
              'BookMyService reserves the right to investigate refund requests and may request additional information before approval.',
              'If a service provider disputes a refund claim, an independent assessment may be conducted within 7 business days.',
            ].map((note, i) => (
              <div key={i} className="flex items-start gap-2">
                <CheckCircle2 className="size-4 text-[#0A1F44] mt-0.5 shrink-0" />
                <p className="text-sm text-slate-600">{note}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* FAQ */}
        <Card className="bg-white rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <HelpCircle className="size-5 text-[#0A1F44]" />
              Frequently Asked Questions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {faqItems.map((faq, index) => (
              <div key={index} className="rounded-lg border border-slate-200 overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors"
                >
                  <span className="text-sm font-medium text-slate-900 pr-4">{faq.question}</span>
                  {openFaq === index ? (
                    <ChevronUp className="size-4 text-slate-400 shrink-0" />
                  ) : (
                    <ChevronDown className="size-4 text-slate-400 shrink-0" />
                  )}
                </button>
                {openFaq === index && (
                  <div className="px-4 pb-4 pt-0">
                    <Separator className="mb-3" />
                    <p className="text-sm text-slate-600">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Contact */}
        <Card className="bg-white rounded-xl">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Need Help with a Refund?</h3>
            <p className="text-sm text-slate-500 mb-4">Our support team is available 24/7 to assist you with any refund-related queries.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button className="gap-2 bg-[#0A1F44] hover:bg-[#0A1F44]/90 text-white rounded-xl">
                <RotateCcw className="size-4" />
                Raise Refund Request
              </Button>
              <Button variant="outline" className="gap-2 border-slate-200 rounded-xl">
                Contact Support
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
