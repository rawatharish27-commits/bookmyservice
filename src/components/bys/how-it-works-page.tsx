'use client';

import React, { useState } from 'react';
import { useApp } from '@/contexts/app-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Search,
  CalendarCheck,
  CheckCircle2,
  Star,
  CreditCard,
  MessageSquare,
  Wrench,
  ClipboardList,
  DollarSign,
  UserPlus,
  Briefcase,
  Clock,
  ArrowRight,
  Users,
  Shield,
} from 'lucide-react';

const clientSteps = [
  {
    step: 1,
    title: 'Create Your Account',
    description: 'Sign up for free with your email and phone number. Verify your account to get started.',
    icon: <UserPlus className="size-6" />,
  },
  {
    step: 2,
    title: 'Search for Services',
    description: 'Browse through categories or use our search to find the service you need. Filter by location, price, and ratings.',
    icon: <Search className="size-6" />,
  },
  {
    step: 3,
    title: 'Compare Providers',
    description: 'View detailed profiles, read reviews, compare prices, and check availability to find the best match.',
    icon: <Users className="size-6" />,
  },
  {
    step: 4,
    title: 'Book & Schedule',
    description: 'Select your preferred date and time, add any special instructions, and confirm your booking.',
    icon: <CalendarCheck className="size-6" />,
  },
  {
    step: 5,
    title: 'Make Secure Payment',
    description: 'Pay securely through our platform. Your payment is held in escrow until the service is completed.',
    icon: <CreditCard className="size-6" />,
  },
  {
    step: 6,
    title: 'Get Service Done',
    description: 'A verified professional arrives at your location and completes the work as agreed.',
    icon: <CheckCircle2 className="size-6" />,
  },
  {
    step: 7,
    title: 'Review & Rate',
    description: 'After completion, rate the service and leave a review to help other users make informed decisions.',
    icon: <Star className="size-6" />,
  },
];

const providerSteps = [
  {
    step: 1,
    title: 'Register as Provider',
    description: 'Sign up with a provider account. Fill in your professional details and areas of expertise.',
    icon: <UserPlus className="size-6" />,
  },
  {
    step: 2,
    title: 'Complete KYC Verification',
    description: 'Submit your identity documents for verification. This builds trust with potential customers.',
    icon: <Shield className="size-6" />,
  },
  {
    step: 3,
    title: 'List Your Services',
    description: 'Create detailed service listings with pricing, availability, and service areas. Add photos to attract customers.',
    icon: <Briefcase className="size-6" />,
  },
  {
    step: 4,
    title: 'Set Your Schedule',
    description: 'Define your availability for each day of the week. Manage your calendar to avoid conflicts.',
    icon: <Clock className="size-6" />,
  },
  {
    step: 5,
    title: 'Receive Bookings',
    description: 'Get notified of new booking requests. Accept or reject based on your availability and preferences.',
    icon: <ClipboardList className="size-6" />,
  },
  {
    step: 6,
    title: 'Complete the Service',
    description: 'Arrive on time, deliver quality work, and mark the service as completed through the platform.',
    icon: <CheckCircle2 className="size-6" />,
  },
  {
    step: 7,
    title: 'Get Paid',
    description: 'Receive your earnings directly to your account. Track all payments and earnings through your dashboard.',
    icon: <DollarSign className="size-6" />,
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

export function HowItWorksPage() {
  const { navigate } = useApp();
  const [activeTab, setActiveTab] = useState<'client' | 'provider'>('client');

  const steps = activeTab === 'client' ? clientSteps : providerSteps;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">How It Works</h1>
        <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
          Whether you need a service or provide one, our platform makes the process simple and secure
        </p>
      </div>

      {/* Tab Switcher */}
      <div className="mx-auto mb-10 flex max-w-md overflow-hidden rounded-xl border">
        <button
          onClick={() => setActiveTab('client')}
          className={`flex flex-1 items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'client'
              ? 'bg-emerald-600 text-white'
              : 'bg-white text-muted-foreground hover:bg-gray-50'
          }`}
        >
          <Search className="size-4" />
          For Clients
        </button>
        <button
          onClick={() => setActiveTab('provider')}
          className={`flex flex-1 items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'provider'
              ? 'bg-emerald-600 text-white'
              : 'bg-white text-muted-foreground hover:bg-gray-50'
          }`}
        >
          <Wrench className="size-4" />
          For Providers
        </button>
      </div>

      {/* Timeline Steps */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-6 top-0 bottom-0 hidden w-0.5 bg-emerald-200 sm:block" />

        <div className="space-y-6">
          {steps.map((step, idx) => (
            <div key={step.step} className="relative flex gap-6">
              {/* Step Circle */}
              <div className="relative z-10 hidden shrink-0 sm:block">
                <div
                  className={`flex size-12 items-center justify-center rounded-full ${
                    idx === steps.length - 1
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-100 text-emerald-600'
                  }`}
                >
                  {step.icon}
                </div>
              </div>

              {/* Card */}
              <Card className="flex-1 rounded-xl border-l-4 border-l-emerald-500 transition-all hover:shadow-md">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 sm:hidden">
                  {step.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="flex size-6 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
                      {step.step}
                    </span>
                    <h3 className="font-semibold">{step.title}</h3>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
                </div>
              </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="mt-12 text-center">
        {activeTab === 'client' ? (
          <div className="rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 p-8">
            <h2 className="text-2xl font-bold">Ready to Find a Service?</h2>
            <p className="mx-auto mt-2 max-w-md text-muted-foreground">
              Browse through thousands of verified service providers and book with confidence
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                size="lg"
                onClick={() => navigate('categories')}
                className="bg-emerald-600 text-white hover:bg-emerald-700"
              >
                Browse Services <ArrowRight className="ml-2 size-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('register')}>
                Create Account
              </Button>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 p-8">
            <h2 className="text-2xl font-bold text-white">Ready to Grow Your Business?</h2>
            <p className="mx-auto mt-2 max-w-md text-emerald-100">
              Join our network of professionals and reach thousands of customers
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                size="lg"
                className="bg-white text-emerald-600 hover:bg-emerald-50"
                onClick={() => navigate('register')}
              >
                Join as Provider <ArrowRight className="ml-2 size-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* FAQ Section */}
      <section className="mt-16">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight">Frequently Asked Questions</h2>
          <p className="mt-2 text-muted-foreground">
            Common questions about how BookYourService works
          </p>
        </div>
        <div className="mx-auto mt-8 max-w-2xl">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger className="text-left">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
        <div className="mt-6 text-center">
          <Button variant="outline" onClick={() => navigate('faq')} className="border-emerald-200 text-emerald-600">
            View All FAQs <ArrowRight className="ml-1 size-4" />
          </Button>
        </div>
      </section>
    </div>
  );
}
