'use client';

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
} from 'lucide-react';

const PAGE_TYPE_MAP: Record<string, { title: string; type: string; icon: React.ReactNode; gradient: string }> = {
  terms: { title: 'Terms of Service', type: 'TERMS', icon: <Shield className="size-5" />, gradient: 'from-emerald-500 to-teal-500' },
  privacy: { title: 'Privacy Policy', type: 'PRIVACY', icon: <Lock className="size-5" />, gradient: 'from-teal-500 to-cyan-500' },
  'refund-policy': { title: 'Refund Policy', type: 'REFUND', icon: <RefreshCw className="size-5" />, gradient: 'from-amber-500 to-orange-500' },
  'cookie-policy': { title: 'Cookie Policy', type: 'COOKIES', icon: <Cookie className="size-5" />, gradient: 'from-violet-500 to-purple-500' },
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
  const pageType = nav.params.type || 'terms';
  const pageInfo = PAGE_TYPE_MAP[pageType] || { title: 'Legal', type: pageType.toUpperCase(), icon: <FileText className="size-5" />, gradient: 'from-emerald-500 to-teal-500' };

  const { data, loading, error, refetch } = useApi<LegalPageData>(
    `/api/legal/${pageInfo.type}`
  );

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
    if (!data?.content) return [];
    const lines = data.content.split('\n');
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
  }, [data]);

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

      {error && (
        <motion.div {...fadeUp} className="py-16 text-center">
          <div className="glass mx-auto max-w-md rounded-2xl p-8">
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

      {!loading && !error && data && (
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
                <div className="overflow-hidden rounded-2xl border-0 bg-white shadow-lg">
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
                <div className="mt-4 overflow-hidden rounded-2xl border-0 bg-white shadow-lg">
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
            <div className="overflow-hidden rounded-2xl border-0 bg-white shadow-lg">
              <div className={`h-1.5 bg-gradient-to-r ${pageInfo.gradient}`} />
              <div className="p-6 sm:p-8 lg:p-10">
                {/* Header */}
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`flex size-12 items-center justify-center rounded-xl bg-gradient-to-br ${pageInfo.gradient} text-white shadow-lg`}>
                      {pageInfo.icon}
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">{data.title}</h1>
                      <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                        {data.effectiveDate && (
                          <span className="flex items-center gap-1">
                            <Clock className="size-3.5" />
                            Effective: {new Date(data.effectiveDate).toLocaleDateString()}
                          </span>
                        )}
                        {data.version && (
                          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium">
                            v{data.version}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* Last updated badge */}
                  {data.effectiveDate && (
                    <div className="shrink-0 rounded-full bg-emerald-50 px-4 py-1.5 text-sm font-medium text-emerald-700 ring-1 ring-emerald-200">
                      Last Updated: {new Date(data.effectiveDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                  )}
                </div>

                {/* Separator */}
                <div className="mb-8 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

                {/* Mobile TOC */}
                {tableOfContents.length > 0 && (
                  <div className="mb-8 rounded-xl bg-gray-50 p-4 lg:hidden">
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
                  {renderContent(data.content)}
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

      {!loading && !error && !data && (
        <motion.div {...fadeUp} className="py-16 text-center">
          <div className="glass mx-auto max-w-md rounded-2xl p-8">
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
            className="fixed bottom-6 right-6 z-50 flex size-12 items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30 hover:from-emerald-600 hover:to-teal-600 transition-all"
            aria-label="Back to top"
          >
            <ArrowUp className="size-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
