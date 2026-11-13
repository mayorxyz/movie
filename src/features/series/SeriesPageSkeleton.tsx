import { Skeleton } from '../../components/ui/Skeleton';

export function SeriesPageSkeleton() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Backdrop */}
      <div className="relative h-[320px] sm:h-[400px] md:h-[480px] lg:h-[560px]">
        <Skeleton className="absolute inset-0 rounded-none sm:rounded-none" />
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[var(--color-bg)] to-transparent" />
      </div>

      {/* Content Container */}
      <div className="relative -mt-32 sm:-mt-40 md:-mt-56 px-4 sm:px-6 md:px-8 lg:px-12 max-w-[1440px] mx-auto">
        <div className="flex flex-col md:flex-row gap-6 md:gap-10">
          
          {/* Poster */}
          <div className="flex-shrink-0 w-36 sm:w-48 md:w-60 mx-auto md:mx-0">
            <Skeleton className="w-full aspect-[2/3] rounded-xl sm:rounded-2xl" />
          </div>

          {/* Info Column */}
          <div className="flex-1 min-w-0 space-y-4 md:pt-24 text-center md:text-left">
            <Skeleton className="h-8 sm:h-10 md:h-14 w-3/4 mx-auto md:mx-0 rounded-lg" />
            <Skeleton className="h-4 w-1/2 mx-auto md:mx-0 rounded-md" />
            
            {/* Meta Data Row */}
            <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-6">
              <Skeleton className="h-[72px] w-[72px] rounded-full" />
              <Skeleton className="h-7 w-20 rounded-full" />
              <Skeleton className="h-7 w-24 rounded-full" />
            </div>

            {/* Genres Row */}
            <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-5">
              <Skeleton className="h-7 w-16 rounded-full" />
              <Skeleton className="h-7 w-20 rounded-full" />
              <Skeleton className="h-7 w-20 rounded-full" />
            </div>

            {/* Synopsis */}
            <div className="space-y-2 pt-4 max-w-2xl mx-auto md:mx-0">
              <Skeleton className="h-4 w-full rounded-md" />
              <Skeleton className="h-4 w-full rounded-md" />
              <Skeleton className="h-4 w-3/4 rounded-md" />
            </div>
          </div>
        </div>

        {/* Action Buttons / Stats */}
        <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-8">
          <Skeleton className="h-10 sm:h-11 w-32 rounded-full" />
          <Skeleton className="h-10 sm:h-11 w-44 rounded-full" />
          <Skeleton className="h-10 sm:h-11 w-28 rounded-full" />
        </div>

        {/* Next Episode Strip */}
        <Skeleton className="h-24 sm:h-28 w-full rounded-xl sm:rounded-2xl mt-8 sm:mt-10" />

        {/* Cast Section */}
        <div className="mt-12 sm:mt-14">
          <Skeleton className="h-6 sm:h-7 w-32 mb-4 sm:mb-5 rounded-full mx-auto md:mx-0" />
          <div className="flex gap-3 sm:gap-4 overflow-hidden">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-24 sm:w-28 md:w-36">
                <Skeleton className="aspect-[3/4] rounded-xl sm:rounded-2xl mb-3" />
                <Skeleton className="h-4 w-3/4 mb-1 rounded-md" />
                <Skeleton className="h-3 w-1/2 rounded-md" />
              </div>
            ))}
          </div>
        </div>

        {/* Episodes Section */}
        <div className="mt-12 sm:mt-14">
          <Skeleton className="h-6 sm:h-7 w-48 mb-4 sm:mb-5 rounded-full mx-auto md:mx-0" />
          <Skeleton className="h-10 sm:h-11 w-full mb-6 rounded-full" />
          <Skeleton className="h-32 w-full rounded-xl sm:rounded-2xl mb-4" />
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 sm:h-32 w-full rounded-xl sm:rounded-2xl mb-3" />
          ))}
        </div>

        {/* Recommendations / Similar */}
        <div className="mt-12 sm:mt-14">
          <Skeleton className="h-6 sm:h-7 w-40 mb-4 sm:mb-5 rounded-full mx-auto md:mx-0" />
          <div className="flex gap-3 sm:gap-4 overflow-hidden">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-[120px] sm:w-[140px] md:w-[180px]">
                <Skeleton className="aspect-[2/3] rounded-xl sm:rounded-[20px]" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}