import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { Skeleton } from './Skeleton';

export interface FranchiseSummary {
  id: number;
  name: string;
  titleCount: number;
  yearRange: string;
  averageRating: number;
  posters: (string | null)[];
}

export function FranchiseCard({ franchise }: { franchise: FranchiseSummary }) {
  return (
    <Link
      to={`/browse/franchise-${franchise.id}`}
      aria-label={`${franchise.name}, ${franchise.titleCount} titles, ${franchise.yearRange}, rated ${franchise.averageRating.toFixed(1)}`}
      className="group block relative flex-shrink-0 w-[220px] md:w-[280px] rounded-[20px] overflow-hidden bg-[var(--color-surface)] hover:bg-[var(--color-surface-raised)] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)]"
    >
      <div className="grid grid-cols-3 gap-2 p-3">
        {[0, 1, 2].map((i) => {
          const poster = franchise.posters[i];
          return (
            <div key={i} className="rounded-xl overflow-hidden bg-[var(--color-surface-raised)] aspect-[2/3]">
              {poster ? (
                <img
                  src={poster}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                />
              ) : null}
            </div>
          );
        })}
      </div>
      <div className="px-4 pb-4">
        <h3 className="text-[14px] font-semibold text-[var(--color-text)] truncate">{franchise.name}</h3>
        <div className="flex items-center gap-2 mt-2 text-[12px] text-[var(--color-text-muted)]">
          <span>
            {franchise.titleCount} {franchise.titleCount === 1 ? 'title' : 'titles'}
            {franchise.yearRange ? ` · ${franchise.yearRange}` : ''}
          </span>
          {franchise.averageRating > 0 && (
            <span className="inline-flex items-center gap-1 tabular-nums">
              <Star className="w-3.5 h-3.5 fill-[var(--color-rating)] text-[var(--color-rating)]" strokeWidth={0} />
              {franchise.averageRating.toFixed(1)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export function FranchiseSkeleton() {
  return (
    <div className="flex-shrink-0 w-[220px] md:w-[280px] rounded-[20px] bg-[var(--color-surface)]" aria-hidden="true">
      <div className="grid grid-cols-3 gap-2 p-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="aspect-[2/3] rounded-xl" />
        ))}
      </div>
      <div className="px-4 pb-4 space-y-2">
        <Skeleton className="h-4 w-3/4 rounded-full" />
        <Skeleton className="h-3 w-1/2 rounded-full" />
      </div>
    </div>
  );
}