import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/contexts/app-context';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  Search,
  CalendarCheck,
  CheckCircle2,
  Star,
  CreditCard,
  Wrench,
  ClipboardList,
  DollarSign,
  UserPlus,
  Briefcase,
  Clock,
  ArrowRight,
  Users,
  Shield,
  Sparkles,
  Handshake,
  ThumbsUp,
} from 'lucide-react';

const clientSteps = [
  {
    step: 1,
    title: 'Create Your Account',
    description: 'Sign up for free with your email and phone number. Verify your account to get started.',
    icon: <UserPlus className="size-6" />,
    gradient: 'from-[#1D63FF] to-[#1D63FF]',
    illustration: '📝',
  },
  {
    step: 2,
    title: 'Search for Services',
    description: 'Browse through categories or use our search to find the service you need. Filter by location, price, and ratings.',
    icon: <Search className="size-6" />,
    gradient: 'from-[#1D63FF] to-[#FFCE32]',
    illustration: '🔍',
  },
  {
    step: 3,
    title: 'Compare Providers',
    description: 'View detailed profiles, read reviews, compare prices, and check availability to find the best match.',
    icon: <Users className="size-6" />,
    gradient: 'from-[#E6B800] to-blue-600',
    illustration: '⚖️',
  },
  {
    step: 4,
    title: 'Book & Schedule',
    description: 'Select your preferred date and time, add any special instructions, and confirm your booking.',
    icon: <CalendarCheck className="size-6" />,
    gradient: 'from-[#1D63FF] to-[#0D3B7A]',
    illustration: '📅',
  },
  {
    step: 5,
    title: 'Make Secure Payment',
    description: 'Pay securely through our platform. Your payment is held in escrow until the service is completed.',
    icon: <CreditCard className="size-6" />,
    gradient: 'from-[#1D63FF] to-blue-600',
    illustration: '💳',
  },
  {
    step: 6,
    title: 'Get Service Done',
    description: 'A verified professional arrives at your location and completes the work as agreed.',
    icon: <CheckCircle2 className="size-6" />,
    gradient: 'from-[#0D3B7A] to-[#0D3B7A]',
    illustration: '✅',
  },
  {
    step: 7,
    title: 'Review & Rate',
    description: 'After completion, rate the service and leave a review to help other users make informed decisions.',
    icon: <Star className="size-6" />,
    gradient: 'from-[#4D8AFF] to-yellow-600',
    illustration: '⭐',
  },
];

const providerSteps = [
  {
    step: 1,
    title: 'Register as Provider',
    description: 'Sign up with a provider account. Fill in your professional details and areas of expertise.',
    icon: <UserPlus className="size-6" />,
    gradient: 'from-[#1D63FF] to-[#1D63FF]',
    illustration: '📝',
  },
  {
    step: 2,
    title: 'Complete KYC Verification',
    description: 'Submit your identity documents for verification. This builds trust with potential customers.',
    icon: <Shield className="size-6" />,
    gradient: 'from-[#1D63FF] to-[#FFCE32]',
    illustration: '🛡️',
  },
  {
    step: 3,
    title: 'List Your Services',
    description: 'Create detailed service listings with pricing, availability, and service areas. Add photos to attract customers.',
    icon: <Briefcase className="size-6" />,
    gradient: 'from-[#E6B800] to-blue-600',
    illustration: '📋',
  },
  {
    step: 4,
    title: 'Set Your Schedule',
    description: 'Define your availability for each day of the week. Manage your calendar to avoid conflicts.',
    icon: <Clock className="size-6" />,
    gradient: 'from-[#1D63FF] to-[#0D3B7A]',
    illustration: '🕐',
  },
  {
    step: 5,
    title: 'Receive Bookings',
    description: 'Get notified of new booking requests. Accept or reject based on your availability and preferences.',
    icon: <ClipboardList className="size-6" />,
    gradient: 'from-[#1D63FF] to-blue-600',
    illustration: '📩',
  },
  {
    step: 6,
    title: 'Complete the Service',
    description: 'Arrive on time, deliver quality work, and mark the service as completed through the platform.',
    icon: <CheckCircle2 className="size-6" />,
    gradient: 'from-[#0D3B7A] to-[#0D3B7A]',
    illustration: '✅',
  },
  {
    step: 7,
    title: 'Get Paid',
    description: 'Receive your earnings directly to your account. Track all payments and earnings through your dashboard.',
    icon: <DollarSign className="size-6" />,
    gradient: 'from-[#4D8AFF] to-[#1D63FF]',
    illustration: '💰',
  },
];

const faqs = [
  {
    q: 'Is it free to create an account?',
    a: 'Yes! Creating an account on BookYourService is completely free for both clients and providers. There are no hidden charges.',
  },
  {
    q: 'How are service providers verified?',
    a: 'All providers go through a KYC verification process. We verify their identity documents, check their professional qualifications, and ensure they meet our quality standards.',
  },
  {
    q: 'What if I am not satisfied with the service?',
    a: 'We offer a satisfaction guarantee. If the service does not meet the agreed terms, you can raise a dispute and we will work to resolve it, including potential refunds.',
  },
  {
    q: 'How does payment work?',
    a: 'Payments are made securely through our platform. Your payment is held in escrow and only released to the provider after the service is completed to your satisfaction.',
  },
  {
    q: 'Can I cancel a booking?',
    a: 'Yes, you can cancel a booking before the provider accepts it. Cancellation after acceptance may be subject to our cancellation policy.',
  },
  {
    q: 'How do providers get paid?',
    a: 'Providers receive their earnings after the service is completed and marked as done. Payments are processed within 2-3 business days.',
  },
];

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export function HowItWorksPage() {
  const { navigate } = useApp();
  const [activeTab, setActiveTab] = useState<'client' | 'provider'>('client');

  const steps = activeTab === 'client' ? clientSteps : providerSteps;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <motion.div {...fadeUp} transition={{ duration: 0.4 }}>
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink onClick={() => navigate('home')} className="cursor-pointer">
                Home
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-gradient-ocean font-semibold">How It Works</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </motion.div>

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative mb-12 overflow-hidden rounded-3xl bg-gradient-to-br from-[#0A2463] via-[#0D3B7A] to-[#E6B800] p-10 sm:p-14"
      >
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-16 -top-16 size-64 rounded-full bg-white/5" />
          <div className="absolute -bottom-20 -left-20 size-80 rounded-full bg-white/5" />
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }} />
        </div>
        <div className="relative text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm"
          >
            <Sparkles className="size-7 text-white" />
          </motion.div>
          <h1 className="mb-3 text-4xl font-bold text-white sm:text-5xl">
            How It <span className="text-[#4D8AFF]/70">Works</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-[#4D8AFF]/60">
            Whether you need a service or provide one, our platform makes the process simple and secure
          </p>
        </div>
      </motion.div>

      {/* Tab Switcher */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mx-auto mb-12 max-w-md"
      >
        <div className="flex overflow-hidden rounded-2xl border border-[#1D63FF]/20 bg-white p-1 shadow-lg">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setActiveTab('client')}
            className={`relative flex flex-1 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-medium transition-all duration-300 ${
              activeTab === 'client'
                ? 'bg-gradient-to-r from-[#1D63FF] to-[#1D63FF] text-white shadow-md'
                : 'text-muted-foreground hover:bg-gray-50'
            }`}
          >
            <Search className="size-4" />
            For Clients
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setActiveTab('provider')}
            className={`relative flex flex-1 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-medium transition-all duration-300 ${
              activeTab === 'provider'
                ? 'bg-gradient-to-r from-[#1D63FF] to-[#1D63FF] text-white shadow-md'
                : 'text-muted-foreground hover:bg-gray-50'
            }`}
          >
            <Wrench className="size-4" />
            For Providers
          </motion.button>
        </div>
      </motion.div>

      {/* Timeline Steps */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="relative"
        >
          {/* Animated vertical line */}
          <div className="absolute left-6 top-0 bottom-0 hidden w-0.5 sm:block">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: '100%' }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
              className="w-full bg-gradient-to-b from-[#4D8AFF] via-[#4D8AFF] to-[#FFCE32]"
            />
          </div>

          <div className="space-y-8">
            {steps.map((step, idx) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.08, duration: 0.4 }}
                className="relative flex gap-6"
              >
                {/* Step Circle - Desktop */}
                <div className="relative z-10 hidden shrink-0 sm:block">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: idx * 0.08 + 0.2, type: 'spring', stiffness: 200, damping: 15 }}
                    className={`flex size-12 items-center justify-center rounded-full bg-gradient-to-br ${step.gradient} text-white shadow-lg`}
                  >
                    {step.icon}
                  </motion.div>
                  {/* Step number badge */}
                  <div className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-white text-xs font-bold text-[#0D3B7A] shadow-md ring-2 ring-[#7DB0FF]">
                    {step.step}
                  </div>
                </div>

                {/* Card */}
                <div className="group flex-1 overflow-hidden rounded-2xl border border-gray-100 glass-emerald shadow-md transition-all duration-300 hover:shadow-xl hover:border-[#7DB0FF]/50">
                  <div className="flex">
                    {/* Left gradient accent bar */}
                    <div className={`hidden w-1.5 shrink-0 bg-gradient-to-b ${step.gradient} sm:block`} />

                    <div className="flex-1 p-6">
                      <div className="flex items-start gap-4">
                        {/* Mobile icon */}
                        <div className={`flex size-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${step.gradient} text-white shadow-md sm:hidden`}>
                          {step.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <span className={`flex size-7 items-center justify-center rounded-lg bg-gradient-to-br ${step.gradient} text-xs font-bold text-white shadow-sm`}>
                              {step.step}
                            </span>
                            <h3 className="text-lg font-semibold text-gray-900">{step.title}</h3>
                          </div>
                          <p className="mt-2 leading-relaxed text-muted-foreground">{step.description}</p>
                        </div>
                        {/* Illustration */}
                        <div className="hidden shrink-0 text-4xl lg:block opacity-50 group-hover:opacity-100 transition-opacity">
                          {step.illustration}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Quick Benefits */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mt-16 mb-16"
      >
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { icon: <Handshake className="size-5" />, title: 'Trusted Professionals', desc: 'All providers are KYC-verified' },
            { icon: <Shield className="size-5" />, title: 'Secure Payments', desc: 'Escrow protection for every booking' },
            { icon: <ThumbsUp className="size-5" />, title: 'Satisfaction Guaranteed', desc: 'Full refund if service is unsatisfactory' },
          ].map((item, idx) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.3 }}
              className="glass-emerald rounded-2xl p-5 text-center shadow-md"
            >
              <div className="mx-auto mb-3 flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#1D63FF] to-[#1D63FF] text-white">
                {item.icon}
              </div>
              <h4 className="font-semibold text-gray-900">{item.title}</h4>
              <p className="mt-1 text-xs text-muted-foreground">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mt-8"
      >
        {activeTab === 'client' ? (
          <div className="relative overflow-hidden rounded-3xl bg-white p-10 text-center">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -right-16 -top-16 size-48 rounded-full bg-[#FFCE32]/5/50" />
              <div className="absolute -bottom-16 -left-16 size-48 rounded-full bg-[#FFCE32]/5/50" />
            </div>
            <div className="relative">
              <h2 className="text-3xl font-bold text-gray-900">
                Ready to Find a <span className="text-gradient-ocean">Service</span>?
              </h2>
              <p className="mx-auto mt-3 max-w-md text-muted-foreground">
                Browse through thousands of verified service providers and book with confidence
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button
                  size="lg"
                  onClick={() => navigate('categories')}
                  className="shimmer rounded-xl bg-gradient-to-r from-[#1D63FF] to-[#1D63FF] px-8 text-white shadow-lg shadow-[#1D63FF]/25 hover:from-[#0D3B7A] hover:to-[#0D3B7A]"
                >
                  Browse Services <ArrowRight className="ml-2 size-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate('register')}
                  className="rounded-xl border-[#7DB0FF] px-8 text-[#0D3B7A] hover:bg-[#FFCE32]/5"
                >
                  Create Account
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0A2463] via-[#0D3B7A] to-[#E6B800] p-10 text-center">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -right-16 -top-16 size-48 rounded-full bg-white/5" />
              <div className="absolute -bottom-16 -left-16 size-48 rounded-full bg-white/5" />
              <div className="absolute inset-0 opacity-10" style={{
                backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }} />
            </div>
            <div className="relative">
              <h2 className="text-3xl font-bold text-white">
                Ready to Grow Your <span className="text-[#4D8AFF]/70">Business</span>?
              </h2>
              <p className="mx-auto mt-3 max-w-md text-[#4D8AFF]/60">
                Join our network of professionals and reach thousands of customers
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button
                  size="lg"
                  className="shimmer rounded-xl bg-white px-8 text-[#1D63FF] shadow-lg hover:bg-[#FFCE32]/5"
                  onClick={() => navigate('register')}
                >
                  Join as Provider <ArrowRight className="ml-2 size-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* FAQ Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mt-16"
      >
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Frequently Asked <span className="text-gradient-ocean">Questions</span>
          </h2>
          <p className="mt-3 text-muted-foreground">
            Common questions about how BookYourService works
          </p>
        </div>
        <div className="mx-auto mt-8 max-w-2xl">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="rounded-xl border border-gray-100 glass-emerald px-4 shadow-sm mb-3 data-[state=open]:shadow-md data-[state=open]:border-[#7DB0FF]/50 transition-all">
                <AccordionTrigger className="text-left hover:no-underline py-4">
                  <span className="flex items-center gap-3">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#1D63FF] to-[#1D63FF] text-xs font-bold text-white">
                      {i + 1}
                    </span>
                    {faq.q}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-4 pl-9">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
        <div className="mt-6 text-center">
          <Button
            variant="outline"
            onClick={() => navigate('faq')}
            className="rounded-xl border-[#7DB0FF] text-[#0D3B7A] hover:bg-[#FFCE32]/5"
          >
            View All FAQs <ArrowRight className="ml-1 size-4" />
          </Button>
        </div>
      </motion.section>
    </div>
  );
}
