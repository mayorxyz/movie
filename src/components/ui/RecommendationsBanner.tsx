import React from 'react';
import { Link } from 'react-router-dom';
import { Lock, Bookmark } from 'lucide-react';
import { Button } from './Button';
import { features } from '../../config/features';
import { useWatchlistStore } from '../../store/watchlist';

export function RecommendationsBanner() {
  const { items } = useWatchlistStore();
  const hasWatchlist = items.length > 0;

  // If accounts are off and no watchlist, show empty state
  if (!features.accounts && !hasWatchlist) {
    return (
      <div className="mx-4 md:mx-8 lg:mx-12 my-8 p-8 md:p-12 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-center">
        <Bookmark className="w-12 h-12 text-[var(--color-accent)] mx-auto mb-4 opacity-50" />
        <h3 className="text-xl font-[var(--font-display)] font-semibold text-[var(--color-text)] mb-2">
          Add titles to your watchlist
        </h3>
        <p className="text-sm text-[var(--color-text-muted)] mb-6 max-w-md mx-auto">
          Start building your watchlist to get personalized recommendations based on your taste.
        </p>
        <Link to="/browse/movies">
          <Button variant="primary">Browse Movies</Button>
        </Link>
      </div>
    );
  }

  // If accounts are off but has watchlist, show recommendations
  if (!features.accounts && hasWatchlist) {
    return (
      <div className="mx-4 md:mx-8 lg:mx-12 my-8 p-8 md:p-12 rounded-xl bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-surface-raised)] border border-[var(--color-border)]">
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <h3 className="text-xl md:text-2xl font-[var(--font-display)] font-semibold text-[var(--color-text)] mb-2">
              Your Next Watch
            </h3>
            <p className="text-sm text-[var(--color-text-muted)] mb-6">
              Based on your watchlist, we think you'll love these titles.
            </p>
            <Link to="/browse/movies">
              <Button variant="primary">Discover More</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // If accounts are on, show sign-in prompt
  if (features.accounts) {
    return (
      <div className="mx-4 md:mx-8 lg:mx-12 my-8 p-8 md:p-12 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-center">
        <Lock className="w-12 h-12 text-[var(--color-text-muted)] mx-auto mb-4 opacity-50" />
        <h3 className="text-xl font-[var(--font-display)] font-semibold text-[var(--color-text)] mb-2">
          Sign in for personalized recommendations
        </h3>
        <p className="text-sm text-[var(--color-text-muted)] mb-6 max-w-md mx-auto">
          Create an account to get recommendations tailored to your taste.
        </p>
        <Button variant="primary">Sign In</Button>
      </div>
    );
  }

  return null;
}
