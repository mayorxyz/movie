import React from 'react';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
}

export function Skeleton({ className = '', width, height }: SkeletonProps) {
  return <div className={`skeleton ${className}`} style={{ width, height }} aria-hidden="true" />;
}

// Poster plus caption lines, same footprint as PosterCard
export function PosterSkeleton() {
  return (
    <div className="w-full" aria-hidden="true">
      <Skeleton className="w-full aspect-[2/3] rounded-[20px]" />
      <div className="mt-3 px-1 space-y-2">
        <Skeleton className="h-4 w-3/4 rounded-full" />
        <div className="flex gap-2">
          <Skeleton className="h-7 w-14 rounded-full" />
          <Skeleton className="h-7 w-14 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function BackdropSkeleton() {
  return <Skeleton className="w-full aspect-video rounded-[20px]" />;
}

export function TextSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className="h-4 rounded-full" width={i === lines - 1 ? '60%' : '100%'} />
      ))}
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] px-4 md:px-8 lg:px-12 py-8">
      <div className="max-w-[1440px] mx-auto space-y-8">
        <Skeleton className="h-12 w-64 rounded-full" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-8">
          {Array.from({ length: 10 }).map((_, i) => (
            <PosterSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}