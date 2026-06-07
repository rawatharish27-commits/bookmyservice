'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  XCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  IndianRupee,
  CalendarClock,
  UserX,
  ShieldAlert,
  Zap,
  ArrowRight,
  Phone,
  MessageSquare,
  FileText,
  AlertCircle,
  Info,
} from 'lucide-react'

const cancellationSteps = [
  {
    step: 1,
    title: 'Open Booking Details',
    desc: 'Go to My Bookings → Select the booking → Tap "Cancel Booking"',
    icon: FileText,
  },
  {
    step: 2,
    title: 'Select Cancellation Reason',
    desc: 'Choose from predefined reasons or provide a custom reason for cancellation',
    icon: MessageSquare,
  },
  {
    step: 3,
    title: 'Review Cancellation Fee',
    desc: 'The applicable cancellation fee is displayed based on the time remaining before service',
    icon: IndianRupee,
  },
  {
    step: 4,
    title: 'Confirm Cancellation',
    desc: 'Acknowledge the fee (if any) and confirm the cancellation request',
    icon: CheckCircle2,
  },
  {
    step: 5,
    title: 'Refund Processed',
    desc: 'Refund (minus any cancellation fee) is initiated to your original payment method',
    icon: ArrowRight,
  },
]

const cancellationFeeTable = [
  {
    timeframe: 'Within 2 hours of booking',
    beforeService: 'More than 24 hours',
    fee: '₹0 (Free)',
    feePercent: '0%',
    badgeColor: 'bg-green-100 text-green-700',
  },
  {
    timeframe: 'After 2 hours of booking',
    beforeService: '12-24 hours',
    fee: '₹50',
    feePercent: 'Flat fee',
    badgeColor: 'bg-lime-100 text-lime-700',
  },
  {
    timeframe: 'Same day cancellation',
    beforeService: '6-12 hours',
    fee: '10% of booking amount',
    feePercent: '10%',
    badgeColor: 'bg-amber-100 text-amber-700',
  },
  {
    timeframe: 'Late cancellation',
    beforeService: '2-6 hours',
    fee: '25% of booking amount',
    feePercent: '25%',
    badgeColor: 'bg-orange-100 text-orange-700',
  },
  {
    timeframe: 'Very late cancellation',
    beforeService: '1-2 hours',
    fee: '50% of booking amount',
    feePercent: '50%',
    badgeColor: 'bg-red-100 text-red-700',
  },
  {
    timeframe: 'Last minute / No-show',
    beforeService: 'Less than 1 hour',
    fee: '100% of booking amount',
    feePercent: '100%',
    badgeColor: 'bg-red-200 text-red-800',
  },
]

export function CancellationPolicyPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 sm:py-12">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center justify-center size-10 rounded-lg bg-[#0A1F44]">
              <XCircle className="size-5 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Cancellation Policy</h1>
          </div>
          <p className="text-slate-500 max-w-2xl">
            We understand that plans change. Our cancellation policy is designed to be fair to both customers and service providers while ensuring transparency in the process.
          </p>
          <div className="flex items-center gap-4 mt-4">
            <Badge variant="outline" className="text-xs text-slate-500 border-slate-200">
              <Clock className="size-3 mr-1" />
              Last Updated: February 15, 2025
            </Badge>
            <Badge className="bg-[#FFD54F]/10 text-[#0A1F44] hover:bg-[#FFD54F]/10 text-xs">
              <Zap className="size-3 mr-1" />
              Free Cancellation Within 2 Hours
            </Badge>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 space-y-6">
        {/* Quick Overview */}
        <div className="grid sm:grid-cols-4 gap-3">
          <Card className="bg-white rounded-xl">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center size-10 rounded-full bg-green-50 mx-auto mb-2">
                <CheckCircle2 className="size-5 text-green-600" />
              </div>
              <p className="text-sm font-bold text-slate-900">2 Hours</p>
              <p className="text-xs text-slate-500">Free cancellation</p>
            </CardContent>
          </Card>
          <Card className="bg-white rounded-xl">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center size-10 rounded-full bg-amber-50 mx-auto mb-2">
                <Clock className="size-5 text-amber-600" />
              </div>
              <p className="text-sm font-bold text-slate-900">₹50</p>
              <p className="text-xs text-slate-500">Flat fee (2-24 hrs)</p>
            </CardContent>
          </Card>
          <Card className="bg-white rounded-xl">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center size-10 rounded-full bg-orange-50 mx-auto mb-2">
                <AlertTriangle className="size-5 text-orange-600" />
              </div>
              <p className="text-sm font-bold text-slate-900">25-50%</p>
              <p className="text-xs text-slate-500">Same-day fee</p>
            </CardContent>
          </Card>
          <Card className="bg-white rounded-xl">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center size-10 rounded-full bg-red-50 mx-auto mb-2">
                <XCircle className="size-5 text-red-600" />
              </div>
              <p className="text-sm font-bold text-slate-900">100%</p>
              <p className="text-xs text-slate-500">No-show charge</p>
            </CardContent>
          </Card>
        </div>

        {/* Step-by-step Cancellation Process */}
        <Card className="bg-white rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <ArrowRight className="size-5 text-[#0A1F44]" />
              Step-by-Step Cancellation Process
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-0">
              {cancellationSteps.map((item, index) => {
                const Icon = item.icon
                return (
                  <div key={item.step} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="flex items-center justify-center size-10 rounded-full bg-[#0A1F44] text-white shrink-0">
                        <Icon className="size-5" />
                      </div>
                      {index < cancellationSteps.length - 1 && (
                        <div className="w-0.5 h-12 bg-slate-200" />
                      )}
                    </div>
                    <div className="pb-6">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h4 className="text-sm font-semibold text-slate-900">Step {item.step}: {item.title}</h4>
                      </div>
                      <p className="text-xs text-slate-500">{item.desc}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Cancellation Fee Table */}
        <Card className="bg-white rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <IndianRupee className="size-5 text-[#0A1F44]" />
              Cancellation Fee Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 mb-4">
              Cancellation fees are calculated based on the time remaining before the scheduled service. The earlier you cancel, the lower the fee.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-2 px-3 font-semibold text-slate-900">Timeframe</th>
                    <th className="text-left py-2 px-3 font-semibold text-slate-900">Before Service</th>
                    <th className="text-left py-2 px-3 font-semibold text-slate-900">Fee</th>
                    <th className="text-left py-2 px-3 font-semibold text-slate-900">Impact</th>
                  </tr>
                </thead>
                <tbody className="text-slate-600">
                  {cancellationFeeTable.map((row) => (
                    <tr key={row.timeframe} className="border-b border-slate-100">
                      <td className="py-2.5 px-3 text-xs">{row.timeframe}</td>
                      <td className="py-2.5 px-3 text-xs">{row.beforeService}</td>
                      <td className="py-2.5 px-3"><Badge className={`${row.badgeColor} hover:${row.badgeColor} text-xs`}>{row.fee}</Badge></td>
                      <td className="py-2.5 px-3 text-xs">{row.feePercent} of booking value</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="rounded-lg bg-[#FFD54F]/10 border border-[#FFD54F]/20 p-4 mt-4">
              <div className="flex items-center gap-2 mb-1">
                <Info className="size-4 text-[#0A1F44]" />
                <span className="text-sm font-semibold text-blue-900">Example</span>
              </div>
              <p className="text-xs text-[#0A1F44]">
                If you booked a plumber service for ₹399 and cancel 4 hours before the scheduled time, the cancellation fee would be ₹100 (25%). You would receive a refund of ₹299.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Free Cancellation Window */}
        <Card className="bg-white rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <CheckCircle2 className="size-5 text-green-600" />
              Free Cancellation Window
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-600 leading-relaxed">
              We offer a generous free cancellation window because we understand that circumstances can change quickly. The following bookings qualify for free cancellation:
            </p>

            <div className="grid sm:grid-cols-2 gap-3">
              <div className="rounded-lg border border-green-200 bg-green-50/50 p-4">
                <h4 className="text-sm font-semibold text-green-800 mb-2">Automatic Free Cancellation</h4>
                <ul className="space-y-1.5 text-xs text-green-700">
                  <li className="flex items-start gap-2"><CheckCircle2 className="size-3 text-green-500 mt-0.5 shrink-0" /> Any booking cancelled within 2 hours of placing the order</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="size-3 text-green-500 mt-0.5 shrink-0" /> Bookings where the provider has not accepted the request yet</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="size-3 text-green-500 mt-0.5 shrink-0" /> Bookings cancelled by the service provider</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="size-3 text-green-500 mt-0.5 shrink-0" /> Bookings where service cannot be provided due to provider unavailability</li>
                </ul>
              </div>
              <div className="rounded-lg border border-[#FFD54F]/20 bg-[#FFD54F]/10/50 p-4">
                <h4 className="text-sm font-semibold text-blue-800 mb-2">Special Free Cancellation Cases</h4>
                <ul className="space-y-1.5 text-xs text-[#0A1F44]">
                  <li className="flex items-start gap-2"><CheckCircle2 className="size-3 text-[#FFD54F]/800 mt-0.5 shrink-0" /> Service provider is running more than 30 minutes late</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="size-3 text-[#FFD54F]/800 mt-0.5 shrink-0" /> Force majeure events (natural disasters, strikes, etc.)</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="size-3 text-[#FFD54F]/800 mt-0.5 shrink-0" /> Government-mandated restrictions or lockdowns</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="size-3 text-[#FFD54F]/800 mt-0.5 shrink-0" /> Technical errors on the platform leading to duplicate bookings</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Provider Cancellation */}
        <Card className="bg-white rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <UserX className="size-5 text-[#0A1F44]" />
              When Service Providers Cancel
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-600 leading-relaxed">
              Service providers may need to cancel bookings in rare circumstances. Here&apos;s what happens when they do:
            </p>

            <div className="space-y-3">
              <div className="rounded-lg border border-slate-200 p-4">
                <h4 className="text-sm font-semibold text-slate-900 mb-2">Provider Cancellation Policy</h4>
                <ul className="space-y-1.5 text-sm text-slate-600">
                  <li className="flex items-start gap-2"><CheckCircle2 className="size-4 text-[#0A1F44] mt-0.5 shrink-0" /> <span><strong>Full refund:</strong> You receive a 100% refund with no cancellation fee</span></li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="size-4 text-[#0A1F44] mt-0.5 shrink-0" /> <span><strong>Wallet credit:</strong> ₹50 BookMyService wallet credit as compensation</span></li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="size-4 text-[#0A1F44] mt-0.5 shrink-0" /> <span><strong>Priority rebooking:</strong> First access to the next available provider for the same service</span></li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="size-4 text-[#0A1F44] mt-0.5 shrink-0" /> <span><strong>Provider penalty:</strong> Provider receives a penalty deduction and lower visibility in search results</span></li>
                </ul>
              </div>

              <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-4">
                <h4 className="text-sm font-semibold text-amber-800 mb-2">Provider Cancellation Limits</h4>
                <p className="text-xs text-amber-700">
                  Service providers who cancel more than 3 bookings in a 30-day period face account suspension. Repeat offenders may have their accounts permanently deactivated.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* No-Show Policy */}
        <Card className="bg-white rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <AlertCircle className="size-5 text-red-600" />
              No-Show Policy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-red-50 border border-red-200 p-4">
              <p className="text-sm text-red-700">
                A &quot;no-show&quot; occurs when you are unavailable at the service location at the scheduled time and have not cancelled the booking in advance.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div className="rounded-lg border border-slate-200 p-4">
                <h4 className="text-sm font-semibold text-slate-900 mb-2">Customer No-Show</h4>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  <li className="flex items-start gap-2"><AlertTriangle className="size-3 text-red-500 mt-0.5 shrink-0" /> 100% of the booking amount is charged</li>
                  <li className="flex items-start gap-2"><AlertTriangle className="size-3 text-red-500 mt-0.5 shrink-0" /> Provider receives compensation for time and travel</li>
                  <li className="flex items-start gap-2"><AlertTriangle className="size-3 text-red-500 mt-0.5 shrink-0" /> No refund is applicable</li>
                  <li className="flex items-start gap-2"><AlertTriangle className="size-3 text-red-500 mt-0.5 shrink-0" /> Repeated no-shows may result in account restrictions</li>
                </ul>
              </div>
              <div className="rounded-lg border border-slate-200 p-4">
                <h4 className="text-sm font-semibold text-slate-900 mb-2">Provider No-Show</h4>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  <li className="flex items-start gap-2"><CheckCircle2 className="size-3 text-green-500 mt-0.5 shrink-0" /> 100% refund to the customer</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="size-3 text-green-500 mt-0.5 shrink-0" /> ₹100 wallet credit as compensation</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="size-3 text-green-500 mt-0.5 shrink-0" /> Priority rebooking for the same service</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="size-3 text-green-500 mt-0.5 shrink-0" /> Provider faces account suspension risk</li>
                </ul>
              </div>
            </div>

            <div className="rounded-lg bg-slate-50 border border-slate-200 p-4">
              <p className="text-xs text-slate-600">
                <strong>Grace Period:</strong> Both customers and providers have a 15-minute grace period. If a provider is running late, they must update the ETA through the app. Cancellations within the grace period are handled case-by-case.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Force Majeure */}
        <Card className="bg-white rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <ShieldAlert className="size-5 text-[#0A1F44]" />
              Force Majeure
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-600 leading-relaxed">
              In the event of circumstances beyond reasonable control (&quot;Force Majeure&quot;), the standard cancellation fees are waived:
            </p>

            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { event: 'Natural Disasters', desc: 'Earthquakes, floods, cyclones, severe weather warnings' },
                { event: 'Government Actions', desc: 'Lockdowns, curfews, restrictions on movement' },
                { event: 'Civil Unrest', desc: 'Strikes, protests, riots, communal disturbances' },
                { event: 'Public Health Emergencies', desc: 'Pandemics, epidemics, health advisories' },
                { event: 'Infrastructure Failures', desc: 'Power outages, internet blackouts, telecom failures' },
                { event: 'Accidents', desc: 'Fire, explosion, major traffic incidents' },
              ].map((item) => (
                <div key={item.event} className="rounded-lg border border-slate-200 p-3">
                  <h4 className="text-sm font-semibold text-slate-900">{item.event}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                </div>
              ))}
            </div>

            <p className="text-xs text-slate-400">
              Force majeure claims are verified by our team. If verified, full refunds are issued without cancellation fees within 24 hours.
            </p>
          </CardContent>
        </Card>

        {/* Important Notes */}
        <Card className="bg-white rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <Info className="size-5 text-[#0A1F44]" />
              Important Notes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              'Cancellation fees are calculated based on the scheduled service time, not the booking placement time (except for the 2-hour free window).',
              'For bookings with multiple services, cancellation applies to the entire booking. Individual services cannot be partially cancelled.',
              'AMC (Annual Maintenance Contract) bookings follow a separate cancellation policy as outlined in the AMC agreement.',
              'Emergency cancellations (medical emergencies, family emergencies) are reviewed case-by-case with supporting documentation.',
              'Cancellation fees are non-refundable once charged, even if you rebook the same service.',
              'The cancellation policy may differ for premium or specialized services. Always check the service-specific terms before booking.',
              'If you need to reschedule instead of cancelling, use the Reschedule option to avoid cancellation fees.',
            ].map((note, i) => (
              <div key={i} className="flex items-start gap-2">
                <CheckCircle2 className="size-4 text-[#0A1F44] mt-0.5 shrink-0" />
                <p className="text-sm text-slate-600">{note}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Contact */}
        <Card className="bg-white rounded-xl">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Need to Cancel a Booking?</h3>
            <p className="text-sm text-slate-500 mb-4">Cancel through the app for the fastest processing, or contact our support team for assistance.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button className="gap-2 bg-[#0A1F44] hover:bg-[#0A1F44]/90 text-white rounded-xl">
                <XCircle className="size-4" />
                Cancel a Booking
              </Button>
              <Button variant="outline" className="gap-2 border-slate-200 rounded-xl">
                <Phone className="size-4" />
                Call Support
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
