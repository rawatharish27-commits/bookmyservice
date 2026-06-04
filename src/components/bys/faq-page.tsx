import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/contexts/app-context';
import { useApi } from '@/hooks/use-api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
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
  HelpCircle,
  MessageSquare,
  Mail,
  Phone,
  ArrowRight,
  X,
  Sparkles,
  BookOpen,
  CreditCard,
  UserCog,
  XCircle,
  Settings,
  ChevronRight,
} from 'lucide-react';

const CATEGORY_LABELS: Record<string, string> = {
  General: 'General',
  Booking: 'Booking',
  Payment: 'Payment',
  Provider: 'Provider',
  Cancellation: 'Cancellation',
};

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  General: <BookOpen className="size-4" />,
  Booking: <Sparkles className="size-4" />,
  Payment: <CreditCard className="size-4" />,
  Provider: <UserCog className="size-4" />,
  Cancellation: <XCircle className="size-4" />,
};

const CATEGORY_GRADIENTS: Record<string, string> = {
  General: 'from-[#0A1F44] to-[#132D5E]',
  Booking: 'from-[#0A1F44] to-[#132D5E]',
  Payment: 'from-[#0A1F44] to-[#132D5E]',
  Provider: 'from-[#0A1F44] to-[#132D5E]',
  Cancellation: 'from-[#8B0000] to-[#8B0000]',
};

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export function FaqPage() {
  const { navigate } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const { data: faqData, loading, error, refetch } = useApi<Record<string, Array<{ id: number; question: string; answer: string }>>>(
    '/api/faq'
  );

  const categories = faqData ? Object.keys(faqData) : [];

  const filteredData = useMemo(() => {
    if (!faqData) return {};
    const result: Record<string, Array<{ id: number; question: string; answer: string }>> = {};
    for (const [cat, items] of Object.entries(faqData)) {
      if (activeCategory !== 'all' && cat !== activeCategory) continue;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const filtered = items.filter(
          (item) =>
            item.question.toLowerCase().includes(q) || item.answer.toLowerCase().includes(q)
        );
        if (filtered.length > 0) result[cat] = filtered;
      } else {
        result[cat] = items;
      }
    }
    return result;
  }, [faqData, searchQuery, activeCategory]);

  const totalResults = Object.values(filteredData).reduce((sum, items) => sum + items.length, 0);

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
              <BreadcrumbPage className="text-gradient font-semibold">FAQ</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </motion.div>

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative mb-10 overflow-hidden rounded-3xl bg-gradient-to-br from-[#0A1F44] via-[#132D5E] to-[#0A1F44] p-10 sm:p-14"
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
            <HelpCircle className="size-7 text-white" />
          </motion.div>
          <h1 className="mb-3 text-4xl font-bold text-white sm:text-5xl">
            Frequently Asked <span className="text-[#FFD54F]">Questions</span>
          </h1>
          <p className="mx-auto max-w-xl text-lg text-[#E0B84C]">
            Find answers to common questions about our platform, services, and policies
          </p>
        </div>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mx-auto mb-8 max-w-xl"
      >
        <div className="group relative">
          <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-[#FFD54F]/0 via-[#FFD54F]/50 to-[#FFD54F]/0 opacity-0 blur transition-opacity duration-500 group-focus-within:opacity-100" />
          <div className="relative">
            <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[#0A1F44]/80" />
            <Input
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 rounded-xl border-gray-200 bg-white pl-12 pr-10 text-base shadow-md focus:border-[#0A1F44] focus:ring-[#FFD54F]/30"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Category Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="mb-10 flex flex-wrap justify-center gap-2"
      >
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setActiveCategory('all')}
          className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all ${
            activeCategory === 'all'
              ? 'bg-gradient-to-r from-[#0A1F44] to-[#132D5E] text-white shadow-md shadow-[#0A1F44]/25'
              : 'bg-white text-gray-600 shadow-sm ring-1 ring-gray-200 hover:ring-[#D4A017] hover:text-[#0A1F44]'
          }`}
        >
          <Settings className="size-3.5" />
          All
        </motion.button>
        {categories.map((cat) => {
          const gradient = CATEGORY_GRADIENTS[cat] || 'from-[#0A1F44] to-[#132D5E]';
          const icon = CATEGORY_ICONS[cat] || <BookOpen className="size-4" />;
          return (
            <motion.button
              key={cat}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setActiveCategory(cat)}
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                activeCategory === cat
                  ? `bg-gradient-to-r ${gradient} text-white shadow-md`
                  : 'bg-white text-gray-600 shadow-sm ring-1 ring-gray-200 hover:ring-[#D4A017] hover:text-[#0A1F44]'
              }`}
            >
              {icon}
              {CATEGORY_LABELS[cat] || cat}
            </motion.button>
          );
        })}
      </motion.div>

      {/* FAQ Content */}
      {loading && (
        <div className="mx-auto max-w-2xl space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="rounded-2xl border-0 shadow-md">
              <CardContent className="p-5">
                <Skeleton className="mb-2 h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="mt-1 h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {error && (
        <motion.div {...fadeUp} className="py-16 text-center">
          <div className="glass mx-auto max-w-md rounded-2xl p-8">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-red-50">
              <HelpCircle className="size-8 text-red-400" />
            </div>
            <p className="text-lg font-semibold text-gray-800">Failed to Load FAQs</p>
            <p className="mt-1 text-sm text-muted-foreground">Please try again later</p>
            <Button variant="outline" size="sm" onClick={refetch} className="mt-4 rounded-xl border-[#0A1F44]/30 text-[#0A1F44] hover:bg-[#FFD54F]/10">
              Retry
            </Button>
          </div>
        </motion.div>
      )}

      {!loading && !error && Object.keys(filteredData).length > 0 && (
        <div className="mx-auto max-w-2xl space-y-8">
          {/* Results count */}
          {searchQuery && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-muted-foreground text-center"
            >
              Found <span className="font-semibold text-foreground">{totalResults}</span> result{totalResults !== 1 ? 's' : ''} for &ldquo;{searchQuery}&rdquo;
            </motion.p>
          )}

          {Object.entries(filteredData).map(([category, items], catIdx) => {
            const gradient = CATEGORY_GRADIENTS[category] || 'from-[#0A1F44] to-[#132D5E]';
            const icon = CATEGORY_ICONS[category] || <BookOpen className="size-5" />;
            return (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: catIdx * 0.1, duration: 0.4 }}
              >
                {/* Category header */}
                <div className="mb-4 flex items-center gap-3">
                  <div className={`flex size-8 items-center justify-center rounded-lg bg-gradient-to-br ${gradient} text-white shadow-md`}>
                    {icon}
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {CATEGORY_LABELS[category] || category}
                  </h2>
                  <span className="rounded-full bg-[#0A1F44]/10 px-2.5 py-0.5 text-xs font-medium text-[#0A1F44]">
                    {items.length}
                  </span>
                </div>

                {/* FAQ Accordion */}
                <div className="space-y-3">
                  <Accordion type="single" collapsible className="w-full">
                    {items.map((item, itemIdx) => (
                      <AccordionItem
                        key={item.id}
                        value={`faq-${item.id}`}
                        className="rounded-xl border border-gray-100 glass px-5 shadow-sm transition-all data-[state=open]:shadow-md data-[state=open]:border-[#0A1F44]/30"
                      >
                        <AccordionTrigger className="text-left hover:no-underline py-4 text-gray-800">
                          <span className="flex items-center gap-3 pr-2">
                            <span className={`flex size-6 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${gradient} text-xs font-bold text-white`}>
                              {itemIdx + 1}
                            </span>
                            <span className="text-sm sm:text-base">{item.question}</span>
                          </span>
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground pb-4 pl-9">
                          <div className="rounded-lg bg-white p-3 text-sm leading-relaxed">
                            {item.answer}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {!loading && !error && Object.keys(filteredData).length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="py-16 text-center"
        >
          <div className="glass mx-auto max-w-md rounded-3xl p-10">
            <div className="mx-auto mb-4 flex size-20 items-center justify-center rounded-3xl bg-white">
              <HelpCircle className="size-10 text-[#0A1F44]/60" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">No FAQs Found</h3>
            <p className="mt-2 text-muted-foreground">
              {searchQuery ? 'Try adjusting your search terms' : 'No FAQs available yet'}
            </p>
            {searchQuery && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSearchQuery('')}
                className="mt-4 rounded-xl border-[#0A1F44]/30 text-[#0A1F44] hover:bg-[#FFD54F]/10"
              >
                Clear Search
              </Button>
            )}
          </div>
        </motion.div>
      )}

      {/* Contact Support CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mx-auto mt-16 max-w-xl"
      >
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0A1F44] via-[#132D5E] to-[#0A1F44] p-8 text-center">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -right-12 -top-12 size-40 rounded-full bg-white/5" />
            <div className="absolute -bottom-12 -left-12 size-40 rounded-full bg-white/5" />
          </div>
          <div className="relative">
            <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
              <MessageSquare className="size-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white">Still have questions?</h3>
            <p className="mt-2 text-[#E0B84C]">
              Our support team is ready to help you with any questions
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                onClick={() => navigate('contact')}
                className="shimmer rounded-xl bg-white px-6 text-[#0A1F44] shadow-lg hover:bg-[#FFD54F]/10"
              >
                <Mail className="mr-2 size-4" /> Contact Us
              </Button>
              <a
                href="tel:+14155551234"
                className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-5 py-2.5 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20"
              >
                <Phone className="size-4" /> +1 (415) 555-1234
              </a>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
