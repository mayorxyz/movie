import React from 'react';
import { Skeleton } from '../../components/ui/Skeleton';

export function SeriesPageSkeleton() {
  return (
    <div className="min-h-screen bg-[var(--color-base)]">
      {/* Hero Skeleton */}
      <div className="relative h-[60vh] min-h-[400px] max-h-[600px]">
        <Skeleton className="absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-base)] via-[var(--color-base)]/50 to-transparent" />
      </div>

      <div className="relative -mt-48 md:-mt-56 px-4 md:px-8 lg:px-12 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster Skeleton */}
          <div className="flex-shrink-0 w-48 md:w-64 mx-auto md:mx-0">
            <Skeleton className="w-full aspect-[2/3] rounded-lg" />
          </div>

          {/* Info Skeleton */}
          <div className="flex-1 min-w-0 space-y-4">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="flex gap-3">
              <Skeleton className="h-12 w-12 rounded-full" />
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-24" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-18 rounded-full" />
            </div>
            <div className="space-y-2 mt-6">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
            <div className="flex gap-3 mt-6">
              <Skeleton className="h-10 w-32 rounded-lg" />
              <Skeleton className="h-10 w-40 rounded-lg" />
              <Skeleton className="h-10 w-28 rounded-lg" />
            </div>
          </div>
        </div>

        {/* Next Episode Skeleton */}
        <div className="mt-8">
          <Skeleton className="h-20 w-full rounded-lg" />
        </div>

        {/* Cast Rail Skeleton */}
        <div className="mt-12">
          <Skeleton className="h-8 w-32 mb-4" />
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-28 md:w-32">
                <Skeleton className="aspect-[2/3] rounded-lg mb-2" />
                <Skeleton className="h-4 w-3/4 mb-1" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        </div>

        {/* Seasons & Episodes Skeleton */}
        <div className="mt-12">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-10 w-full mb-6" />
          <Skeleton className="h-32 w-full rounded-lg mb-4" />
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg mb-3" />
          ))}
        </div>

        {/* Similar Series Skeleton */}
        <div className="mt-12">
          <Skeleton className="h-8 w-40 mb-4" />
          <div className="flex gap-3 overflow-hidden">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-[140px] md:w-[180px]">
                <Skeleton className="aspect-[2/3] rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
