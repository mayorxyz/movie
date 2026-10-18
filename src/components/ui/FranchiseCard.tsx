import { Link } from 'react-router-dom';

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
      className="poster-card block group relative flex-shrink-0 w-[220px] md:w-[280px] rounded-lg overflow-hidden bg-[var(--color-surface)] border border-[var(--color-border)]"
      aria-label={`${franchise.name}, ${franchise.titleCount} titles, ${franchise.yearRange}, rated ${franchise.averageRating.toFixed(1)}`}
    >
      <div className="grid grid-cols-3 gap-1 p-2 aspect-[16/10]">
        {[0, 1, 2].map((i) => {
          const poster = franchise.posters[i];
          return (
            <div key={i} className="rounded overflow-hidden bg-[var(--color-surface-raised)] aspect-[2/3]">
              {poster ? (
                <img src={poster} alt="" aria-hidden="true" className="w-full h-full object-cover" loading="lazy" />
              ) : null}
            </div>
          );
        })}
      </div>
      <div className="px-3 pb-3">
        <h3 className="text-sm font-semibold text-[var(--color-text)] truncate group-hover:text-[var(--color-accent)] transition-colors">
          {franchise.name}
        </h3>
        <p className="text-xs text-[var(--color-text-muted)] mt-1">
          {franchise.titleCount} {franchise.titleCount === 1 ? 'title' : 'titles'}
          {franchise.yearRange ? ` · ${franchise.yearRange}` : ''} · ★ {franchise.averageRating.toFixed(1)}
        </p>
      </div>
    </Link>
  );
}

export function FranchiseSkeleton() {
  return (
    <div className="flex-shrink-0 w-[220px] md:w-[280px] rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)]" aria-hidden="true">
      <div className="grid grid-cols-3 gap-1 p-2 aspect-[16/10]">
        {[0, 1, 2].map((i) => (
          <div key={i} className="skeleton aspect-[2/3] rounded" />
        ))}
      </div>
      <div className="px-3 pb-3 space-y-2">
        <div className="skeleton h-4 w-3/4" />
        <div className="skeleton h-3 w-1/2" />
      </div>
    </div>
  );
}
