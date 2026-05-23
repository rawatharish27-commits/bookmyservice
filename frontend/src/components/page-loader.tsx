import { Skeleton } from '@/components/ui/skeleton';

/**
 * PageLoader — professional loading fallback for React.Suspense.
 * Shows a content-skeleton that mimics typical page layout so the
 * transition feels smooth instead of jarring.
 */
export function PageLoader() {
  return (
    <div className="flex min-h-[60vh] w-full flex-col items-center justify-center gap-4 px-4 py-12">
      {/* Spinning ring */}
      <div className="relative flex size-12 items-center justify-center">
        <div className="absolute inset-0 rounded-full border-4 border-muted" />
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-primary" />
      </div>

      {/* Skeleton content preview */}
      <div className="mt-4 flex w-full max-w-2xl flex-col gap-3">
        <Skeleton className="mx-auto h-6 w-48" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <div className="mt-2 grid grid-cols-3 gap-3">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
        <Skeleton className="mt-2 h-4 w-4/6" />
        <Skeleton className="h-32 rounded-xl" />
      </div>
    </div>
  );
}

export default PageLoader;
