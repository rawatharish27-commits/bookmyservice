'use client';

import React from 'react';
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
import { ArrowLeft, FileText, AlertCircle } from 'lucide-react';

const PAGE_TYPE_MAP: Record<string, { title: string; type: string }> = {
  terms: { title: 'Terms of Service', type: 'TERMS' },
  privacy: { title: 'Privacy Policy', type: 'PRIVACY' },
  'refund-policy': { title: 'Refund Policy', type: 'REFUND' },
  'cookie-policy': { title: 'Cookie Policy', type: 'COOKIES' },
};

interface LegalPageData {
  id: number;
  pageType: string;
  title: string;
  content: string;
  version?: string;
  effectiveDate?: string;
}

export function LegalPage() {
  const { navigate, nav } = useApp();
  const pageType = nav.params.type || 'terms';
  const pageInfo = PAGE_TYPE_MAP[pageType] || { title: 'Legal', type: pageType.toUpperCase() };

  const { data, loading, error, refetch } = useApi<LegalPageData>(
    `/api/legal/${pageInfo.type}`
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
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
            <BreadcrumbPage>{pageInfo.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate('home')}
        className="mb-4 text-muted-foreground"
      >
        <ArrowLeft className="mr-1 size-4" /> Back to Home
      </Button>

      {loading && (
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
          <div className="mt-6 space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </div>
      )}

      {error && (
        <div className="py-12 text-center">
          <AlertCircle className="mx-auto size-12 text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">Failed to load this page</p>
          <Button variant="outline" size="sm" onClick={refetch} className="mt-2">
            Retry
          </Button>
        </div>
      )}

      {!loading && !error && data && (
        <article>
          <div className="mb-8">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-blue-50">
                <FileText className="size-5 text-blue-700" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{data.title}</h1>
                {data.effectiveDate && (
                  <p className="text-sm text-muted-foreground">
                    Effective: {new Date(data.effectiveDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
            {data.version && (
              <p className="mt-2 text-xs text-muted-foreground">Version: {data.version}</p>
            )}
          </div>

          <div
            className="prose prose-sm max-w-none text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: data.content }}
          />
        </article>
      )}

      {!loading && !error && !data && (
        <div className="py-12 text-center">
          <FileText className="mx-auto size-12 text-muted-foreground" />
          <p className="mt-4 font-medium">Page Not Found</p>
          <p className="text-sm text-muted-foreground">
            The requested legal page could not be found
          </p>
        </div>
      )}

      {/* Quick Links */}
      <div className="mt-12 border-t pt-8">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Other Legal Pages
        </h3>
        <div className="flex flex-wrap gap-3">
          {Object.entries(PAGE_TYPE_MAP)
            .filter(([key]) => key !== pageType)
            .map(([key, info]) => (
              <Button
                key={key}
                variant="outline"
                size="sm"
                onClick={() => navigate(key as Page, { type: key })}
                className="border-blue-200 text-blue-700 hover:bg-blue-50"
              >
                {info.title}
              </Button>
            ))}
        </div>
      </div>
    </div>
  );
}
