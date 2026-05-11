'use client';

import React, { useState, useMemo } from 'react';
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
} from 'lucide-react';

const CATEGORY_LABELS: Record<string, string> = {
  General: 'General',
  Booking: 'Booking',
  Payment: 'Payment',
  Provider: 'Provider',
  Cancellation: 'Cancellation',
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

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink onClick={() => navigate('home')} className="cursor-pointer">
              Home
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>FAQ</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-100">
          <HelpCircle className="size-7 text-emerald-600" />
        </div>
        <h1 className="mt-4 text-3xl font-bold tracking-tight">Frequently Asked Questions</h1>
        <p className="mx-auto mt-2 max-w-xl text-muted-foreground">
          Find answers to common questions about our platform, services, and policies
        </p>
      </div>

      {/* Search */}
      <div className="mx-auto mb-8 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="mb-8 flex flex-wrap justify-center gap-2">
        <Button
          variant={activeCategory === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveCategory('all')}
          className={activeCategory === 'all' ? 'bg-emerald-600 text-white hover:bg-emerald-700' : ''}
        >
          All
        </Button>
        {categories.map((cat) => (
          <Button
            key={cat}
            variant={activeCategory === cat ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveCategory(cat)}
            className={activeCategory === cat ? 'bg-emerald-600 text-white hover:bg-emerald-700' : ''}
          >
            {CATEGORY_LABELS[cat] || cat}
          </Button>
        ))}
      </div>

      {/* FAQ Content */}
      {loading && (
        <div className="mx-auto max-w-2xl space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="rounded-xl">
              <CardContent className="p-4">
                <Skeleton className="mb-2 h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {error && (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">Failed to load FAQs</p>
          <Button variant="outline" size="sm" onClick={refetch} className="mt-2">
            Retry
          </Button>
        </div>
      )}

      {!loading && !error && Object.keys(filteredData).length > 0 && (
        <div className="mx-auto max-w-2xl space-y-6">
          {Object.entries(filteredData).map(([category, items]) => (
            <div key={category}>
              <h2 className="mb-3 text-lg font-semibold text-emerald-600">
                {CATEGORY_LABELS[category] || category}
              </h2>
              <Card className="rounded-xl">
                <CardContent className="p-0">
                  <Accordion type="single" collapsible className="w-full">
                    {items.map((item) => (
                      <AccordionItem key={item.id} value={`faq-${item.id}`} className="px-4">
                        <AccordionTrigger className="text-left text-sm">
                          {item.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-sm text-muted-foreground">
                          {item.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      )}

      {!loading && !error && Object.keys(filteredData).length === 0 && (
        <div className="py-12 text-center">
          <HelpCircle className="mx-auto size-12 text-muted-foreground" />
          <p className="mt-4 font-medium">No FAQs found</p>
          <p className="text-sm text-muted-foreground">
            {searchQuery ? 'Try adjusting your search' : 'No FAQs available yet'}
          </p>
          {searchQuery && (
            <Button variant="outline" size="sm" onClick={() => setSearchQuery('')} className="mt-2">
              Clear Search
            </Button>
          )}
        </div>
      )}

      {/* Contact Support CTA */}
      <div className="mx-auto mt-12 max-w-xl rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 p-8 text-center">
        <MessageSquare className="mx-auto size-8 text-emerald-600" />
        <h3 className="mt-3 text-lg font-semibold">Still have questions?</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Our support team is ready to help you with any questions
        </p>
        <div className="mt-4 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            onClick={() => navigate('contact')}
            className="bg-emerald-600 text-white hover:bg-emerald-700"
          >
            <Mail className="mr-1 size-4" /> Contact Us
          </Button>
          <a
            href="tel:+14155551234"
            className="inline-flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700"
          >
            <Phone className="size-4" /> +1 (415) 555-1234
          </a>
        </div>
      </div>
    </div>
  );
}
