import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp, type Page } from '@/contexts/app-context';
import { useApi } from '@/hooks/use-api';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  ArrowLeft,
  FileText,
  AlertCircle,
  ArrowUp,
  Clock,
  ChevronRight,
  Shield,
  Lock,
  RefreshCw,
  Cookie,
  Scale,
  HandshakeIcon,
  Users,
} from 'lucide-react';

const PAGE_TYPE_MAP: Record<string, { title: string; type: string; icon: React.ReactNode; gradient: string; fallbackContent: string }> = {
  terms: { title: 'Terms of Service', type: 'terms', icon: <Shield className="size-5" />, gradient: 'from-emerald-700 to-teal-600',
    fallbackContent: `TERMS OF SERVICE - BOOKYOURSERVICE
Effective Date: January 1, 2025

1. ACCEPTANCE OF TERMS
By accessing or using the BookYourService platform, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.

2. DESCRIPTION OF SERVICE
BookYourService is an online marketplace that connects customers with verified home service professionals including plumbing, electrical, and AC & HVAC services across India.

3. USER ACCOUNTS
- You must create an account to use our services
- You are responsible for maintaining the confidentiality of your account
- You must provide accurate and complete information
- You must be at least 18 years old to create an account

4. SERVICE PROVIDERS
- All service providers are KYC verified
- Service providers are independent contractors, not employees of BookYourService
- BookYourService acts as an intermediary and does not guarantee service quality
- Service providers set their own pricing and availability

5. BOOKING AND PAYMENTS
- All bookings are subject to provider availability
- Prices are displayed before booking confirmation
- Payments are processed securely through our platform
- Service charges and taxes may apply

6. CANCELLATION AND REFUND
- Cancellations made 24 hours before the service are fully refundable
- Late cancellations may incur a cancellation fee
- Refunds are processed within 5-7 business days
- No-shows are non-refundable

7. USER CONDUCT
- Users must not misuse the platform
- Users must not harass or abuse service providers or other users
- Users must not post false or misleading information
- Users must not attempt to circumvent payment systems

8. LIABILITY
- BookYourService is not liable for any damages arising from services provided
- Our liability is limited to the amount paid for the specific service
- We are not responsible for delays or failures beyond our control

9. MODIFICATIONS
- We reserve the right to modify these terms at any time
- Users will be notified of significant changes
- Continued use after modifications constitutes acceptance

10. GOVERNING LAW
- These terms are governed by the laws of India
- Any disputes shall be resolved in courts of New Delhi, India

For questions about these Terms, contact us at support@bookyourservice.in` },
  privacy: { title: 'Privacy Policy', type: 'privacy', icon: <Lock className="size-5" />, gradient: 'from-teal-700 to-cyan-600',
    fallbackContent: `PRIVACY POLICY - BOOKYOURSERVICE
Effective Date: January 1, 2025

1. INFORMATION WE COLLECT
- Personal Information: Name, email, phone number, address
- Service Information: Booking history, preferences, reviews
- Technical Information: IP address, browser type, device information
- Location Information: For providing location-based services

2. HOW WE USE YOUR INFORMATION
- To provide and improve our services
- To process bookings and payments
- To communicate with you about services
- To verify identity and prevent fraud
- To comply with legal obligations

3. DATA SHARING
- We share data with service providers to fulfill bookings
- We may share data with payment processors for transactions
- We do not sell your personal information to third parties
- We may share data when required by law

4. DATA SECURITY
- We use industry-standard encryption (SSL/TLS)
- We regularly audit our security practices
- We limit access to personal data to authorized personnel
- We have incident response procedures in place

5. DATA RETENTION
- We retain your data as long as your account is active
- Booking records are retained for 3 years
- Payment records are retained as required by law
- You can request deletion of your data at any time

6. YOUR RIGHTS
- Right to access your personal data
- Right to correct inaccurate data
- Right to delete your account and data
- Right to opt out of marketing communications
- Right to data portability

7. COOKIES
- We use essential cookies for platform functionality
- We use analytics cookies to improve user experience
- You can manage cookie preferences in your browser settings

8. CHILDREN'S PRIVACY
- Our services are not intended for children under 18
- We do not knowingly collect data from minors

9. CHANGES TO THIS POLICY
- We may update this policy periodically
- We will notify you of significant changes
- Last updated date will be reflected above

10. CONTACT US
For privacy concerns, contact: privacy@bookyourservice.in` },
  'refund-policy': { title: 'Refund Policy', type: 'refund-policy', icon: <RefreshCw className="size-5" />, gradient: 'from-sky-600 to-blue-500',
    fallbackContent: `REFUND POLICY - BOOKYOURSERVICE
Effective Date: January 1, 2025

1. GENERAL REFUND POLICY
At BookYourService, we strive to ensure customer satisfaction. Our refund policy outlines the conditions under which refunds are issued.

2. ELIGIBLE REFUNDS
- Service not performed as described
- Provider no-show or late arrival beyond 30 minutes
- Cancellation made 24+ hours before scheduled service
- Duplicate charges or billing errors
- Service cancelled by the provider

3. REFUND PROCESS
- Submit refund request within 48 hours of service date
- Provide booking ID and reason for refund
- Our team reviews requests within 2 business days
- Approved refunds processed within 5-7 business days

4. PARTIAL REFUNDS
- Service partially completed: 50-75% refund based on completion
- Quality issues: Up to 50% refund after investigation
- Rescheduling offered before partial refund

5. NON-REFUNDABLE SCENARIOS
- Customer no-show
- Cancellation less than 2 hours before service
- Service completed as described
- Customer change of mind after service completion

6. CANCELLATION FEES
- 24+ hours before: No fee
- 2-24 hours before: 25% of booking amount
- Less than 2 hours: 50% of booking amount
- No-show: 100% of booking amount

7. DISPUTE RESOLUTION
- Contact support within 48 hours
- Provide evidence (photos, description)
- Mediation between customer and provider
- Final decision within 5 business days

8. PAYMENT METHOD REFUNDS
- Credit/Debit Card: Refunded to original card
- UPI: Refunded to original UPI ID
- Wallet: Refunded to BookYourService wallet

For refund requests: support@bookyourservice.in` },
  'cookie-policy': { title: 'Cookie Policy', type: 'cookies', icon: <Cookie className="size-5" />, gradient: 'from-violet-600 to-purple-500',
    fallbackContent: `COOKIE POLICY - BOOKYOURSERVICE
Effective Date: January 1, 2025

1. WHAT ARE COOKIES
Cookies are small text files stored on your device when you visit our website. They help us provide you with a better experience.

2. TYPES OF COOKIES WE USE
- Essential Cookies: Required for platform functionality
- Performance Cookies: Help us understand how you use our platform
- Functional Cookies: Remember your preferences
- Marketing Cookies: Used for relevant advertising

3. MANAGING COOKIES
You can control cookies through your browser settings. Disabling certain cookies may affect platform functionality.

4. THIRD-PARTY COOKIES
We use third-party services that may set their own cookies for analytics and payment processing.` },
  aup: { title: 'Acceptable Usage Policy', type: 'aup', icon: <Scale className="size-5" />, gradient: 'from-rose-600 to-red-500',
    fallbackContent: `ACCEPTABLE USAGE POLICY - BOOKYOURSERVICE
Effective Date: January 1, 2025

1. ACCEPTABLE USE
Users must use BookYourService responsibly and in compliance with all applicable laws and regulations.

2. PROHIBITED ACTIVITIES
- Using the platform for illegal purposes
- Harassment, abuse, or threatening behavior
- Posting false or misleading information
- Attempting to hack or compromise platform security
- Circumventing payment systems
- Creating fake accounts or reviews
- Impersonating other users or service providers

3. CONTENT GUIDELINES
- All content must be accurate and truthful
- Reviews must be based on genuine service experiences
- No spam, advertising, or promotional content
- No offensive, discriminatory, or explicit content

4. ENFORCEMENT
- Warning for first violations
- Temporary suspension for repeated violations
- Permanent ban for severe violations
- Legal action for illegal activities` },
  'provider-agreement': { title: 'Provider Agreement', type: 'provider-agreement', icon: <HandshakeIcon className="size-5" />, gradient: 'from-sky-600 to-blue-500',
    fallbackContent: `PROVIDER AGREEMENT - BOOKYOURSERVICE
Effective Date: January 1, 2025

1. AGREEMENT TO TERMS
By registering as a service provider on BookYourService, you agree to these terms in addition to our Terms of Service.

2. PROVIDER OBLIGATIONS
- Complete KYC verification before offering services
- Maintain up-to-date service listings and pricing
- Respond to booking requests promptly
- Provide services as described
- Maintain professional conduct
- Carry appropriate insurance and licenses

3. SERVICE STANDARDS
- Arrive on time for scheduled appointments
- Communicate any delays to the customer
- Provide quality workmanship
- Follow safety protocols and regulations
- Clean up after service completion

4. PAYMENT TERMS
- Service providers receive payment after service completion
- Platform commission applies to each booking
- Payments are processed within 3-5 business days
- Tax documentation is the provider's responsibility

5. TERMINATION
Either party may terminate this agreement with 30 days notice. Immediate termination for policy violations.` },
  'community-guidelines': { title: 'Community Guidelines', type: 'community-guidelines', icon: <Users className="size-5" />, gradient: 'from-fuchsia-600 to-pink-500',
    fallbackContent: `COMMUNITY GUIDELINES - BOOKYOURSERVICE
Effective Date: January 1, 2025

1. OUR COMMUNITY VALUES
BookYourService is built on trust, respect, and quality. These guidelines ensure a safe and positive experience for everyone.

2. RESPECT AND PROFESSIONALISM
- Treat all users with respect and dignity
- Communicate clearly and courteously
- Respect differences in culture, background, and identity
- No discrimination, harassment, or hate speech

3. HONESTY AND TRANSPARENCY
- Provide accurate information in profiles and listings
- Write honest reviews based on genuine experiences
- Report issues truthfully
- Do not manipulate ratings or reviews

4. SAFETY
- Never compromise on safety standards
- Report any safety concerns immediately
- Follow all applicable safety regulations
- Do not share personal contact information outside the platform

5. QUALITY STANDARDS
- Service providers must deliver services as described
- Customers must provide clear requirements
- Both parties should communicate expectations clearly
- Feedback should be constructive and helpful

6. PRIVACY
- Respect the privacy of other users
- Do not share personal information without consent
- Do not take photos or videos without permission
- Report any privacy violations

7. CONFLICT RESOLUTION
- Attempt to resolve disputes amicably
- Use our platform's dispute resolution system
- Do not engage in public shaming or retaliation
- Contact support for mediation if needed

8. VIOLATIONS
- First violation: Warning
- Second violation: Temporary restriction
- Severe violations: Permanent removal from platform
- Illegal activities: Reported to authorities

9. REPORTING
Report violations to: community@bookyourservice.in
We review all reports within 48 hours and take appropriate action.` },
};

interface LegalPageData {
  id: number;
  pageType: string;
  title: string;
  content: string;
  version?: string;
  effectiveDate?: string;
}

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export function LegalPage() {
  const { navigate, nav } = useApp();
  const pageType = nav.params.type || nav.page;
  const pageInfo = PAGE_TYPE_MAP[pageType] || { title: 'Legal', type: pageType, icon: <FileText className="size-5" />, gradient: 'from-emerald-700 to-teal-600', fallbackContent: '' };

  const { data, loading, error, refetch } = useApi<LegalPageData>(
    `/api/legal/${pageInfo.type}`
  );

  // Use API data if available, otherwise use fallback content
  const displayContent = data?.content || pageInfo.fallbackContent || '';
  const displayTitle = data?.title || pageInfo.title;
  const displayDate = data?.effectiveDate || '2025-01-01';
  const displayVersion = data?.version || '1.0';

  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Parse content to extract sections for table of contents
  const tableOfContents = useMemo(() => {
    if (!displayContent) return [];
    const lines = displayContent.split('\n');
    const sections: { id: string; title: string; level: number }[] = [];
    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) return;
      // Main title (ALL CAPS, long)
      if (trimmed === trimmed.toUpperCase() && trimmed.length > 20 && !trimmed.startsWith('•') && !trimmed.startsWith('-')) {
        sections.push({ id: `section-${sections.length}`, title: trimmed, level: 1 });
      }
      // Numbered sections like "1.", "2."
      if (/^\d+\./.test(trimmed) && !/^\d+\.\d+/.test(trimmed)) {
        sections.push({ id: `section-${sections.length}`, title: trimmed, level: 2 });
      }
    });
    return sections;
  }, [displayContent]);

  const renderContent = (content: string) => {
    return content.split('\n').map((line, i) => {
      const trimmed = line.trim();
      if (!trimmed) return <div key={i} className="h-3" />;
      // Main title (ALL CAPS, long)
      if (trimmed === trimmed.toUpperCase() && trimmed.length > 20 && !trimmed.startsWith('•') && !trimmed.startsWith('-')) {
        return (
          <h2 key={i} id={`section-${i}`} className="mt-8 mb-4 flex items-center gap-3 text-xl font-bold text-gray-900">
            <div className={`flex size-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${pageInfo.gradient} text-xs font-bold text-white`}>
              {trimmed.charAt(0)}
            </div>
            {trimmed}
          </h2>
        );
      }
      // Numbered sections like "1.1", "2.3"
      if (/^\d+\.\d+/.test(trimmed)) {
        return <p key={i} className="ml-6 mt-1 leading-relaxed text-gray-600">{trimmed}</p>;
      }
      // Numbered sections like "1.", "2."
      if (/^\d+\./.test(trimmed)) {
        return (
          <h3 key={i} id={`section-${i}`} className="mt-6 mb-2 flex items-center gap-2 font-semibold text-gray-800">
            <ChevronRight className="size-4 text-emerald-500" />
            {trimmed}
          </h3>
        );
      }
      // Bullet points
      if (trimmed.startsWith('•') || trimmed.startsWith('-')) {
        return (
          <div key={i} className="ml-6 mt-1 flex items-start gap-2">
            <div className="mt-2 size-1.5 shrink-0 rounded-full bg-emerald-400" />
            <p className="leading-relaxed text-gray-600">{trimmed.replace(/^[•-]\s*/, '')}</p>
          </div>
        );
      }
      return <p key={i} className="leading-relaxed text-gray-600">{trimmed}</p>;
    });
  };

  return (
    <div className="bg-white min-h-screen mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
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
              <BreadcrumbPage className="text-gradient font-semibold">{pageInfo.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </motion.div>

      {/* Back button */}
      <motion.div {...fadeUp} transition={{ duration: 0.4, delay: 0.05 }}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('home')}
          className="group mb-6 text-muted-foreground hover:text-emerald-700"
        >
          <ArrowLeft className="mr-1 size-4 transition-transform group-hover:-translate-x-1" /> Back to Home
        </Button>
      </motion.div>

      {loading && (
        <div className="grid gap-8 lg:grid-cols-4">
          <div className="hidden lg:block">
            <div className="sticky top-24 space-y-3">
              <Skeleton className="h-5 w-32" />
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>
          </div>
          <div className="space-y-4 lg:col-span-3">
            <div className="flex items-center gap-3">
              <Skeleton className="size-10 rounded-xl" />
              <div>
                <Skeleton className="h-8 w-64" />
                <Skeleton className="mt-2 h-4 w-48" />
              </div>
            </div>
            <div className="mt-8 space-y-3">
              {Array.from({ length: 10 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>
          </div>
        </div>
      )}

      {error && !pageInfo.fallbackContent && (
        <motion.div {...fadeUp} className="py-16 text-center">
          <div className="glass-emerald mx-auto max-w-md rounded-2xl border border-white/20 p-8 shadow-lg">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-red-50">
              <AlertCircle className="size-8 text-red-400" />
            </div>
            <p className="text-lg font-semibold text-gray-800">Failed to Load Page</p>
            <p className="mt-1 text-sm text-muted-foreground">Please try again later</p>
            <Button variant="outline" size="sm" onClick={refetch} className="mt-4 rounded-xl border-emerald-200 text-emerald-600 hover:bg-emerald-50">
              Retry
            </Button>
          </div>
        </motion.div>
      )}

      {!loading && displayContent && (
        <div className="grid gap-8 lg:grid-cols-4">
          {/* Table of Contents - Sidebar */}
          {tableOfContents.length > 0 && (
            <motion.aside
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="hidden lg:block"
            >
              <div className="sticky top-24">
                <div className="glass-emerald overflow-hidden rounded-2xl border border-white/20 shadow-lg">
                  <div className={`h-1.5 bg-gradient-to-r ${pageInfo.gradient}`} />
                  <div className="p-5">
                    <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-500">Contents</h3>
                    <nav className="space-y-1 max-h-96 overflow-y-auto">
                      {tableOfContents.map((section, idx) => (
                        <a
                          key={idx}
                          href={`#${section.id}`}
                          onClick={(e) => {
                            e.preventDefault();
                            const el = document.getElementById(section.id);
                            if (el) {
                              el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }
                          }}
                          className={`flex items-start gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-emerald-50 hover:text-emerald-700 ${
                            section.level === 1
                              ? 'font-semibold text-gray-800'
                              : 'text-gray-500 ml-3'
                          }`}
                        >
                          <ChevronRight className="mt-0.5 size-3 shrink-0 text-emerald-400" />
                          <span className="line-clamp-2">{section.title}</span>
                        </a>
                      ))}
                    </nav>
                  </div>
                </div>

                {/* Other Legal Pages */}
                <div className="glass-emerald mt-4 overflow-hidden rounded-2xl border border-white/20 shadow-lg">
                  <div className="p-5">
                    <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-gray-500">Other Pages</h3>
                    <div className="space-y-1">
                      {Object.entries(PAGE_TYPE_MAP)
                        .filter(([key]) => key !== pageType)
                        .map(([key, info]) => (
                          <button
                            key={key}
                            onClick={() => navigate(key as Page, { type: key })}
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-emerald-50 hover:text-emerald-700"
                          >
                            <div className={`flex size-6 shrink-0 items-center justify-center rounded-md bg-gradient-to-br ${info.gradient} text-white`}>
                              <span className="scale-75">{info.icon}</span>
                            </div>
                            {info.title}
                          </button>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.aside>
          )}

          {/* Main Content */}
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className={tableOfContents.length > 0 ? 'lg:col-span-3' : 'lg:col-span-4'}
          >
            <div className="glass-emerald overflow-hidden rounded-2xl border border-white/20 shadow-lg">
              <div className={`h-1.5 bg-gradient-to-r ${pageInfo.gradient}`} />
              <div className="p-6 sm:p-8 lg:p-10">
                {/* Header */}
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`flex size-12 items-center justify-center rounded-xl bg-gradient-to-br ${pageInfo.gradient} text-white shadow-lg shadow-emerald-500/20`}>
                      {pageInfo.icon}
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">{displayTitle}</h1>
                      <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                        {displayDate && (
                          <span className="flex items-center gap-1">
                            <Clock className="size-3.5" />
                            Effective: {new Date(displayDate).toLocaleDateString()}
                          </span>
                        )}
                        {displayVersion && (
                          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium">
                            v{displayVersion}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* Last updated badge */}
                  {displayDate && (
                    <div className="shrink-0 rounded-full bg-emerald-50 px-4 py-1.5 text-sm font-medium text-emerald-700 ring-1 ring-emerald-200">
                      Last Updated: {new Date(displayDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                  )}
                </div>

                {/* Separator */}
                <div className="mb-8 h-px bg-gradient-to-r from-transparent via-emerald-300/40 to-transparent" />

                {/* Mobile TOC */}
                {tableOfContents.length > 0 && (
                  <div className="mb-8 rounded-xl bg-emerald-50/50 border border-emerald-100/50 p-4 lg:hidden">
                    <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-gray-500">Table of Contents</h3>
                    <nav className="space-y-1 max-h-48 overflow-y-auto">
                      {tableOfContents.map((section, idx) => (
                        <a
                          key={idx}
                          href={`#${section.id}`}
                          onClick={(e) => {
                            e.preventDefault();
                            const el = document.getElementById(section.id);
                            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }}
                          className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-white hover:text-emerald-700 ${
                            section.level === 1 ? 'font-medium text-gray-800' : 'text-gray-500 ml-4'
                          }`}
                        >
                          <ChevronRight className="size-3 text-emerald-400" />
                          <span className="line-clamp-1">{section.title}</span>
                        </a>
                      ))}
                    </nav>
                  </div>
                )}

                {/* Content */}
                <div className="legal-content max-w-none">
                  {renderContent(displayContent)}
                </div>
              </div>
            </div>

            {/* Other Legal Pages - Bottom (Mobile) */}
            <div className="mt-6 lg:hidden">
              <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-gray-500">Other Legal Pages</h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(PAGE_TYPE_MAP)
                  .filter(([key]) => key !== pageType)
                  .map(([key, info]) => (
                    <Button
                      key={key}
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(key as Page, { type: key })}
                      className="rounded-xl border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                    >
                      <span className="mr-1.5 scale-90">{info.icon}</span>
                      {info.title}
                    </Button>
                  ))}
              </div>
            </div>
          </motion.article>
        </div>
      )}

      {!loading && !displayContent && (
        <motion.div {...fadeUp} className="py-16 text-center">
          <div className="glass-emerald mx-auto max-w-md rounded-2xl border border-white/20 p-8 shadow-lg">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50">
              <FileText className="size-8 text-gray-400" />
            </div>
            <p className="text-lg font-semibold text-gray-800">Page Not Found</p>
            <p className="mt-1 text-sm text-muted-foreground">
              The requested legal page could not be found
            </p>
          </div>
        </motion.div>
      )}

      {/* Back to Top Button */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 z-50 flex size-12 items-center justify-center rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/30 hover:from-emerald-700 hover:to-teal-700 transition-all"
            aria-label="Back to top"
          >
            <ArrowUp className="size-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
