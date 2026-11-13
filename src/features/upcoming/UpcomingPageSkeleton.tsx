import { Skeleton } from '../../components/ui/Skeleton';

export function UpcomingPageSkeleton() {
  return (
    <div className="min-h-screen px-4 md:px-8 lg:px-12 py-6 sm:py-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <Skeleton className="h-9 sm:h-11 w-48 sm:w-64 mb-4 sm:mb-5 rounded-full" />
        <Skeleton className="h-10 sm:h-11 w-40 sm:w-60 rounded-full" />
      </div>

      {/* Month Navigator */}
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <Skeleton className="h-10 w-10 sm:h-11 sm:w-11 rounded-full" />
        <Skeleton className="h-10 w-32 sm:h-11 sm:w-48 rounded-full" />
        <Skeleton className="h-10 w-10 sm:h-11 sm:w-11 rounded-full" />
      </div>

      {/* Desktop Layout: Calendar + List */}
      <div className="hidden md:grid md:grid-cols-[1fr_400px] gap-8">
        {/* Calendar Grid */}
        <div>
          <div className="grid grid-cols-7 gap-2 mb-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="h-8 rounded-full" />
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 35 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-2xl" />
            ))}
          </div>
        </div>

        {/* Release List */}
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-4 p-3 rounded-2xl bg-[var(--color-surface)]">
              <Skeleton className="w-20 h-28 rounded-xl flex-shrink-0" />
              <div className="flex-1 space-y-2 py-1">
                <Skeleton className="h-5 w-3/4 rounded-md" />
                <Skeleton className="h-4 w-1/2 rounded-md" />
                <Skeleton className="h-4 w-full rounded-md" />
                <Skeleton className="h-4 w-2/3 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Layout: Vertical List */}
      <div className="md:hidden space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i}>
            <Skeleton className="h-4 w-24 mb-3 rounded-full" />
            <div className="space-y-2.5">
              {Array.from({ length: 2 }).map((_, j) => (
                <div key={j} className="flex gap-3 p-3 rounded-xl bg-[var(--color-surface)] shadow-sm">
                  <Skeleton className="w-16 h-24 rounded-lg flex-shrink-0" />
                  <div className="flex-1 space-y-2 py-0.5">
                    <Skeleton className="h-4 w-3/4 rounded-md" />
                    <Skeleton className="h-3 w-1/2 rounded-md" />
                    <Skeleton className="h-3 w-full rounded-md" />
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