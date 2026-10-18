import { Skeleton } from '../../components/ui/Skeleton';

export function UpcomingPageSkeleton() {
  return (
    <div className="min-h-screen bg-[var(--color-base)] px-4 md:px-8 lg:px-12 py-8">
      {/* Header skeleton */}
      <div className="mb-8">
        <Skeleton className="h-10 w-64 mb-4" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24 rounded-lg" />
          <Skeleton className="h-10 w-24 rounded-lg" />
          <Skeleton className="h-10 w-24 rounded-lg" />
        </div>
      </div>

      {/* Month navigator skeleton */}
      <div className="flex items-center justify-between mb-8">
        <Skeleton className="h-10 w-10 rounded-full" />
        <Skeleton className="h-10 w-48 rounded-lg" />
        <Skeleton className="h-10 w-10 rounded-full" />
      </div>

      {/* Desktop layout skeleton */}
      <div className="hidden md:grid md:grid-cols-[1fr_400px] gap-8">
        {/* Calendar grid skeleton */}
        <div>
          <div className="grid grid-cols-7 gap-2 mb-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="h-8" />
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 35 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-lg" />
            ))}
          </div>
        </div>

        {/* Release list skeleton */}
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="w-20 h-28 rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile layout skeleton */}
      <div className="md:hidden space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i}>
            <Skeleton className="h-6 w-32 mb-3" />
            <div className="space-y-4">
              {Array.from({ length: 2 }).map((_, j) => (
                <div key={j} className="flex gap-4">
                  <Skeleton className="w-20 h-28 rounded-lg flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
