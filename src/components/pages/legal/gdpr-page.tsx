'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import {
  Shield,
  Eye,
  Pencil,
  Trash2,
  Download,
  ArrowRightLeft,
  UserCheck,
  Lock,
  Globe,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Send,
  Mail,
  Phone,
  MapPin,
  Building2,
  Database,
  Server,
  Info,
  Scale,
  Fingerprint,
  ClipboardList,
} from 'lucide-react'

const dataProtectionPrinciples = [
  {
    principle: 'Lawfulness, Fairness & Transparency',
    desc: 'We process your data lawfully, fairly, and in a transparent manner. You are always informed about how and why your data is being used.',
    icon: Scale,
    color: 'text-[#1D63FF]',
    bg: 'bg-blue-50',
  },
  {
    principle: 'Purpose Limitation',
    desc: 'Your data is collected for specified, explicit, and legitimate purposes. We do not process data in a manner incompatible with those purposes.',
    icon: Target,
    color: 'text-green-600',
    bg: 'bg-green-50',
  },
  {
    principle: 'Data Minimisation',
    desc: 'We collect only the data that is necessary for the purposes for which it is processed. We do not collect excessive or irrelevant information.',
    icon: Database,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
  {
    principle: 'Accuracy',
    desc: 'We ensure that personal data is accurate and, where necessary, kept up to date. We take reasonable steps to ensure inaccurate data is rectified or erased.',
    icon: Pencil,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
  },
  {
    principle: 'Storage Limitation',
    desc: 'Personal data is kept only for as long as necessary for the purposes for which it was collected. We have defined retention periods for all data categories.',
    icon: Clock,
    color: 'text-orange-600',
    bg: 'bg-orange-50',
  },
  {
    principle: 'Integrity & Confidentiality',
    desc: 'We process data in a manner that ensures appropriate security, including protection against unauthorised or unlawful processing and accidental loss.',
    icon: Lock,
    color: 'text-red-600',
    bg: 'bg-red-50',
  },
]

const userRights = [
  {
    right: 'Right of Access',
    desc: 'You have the right to obtain confirmation of whether or not personal data concerning you is being processed, and access to that data along with supplementary information.',
    icon: Eye,
    howTo: 'Submit a data access request through your account settings or email our DPO.',
    timeframe: '30 days',
  },
  {
    right: 'Right to Rectification',
    desc: 'You have the right to have any inaccurate personal data corrected, and to have incomplete personal data completed.',
    icon: Pencil,
    howTo: 'Update your profile directly in account settings, or contact us for corrections.',
    timeframe: '30 days',
  },
  {
    right: 'Right to Erasure',
    desc: 'You have the right to request the deletion of your personal data when it is no longer necessary for the purpose for which it was collected, or when you withdraw consent.',
    icon: Trash2,
    howTo: 'Request account deletion through settings. Some data may be retained for legal obligations.',
    timeframe: '30 days',
  },
  {
    right: 'Right to Data Portability',
    desc: 'You have the right to receive your personal data in a structured, commonly used, and machine-readable format, and to transmit that data to another controller.',
    icon: Download,
    howTo: 'Request data export through account settings. Available in JSON and CSV formats.',
    timeframe: '30 days',
  },
  {
    right: 'Right to Restrict Processing',
    desc: 'You have the right to request restriction of processing of your personal data in certain circumstances, such as when you contest the accuracy of the data.',
    icon: Shield,
    howTo: 'Contact our DPO with specific details about which processing you wish to restrict.',
    timeframe: '30 days',
  },
  {
    right: 'Right to Object',
    desc: 'You have the right to object to the processing of your personal data for direct marketing purposes, or when processing is based on legitimate interests.',
    icon: UserCheck,
    howTo: 'Update marketing preferences in settings or email privacy@bookmyservice.in.',
    timeframe: 'Immediate for marketing; 30 days for other purposes',
  },
]

const processingActivities = [
  { activity: 'Account Registration', purpose: 'Identity verification and account management', legalBasis: 'Contract', dataCategories: 'Name, email, phone, address', retention: 'Account lifetime + 1 year' },
  { activity: 'Service Booking', purpose: 'Facilitating service delivery', legalBasis: 'Contract', dataCategories: 'Booking details, address, preferences', retention: '3 years' },
  { activity: 'Payment Processing', purpose: 'Transaction processing and invoicing', legalBasis: 'Contract + Legal obligation', dataCategories: 'Payment method, transaction history', retention: '7 years (tax law)' },
  { activity: 'Customer Support', purpose: 'Resolving queries and complaints', legalBasis: 'Legitimate interest', dataCategories: 'Communication records, complaint details', retention: '2 years after resolution' },
  { activity: 'Marketing Communications', purpose: 'Sending promotional offers and updates', legalBasis: 'Consent', dataCategories: 'Email, phone, preferences', retention: 'Until consent withdrawn' },
  { activity: 'Platform Analytics', purpose: 'Improving services and user experience', legalBasis: 'Legitimate interest', dataCategories: 'Usage data, device info (anonymised)', retention: '2 years (anonymised)' },
  { activity: 'Fraud Prevention', purpose: 'Detecting and preventing fraudulent activities', legalBasis: 'Legitimate interest', dataCategories: 'Transaction patterns, device fingerprint', retention: '5 years' },
  { activity: 'Provider Verification', purpose: 'Background checks and quality assurance', legalBasis: 'Legal obligation + Contract', dataCategories: 'ID documents, certifications, criminal records', retention: 'Provider lifetime + 3 years' },
]

const crossBorderTransfers = [
  { destination: 'United States', purpose: 'Cloud infrastructure (AWS)', safeguard: 'Standard Contractual Clauses (SCCs)', dataTypes: 'Server logs, encrypted backups' },
  { destination: 'Singapore', purpose: 'CDN and performance optimization', safeguard: 'APEC CBPR certification', dataTypes: 'Cached content, static assets' },
  { destination: 'Ireland (EU)', purpose: 'Analytics processing (Mixpanel EU)', safeguard: 'EU adequacy decision', dataTypes: 'Anonymised analytics data' },
]

export function GDPRPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    rightType: '',
    details: '',
  })
  const [formSubmitted, setFormSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFormSubmitted(true)
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-12">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center justify-center size-10 rounded-lg bg-[#1D63FF]">
              <Shield className="size-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Data Protection & GDPR</h1>
              <p className="text-slate-500 text-sm">General Data Protection Regulation Compliance</p>
            </div>
          </div>
          <p className="text-slate-500 max-w-2xl mt-2">
            BookMyService is committed to protecting your personal data in compliance with the EU General Data Protection Regulation (GDPR), India&apos;s Information Technology Act, and other applicable data protection laws.
          </p>
          <div className="flex items-center gap-4 mt-4">
            <Badge variant="outline" className="text-xs text-slate-500 border-slate-200">
              <Clock className="size-3 mr-1" />
              Last Updated: February 15, 2025
            </Badge>
            <Badge className="bg-[#1D63FF]/10 text-[#0B3D91] hover:bg-[#1D63FF]/10 text-xs">
              <CheckCircle2 className="size-3 mr-1" />
              GDPR Compliant
            </Badge>
            <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-xs">
              <Shield className="size-3 mr-1" />
              IT Act 2000 Compliant
            </Badge>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 space-y-6">
        {/* DPO Contact Card */}
        <Card className="bg-gradient-to-r from-[#1D63FF] to-[#0B3D91] rounded-xl text-white">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="flex items-center justify-center size-14 rounded-full bg-white/20 shrink-0">
                <Building2 className="size-7 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-1">Data Protection Officer</h3>
                <p className="text-blue-100 text-sm mb-3">For all data protection queries, rights requests, and complaints</p>
                <div className="grid sm:grid-cols-3 gap-3">
                  <div className="flex items-center gap-2 text-blue-100 text-sm">
                    <Mail className="size-4" />
                    dpo@bookmyservice.in
                  </div>
                  <div className="flex items-center gap-2 text-blue-100 text-sm">
                    <Phone className="size-4" />
                    +91-1800-123-4567
                  </div>
                  <div className="flex items-center gap-2 text-blue-100 text-sm">
                    <MapPin className="size-4" />
                    Noida, Uttar Pradesh, India
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Protection Principles */}
        <Card className="bg-white rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <Fingerprint className="size-5 text-[#1D63FF]" />
              Data Protection Principles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 mb-4">
              We adhere to the following principles as outlined in Article 5 of the GDPR and Section 43A of the Indian IT Act:
            </p>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {dataProtectionPrinciples.map((item) => {
                const Icon = item.icon
                return (
                  <div key={item.principle} className="rounded-lg border border-slate-200 p-4">
                    <div className={`flex items-center justify-center size-10 rounded-lg ${item.bg} mb-2`}>
                      <Icon className={`size-5 ${item.color}`} />
                    </div>
                    <h4 className="text-sm font-semibold text-slate-900 mb-1">{item.principle}</h4>
                    <p className="text-xs text-slate-500">{item.desc}</p>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Your Rights */}
        <Card className="bg-white rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <Scale className="size-5 text-[#1D63FF]" />
              Your Data Protection Rights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-600">
              Under GDPR Articles 15-22 and the IT Act 2000, you have the following rights regarding your personal data:
            </p>

            <div className="space-y-3">
              {userRights.map((item) => {
                const Icon = item.icon
                return (
                  <div key={item.right} className="rounded-lg border border-slate-200 p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center size-9 rounded-lg bg-blue-50 shrink-0">
                        <Icon className="size-5 text-[#1D63FF]" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-semibold text-slate-900">{item.right}</h4>
                          <Badge variant="outline" className="text-xs text-slate-500 border-slate-200">
                            <Clock className="size-2.5 mr-1" />
                            {item.timeframe}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-600 mb-2">{item.desc}</p>
                        <p className="text-xs text-slate-400"><span className="font-medium text-slate-500">How to exercise:</span> {item.howTo}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Data Processing Activities */}
        <Card className="bg-white rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <ClipboardList className="size-5 text-[#1D63FF]" />
              Data Processing Activities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 mb-4">
              As required under GDPR Article 30, we maintain a record of our data processing activities:
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-2 px-3 font-semibold text-slate-900 whitespace-nowrap">Activity</th>
                    <th className="text-left py-2 px-3 font-semibold text-slate-900">Purpose</th>
                    <th className="text-left py-2 px-3 font-semibold text-slate-900 whitespace-nowrap">Legal Basis</th>
                    <th className="text-left py-2 px-3 font-semibold text-slate-900 whitespace-nowrap">Data Categories</th>
                    <th className="text-left py-2 px-3 font-semibold text-slate-900 whitespace-nowrap">Retention</th>
                  </tr>
                </thead>
                <tbody className="text-slate-600">
                  {processingActivities.map((item) => (
                    <tr key={item.activity} className="border-b border-slate-100">
                      <td className="py-2.5 px-3 text-xs font-medium text-slate-900 whitespace-nowrap">{item.activity}</td>
                      <td className="py-2.5 px-3 text-xs">{item.purpose}</td>
                      <td className="py-2.5 px-3"><Badge variant="outline" className="text-xs border-slate-200 whitespace-nowrap">{item.legalBasis}</Badge></td>
                      <td className="py-2.5 px-3 text-xs">{item.dataCategories}</td>
                      <td className="py-2.5 px-3 text-xs whitespace-nowrap">{item.retention}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 mt-4">
              <div className="flex items-center gap-2 mb-1">
                <Info className="size-4 text-[#1D63FF]" />
                <span className="text-sm font-semibold text-blue-900">Legal Basis Definitions</span>
              </div>
              <div className="grid sm:grid-cols-2 gap-2 text-xs text-[#0B3D91]">
                <p><strong>Contract:</strong> Processing necessary to perform our contract with you</p>
                <p><strong>Consent:</strong> Processing based on your explicit opt-in consent</p>
                <p><strong>Legal obligation:</strong> Processing required by law (e.g., tax records)</p>
                <p><strong>Legitimate interest:</strong> Processing for our legitimate business interests, balanced against your rights</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cross-Border Data Transfers */}
        <Card className="bg-white rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <Globe className="size-5 text-[#1D63FF]" />
              Cross-Border Data Transfers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-600 leading-relaxed">
              BookMyService is headquartered in India. When we transfer personal data outside India, we ensure appropriate safeguards are in place as required under GDPR Chapter V and the IT Act 2011 SPDI Rules.
            </p>

            <div className="grid sm:grid-cols-3 gap-3">
              {crossBorderTransfers.map((item) => (
                <div key={item.destination} className="rounded-lg border border-slate-200 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="size-4 text-[#1D63FF]" />
                    <h4 className="text-sm font-semibold text-slate-900">{item.destination}</h4>
                  </div>
                  <div className="space-y-1.5 text-xs text-slate-600">
                    <p><span className="font-medium text-slate-700">Purpose:</span> {item.purpose}</p>
                    <p><span className="font-medium text-slate-700">Safeguard:</span> <Badge variant="outline" className="text-xs border-green-200 bg-green-50 text-green-700">{item.safeguard}</Badge></p>
                    <p><span className="font-medium text-slate-700">Data:</span> {item.dataTypes}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-lg border border-slate-200 p-4">
              <h4 className="text-sm font-semibold text-slate-900 mb-2">Transfer Safeguards</h4>
              <ul className="space-y-1.5 text-xs text-slate-600">
                <li className="flex items-start gap-2"><CheckCircle2 className="size-3 text-green-500 mt-0.5 shrink-0" /> Standard Contractual Clauses (SCCs) approved by the European Commission</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="size-3 text-green-500 mt-0.5 shrink-0" /> Data Processing Agreements (DPAs) with all sub-processors</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="size-3 text-green-500 mt-0.5 shrink-0" /> Encryption in transit (TLS 1.3) and at rest (AES-256)</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="size-3 text-green-500 mt-0.5 shrink-0" /> Regular audits of data transfer mechanisms and sub-processor compliance</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="size-3 text-green-500 mt-0.5 shrink-0" /> Transfer Impact Assessments (TIAs) for high-risk transfers</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Rights Request Form */}
        <Card className="bg-white rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <FileText className="size-5 text-[#1D63FF]" />
              Submit a Rights Request
            </CardTitle>
          </CardHeader>
          <CardContent>
            {formSubmitted ? (
              <div className="rounded-lg bg-green-50 border border-green-200 p-6 text-center">
                <CheckCircle2 className="size-10 text-green-600 mx-auto mb-3" />
                <h4 className="text-lg font-semibold text-green-800 mb-1">Request Submitted Successfully</h4>
                <p className="text-sm text-green-700 mb-4">
                  Your data rights request has been received. Our Data Protection Officer will review it and respond within 30 days as required by GDPR.
                </p>
                <p className="text-xs text-green-600 mb-4">Reference ID: BMS-DRR-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
                <Button
                  onClick={() => {
                    setFormSubmitted(false)
                    setFormData({ fullName: '', email: '', rightType: '', details: '' })
                  }}
                  variant="outline"
                  className="border-green-200 text-green-700 hover:bg-green-100 rounded-xl"
                >
                  Submit Another Request
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <p className="text-sm text-slate-600 mb-2">
                  Use this form to exercise any of your data protection rights. We will verify your identity before processing the request.
                </p>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-900">Full Name *</label>
                    <Input
                      required
                      placeholder="Enter your full name"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="rounded-xl border-slate-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-900">Email Address *</label>
                    <Input
                      required
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="rounded-xl border-slate-200"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-900">Type of Request *</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { value: 'access', label: 'Right of Access', icon: Eye },
                      { value: 'rectification', label: 'Right to Rectification', icon: Pencil },
                      { value: 'erasure', label: 'Right to Erasure', icon: Trash2 },
                      { value: 'portability', label: 'Data Portability', icon: Download },
                      { value: 'restriction', label: 'Restrict Processing', icon: Shield },
                      { value: 'objection', label: 'Right to Object', icon: UserCheck },
                    ].map((item) => {
                      const Icon = item.icon
                      return (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, rightType: item.value })}
                          className={`flex items-center gap-2 p-3 rounded-lg border text-left text-xs transition-colors ${
                            formData.rightType === item.value
                              ? 'border-[#1D63FF] bg-blue-50 text-[#0B3D91]'
                              : 'border-slate-200 text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          <Icon className="size-4 shrink-0" />
                          <span className="font-medium">{item.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-900">Additional Details</label>
                  <textarea
                    placeholder="Please provide any additional information that may help us process your request..."
                    value={formData.details}
                    onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                    className="w-full min-h-[100px] rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1D63FF] focus:border-transparent resize-none"
                  />
                </div>

                <div className="rounded-lg bg-slate-50 border border-slate-200 p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="size-4 text-slate-400 mt-0.5 shrink-0" />
                    <p className="text-xs text-slate-500">
                      By submitting this form, you confirm that you are the data subject or are authorised to act on their behalf. We may need to verify your identity before processing the request. Response time is within 30 days as per GDPR requirements.
                    </p>
                  </div>
                </div>

                <Button type="submit" className="gap-2 bg-[#1D63FF] hover:bg-[#0B3D91] rounded-xl w-full sm:w-auto">
                  <Send className="size-4" />
                  Submit Request
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Supervisory Authority */}
        <Card className="bg-white rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <Building2 className="size-5 text-[#1D63FF]" />
              Supervisory Authority
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-600">
              Under GDPR Article 77, you have the right to lodge a complaint with a supervisory authority if you believe that the processing of your personal data infringes the regulation.
            </p>

            <div className="grid sm:grid-cols-2 gap-3">
              <div className="rounded-lg border border-slate-200 p-4">
                <h4 className="text-sm font-semibold text-slate-900 mb-2">Indian Authorities</h4>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  <li><strong>Adjudicating Officer:</strong> Ministry of Electronics & IT, Government of India</li>
                  <li><strong>Cyber Appellate Tribunal:</strong> For appeals under IT Act 2000</li>
                  <li><strong>Consumer Forum:</strong> Under Consumer Protection Act 2019</li>
                </ul>
              </div>
              <div className="rounded-lg border border-slate-200 p-4">
                <h4 className="text-sm font-semibold text-slate-900 mb-2">EU Authorities (for EU residents)</h4>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  <li><strong>Lead SA:</strong> Data Protection Commission, Ireland</li>
                  <li><strong>Local SA:</strong> Your national data protection authority</li>
                  <li><strong>EDPB:</strong> European Data Protection Board</li>
                </ul>
              </div>
            </div>

            <p className="text-xs text-slate-400">
              We encourage you to contact our DPO first, as most issues can be resolved quickly through our internal process.
            </p>
          </CardContent>
        </Card>

        {/* Data Retention */}
        <Card className="bg-white rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <Server className="size-5 text-[#1D63FF]" />
              Data Retention Periods
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { category: 'Account Data', period: 'Account lifetime + 1 year', color: 'bg-blue-50 text-[#0B3D91]' },
                { category: 'Booking Records', period: '3 years', color: 'bg-green-50 text-green-700' },
                { category: 'Payment Records', period: '7 years (tax law)', color: 'bg-amber-50 text-amber-700' },
                { category: 'Support Tickets', period: '2 years after resolution', color: 'bg-purple-50 text-purple-700' },
                { category: 'Marketing Data', period: 'Until consent withdrawn', color: 'bg-pink-50 text-pink-700' },
                { category: 'Analytics Data', period: '2 years (anonymised)', color: 'bg-indigo-50 text-indigo-700' },
                { category: 'Fraud Data', period: '5 years', color: 'bg-red-50 text-red-700' },
                { category: 'Provider KYC', period: 'Provider lifetime + 3 years', color: 'bg-teal-50 text-teal-700' },
              ].map((item) => (
                <div key={item.category} className="rounded-lg border border-slate-200 p-3">
                  <Badge className={`${item.color} text-xs mb-1`}>{item.category}</Badge>
                  <p className="text-sm font-semibold text-slate-900">{item.period}</p>
                </div>
              ))}
            </div>

            <p className="text-xs text-slate-400 mt-4">
              After the retention period expires, data is either permanently deleted or anonymised in accordance with our data disposal procedures. Anonymised data may be retained indefinitely for statistical purposes.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Target icon is used in the principles but isn't imported from lucide
// Adding a local Target icon component
function Target({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  )
}
