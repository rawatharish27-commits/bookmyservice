'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Search,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  CreditCard,
  CalendarCheck,
  Wrench,
  Users,
  MessageCircle,
  Phone,
  Mail,
} from 'lucide-react'

type FAQCategory = 'General' | 'Booking' | 'Payment' | 'Services' | 'Provider'

interface FAQ {
  question: string
  answer: string
  category: FAQCategory
}

const categories: { key: FAQCategory; icon: React.ElementType; color: string; bg: string }[] = [
  { key: 'General', icon: HelpCircle, color: 'text-[#1D63FF]', bg: 'bg-blue-50' },
  { key: 'Booking', icon: CalendarCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { key: 'Payment', icon: CreditCard, color: 'text-purple-600', bg: 'bg-purple-50' },
  { key: 'Services', icon: Wrench, color: 'text-orange-600', bg: 'bg-orange-50' },
  { key: 'Provider', icon: Users, color: 'text-rose-600', bg: 'bg-rose-50' },
]

const faqs: FAQ[] = [
  // General
  { question: 'What is BookMyService?', answer: 'BookMyService is India\'s leading home services platform that connects customers with verified and trained service professionals. We offer 200+ services across categories like cleaning, plumbing, electrical, painting, appliance repair, beauty, and more in 120+ cities across India.', category: 'General' },
  { question: 'Which cities do you operate in?', answer: 'We currently operate in 120+ cities across India including Delhi, Mumbai, Bengaluru, Hyderabad, Chennai, Pune, Kolkata, Ahmedabad, Jaipur, Lucknow, and many more tier-2 and tier-3 cities. We are expanding to new cities every month.', category: 'General' },
  { question: 'Are your service providers verified?', answer: 'Yes, all our service providers undergo a rigorous verification process including identity verification, address verification, police background check, and skill assessment. Only providers who pass all checks are onboarded onto our platform.', category: 'General' },
  { question: 'What are your customer support hours?', answer: 'Our customer support team is available 24/7. You can reach us via phone at 1800-123-4567 (toll-free), email at support@bookmyservice.in, or through the live chat feature in our app.', category: 'General' },
  { question: 'How do I download the BookMyService app?', answer: 'You can download our app from the Google Play Store for Android devices or the Apple App Store for iOS devices. Simply search for "BookMyService" and install the app for free.', category: 'General' },

  // Booking
  { question: 'How do I book a service?', answer: 'You can book a service in 3 easy steps: 1) Search or browse for the service you need, 2) Choose your preferred date, time, and service provider, 3) Confirm your booking. You\'ll receive a confirmation via SMS and email instantly.', category: 'Booking' },
  { question: 'Can I reschedule or cancel my booking?', answer: 'Yes, you can reschedule or cancel your booking up to 2 hours before the scheduled time for free. Cancellations within 2 hours may attract a nominal fee of ₹50. To reschedule, go to "My Bookings" in your account.', category: 'Booking' },
  { question: 'What if the service provider doesn\'t show up?', answer: 'If a provider doesn\'t show up, we\'ll arrange an alternative provider within 30 minutes at no extra cost. You\'ll also receive a ₹100 credit in your BookMyService wallet as compensation for the inconvenience.', category: 'Booking' },
  { question: 'Can I book services for someone else?', answer: 'Yes, you can book services for family members or friends. Simply add their address and contact details during the booking process. The service provider will contact them before arriving.', category: 'Booking' },
  { question: 'How far in advance can I book a service?', answer: 'You can book services up to 30 days in advance. For urgent needs, we also offer same-day booking with service providers available within 60 minutes in most cities.', category: 'Booking' },

  // Payment
  { question: 'What payment methods do you accept?', answer: 'We accept UPI (Google Pay, PhonePe, Paytm), credit/debit cards, net banking, BookMyService wallet, and cash. All online payments are secured with 256-bit SSL encryption.', category: 'Payment' },
  { question: 'Is it safe to pay online on BookMyService?', answer: 'Absolutely. All online transactions are processed through secure payment gateways with 256-bit SSL encryption. We are PCI DSS compliant and never store your complete card details on our servers.', category: 'Payment' },
  { question: 'What is the BookMyService wallet?', answer: 'The BookMyService wallet is a prepaid balance you can use to pay for services. Add money via UPI or card and enjoy 2% cashback on every wallet transaction. Wallet balance never expires.', category: 'Payment' },
  { question: 'How do refunds work?', answer: 'Refunds for cancelled bookings are processed within 5-7 business days to your original payment method. Wallet refunds are instant. For service quality issues, we offer a 100% refund guarantee within 48 hours of service completion.', category: 'Payment' },
  { question: 'Do you offer EMI options?', answer: 'Our service prices range from ₹99 to ₹499, making them very affordable. No-cost EMI is not required for our price range.', category: 'Payment' },

  // Services
  { question: 'What services do you offer?', answer: 'We offer services across categories including: Air Conditioner, Refrigerator, Washing Machine, Kitchen Appliances, TV Repair, Water Purifier, Geyser, Plumber, Electrician, Water Tank Cleaning, and Movers and Packers.', category: 'Services' },
  { question: 'Do you provide a warranty on services?', answer: 'Yes, we provide a 30-day warranty on most repair services. If the same issue recurs within 30 days, we\'ll fix it for free. Cleaning services come with a 7-day satisfaction guarantee.', category: 'Services' },
  { question: 'What are AMC plans?', answer: 'Annual Maintenance Contracts (AMC) are yearly subscription plans that cover regular maintenance of your home appliances, plumbing, and electrical systems. Starting at ₹999/year, they include 4 scheduled visits and priority support.', category: 'Services' },
  { question: 'Do you bring their own materials and tools?', answer: 'Yes, our service providers bring all necessary tools and equipment. For services requiring materials (like painting, plumbing repairs), the cost of materials is included in the quoted price or listed separately for your approval before work begins.', category: 'Services' },
  { question: 'How are service prices determined?', answer: 'Service prices are determined based on the type of service, complexity, and your city. Prices are transparent and displayed upfront before booking — no hidden charges. We offer competitive rates with price match guarantee.', category: 'Services' },

  // Provider
  { question: 'How can I become a service provider on BookMyService?', answer: 'To join as a provider, visit our "Become a Provider" page and fill out the registration form. You\'ll need to complete KYC verification, skill assessment, and a brief training programme. The entire onboarding process takes 3-5 days.', category: 'Provider' },
  { question: 'What are the earnings for service providers?', answer: 'Provider earnings vary by service category and city. On average, providers earn ₹25,000-₹60,000 per month. Top performers in metro cities earn upwards of ₹80,000/month. You keep 80% of every booking amount.', category: 'Provider' },
  { question: 'What support do you provide to service providers?', answer: 'We provide training programmes, quality tools and equipment at subsidised rates, insurance coverage, flexible working hours, dedicated support helpline, and regular performance bonuses. We also help with loan facilities for vehicle and equipment purchases.', category: 'Provider' },
  { question: 'Can I work part-time as a provider?', answer: 'Yes, you can choose your own working hours. Many of our providers work part-time while managing other commitments. You can set your availability through the provider app and accept bookings only when you\'re available.', category: 'Provider' },
  { question: 'How do I receive my earnings?', answer: 'Your earnings are transferred directly to your bank account every week. You can also opt for daily payouts. All transactions are tracked in the provider app with detailed earnings breakdowns.', category: 'Provider' },
]

export function FaqPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<FAQCategory | 'All'>('All')
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const filteredFaqs = faqs.filter((faq) => {
    const matchesCategory = activeCategory === 'All' || faq.category === activeCategory
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="bg-[#f8fafc] min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1D63FF] via-[#0B3D91] to-[#0A2E6B] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20 text-center">
          <Badge className="bg-blue-500/30 text-blue-100 border-blue-400/30 mb-4">FAQs</Badge>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto mb-8">
            Find answers to common questions about BookMyService, bookings, payments, and more.
          </p>
          <div className="max-w-xl mx-auto relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
            <Input
              placeholder="Search for questions..."
              className="pl-10 h-12 bg-white/95 text-slate-900 placeholder:text-slate-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Category Tabs */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 -mt-6">
        <div className="flex flex-wrap gap-2 justify-center">
          <Button
            variant={activeCategory === 'All' ? 'default' : 'outline'}
            className={activeCategory === 'All' ? 'bg-[#1D63FF] hover:bg-[#0B3D91] text-white' : ''}
            onClick={() => setActiveCategory('All')}
          >
            All
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat.key}
              variant={activeCategory === cat.key ? 'default' : 'outline'}
              className={activeCategory === cat.key ? 'bg-[#1D63FF] hover:bg-[#0B3D91] text-white' : ''}
              onClick={() => setActiveCategory(cat.key)}
            >
              <cat.icon className="size-4 mr-1.5" />
              {cat.key}
            </Button>
          ))}
        </div>
      </section>

      {/* FAQ List */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {filteredFaqs.length === 0 ? (
          <Card className="shadow-sm border-0">
            <CardContent className="py-12 text-center">
              <HelpCircle className="size-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-slate-900 mb-1">No results found</h3>
              <p className="text-slate-500">Try a different search term or category.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredFaqs.map((faq, idx) => {
              const isOpen = openIndex === idx
              const catInfo = categories.find(c => c.key === faq.category)
              return (
                <Card key={idx} className="shadow-sm border-0">
                  <button
                    className="w-full text-left"
                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                  >
                    <CardContent className="p-4 sm:p-5">
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-lg ${catInfo?.bg || 'bg-blue-50'} flex items-center justify-center shrink-0 mt-0.5`}>
                          {catInfo && <catInfo.icon className={`size-4 ${catInfo.color}`} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-medium text-slate-900 text-sm sm:text-base pr-4">{faq.question}</h3>
                            {isOpen ? (
                              <ChevronUp className="size-5 text-slate-400 shrink-0" />
                            ) : (
                              <ChevronDown className="size-5 text-slate-400 shrink-0" />
                            )}
                          </div>
                          {isOpen && (
                            <p className="text-sm text-slate-600 mt-3 leading-relaxed">{faq.answer}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </button>
                </Card>
              )
            })}
          </div>
        )}
      </section>

      {/* Stats */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-12">
        <div className="grid grid-cols-3 gap-4">
          {[
            { value: '200+', label: 'Questions Answered' },
            { value: '98%', label: 'Found Helpful' },
            { value: '<2 min', label: 'Avg. Read Time' },
          ].map((stat) => (
            <Card key={stat.label} className="shadow-sm border-0 text-center">
              <CardContent className="py-5">
                <p className="text-2xl font-bold text-[#1D63FF]">{stat.value}</p>
                <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Still have questions CTA */}
      <section className="bg-gradient-to-r from-[#1D63FF] to-[#0B3D91] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 text-center">
          <MessageCircle className="size-12 mx-auto mb-4 text-blue-200" />
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">Still Have Questions?</h2>
          <p className="text-blue-100 mb-8 max-w-lg mx-auto">
            Our support team is available 24/7 to help you with any queries. Don&apos;t hesitate to reach out!
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" variant="secondary">
              <MessageCircle className="size-4 mr-2" /> Start Live Chat
            </Button>
            <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
              <Phone className="size-4 mr-2" /> Call 1800-123-4567
            </Button>
            <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
              <Mail className="size-4 mr-2" /> Email Us
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
