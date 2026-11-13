import React from 'react';
import { Link } from 'react-router-dom';
import { Lock, Bookmark, Sparkles } from 'lucide-react';
import { Button } from './Button';
import { features } from '../../config/features';
import { useWatchlistStore } from '../../store/watchlist';

const shell = 'mx-4 md:mx-8 lg:mx-12 my-8 p-8 md:p-12 rounded-[20px] bg-[var(--color-surface)]';

function IconDisc({ children, accent = false }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <span
      className={`mx-auto mb-5 w-14 h-14 rounded-full flex items-center justify-center ${
        accent ? 'bg-[var(--color-accent)] text-white' : 'bg-[var(--color-surface-raised)] text-[var(--color-text-muted)]'
      }`}
    >
      {children}
    </span>
  );
}

export function RecommendationsBanner() {
  const { items } = useWatchlistStore();
  const hasWatchlist = items.length > 0;

  // Accounts off, empty watchlist
  if (!features.accounts && !hasWatchlist) {
    return (
      <div className={`${shell} text-center`}>
        <IconDisc>
          <Bookmark className="w-6 h-6" strokeWidth={1.75} />
        </IconDisc>
        <h3 className="text-[20px] font-semibold text-[var(--color-text)] mb-2">Add titles to your watchlist</h3>
        <p className="text-[14px] text-[var(--color-text-muted)] mb-6 max-w-md mx-auto">
          Start building your watchlist to get personalized recommendations based on your taste.
        </p>
        <Link to="/browse/movies">
          <Button variant="primary">Browse Movies</Button>
        </Link>
      </div>
    );
  }

  // Accounts off, has watchlist
  if (!features.accounts && hasWatchlist) {
    return (
      <div className={`${shell} flex flex-col md:flex-row md:items-center gap-6`}>
        <IconDisc accent>
          <Sparkles className="w-6 h-6" strokeWidth={1.75} />
        </IconDisc>
        <div className="flex-1 text-center md:text-left">
          <h3 className="text-[24px] leading-tight text-[var(--color-text)] mb-2">
            <span className="font-light">Your next </span>
            <span className="font-bold uppercase">watch</span>
          </h3>
          <p className="text-[14px] text-[var(--color-text-muted)]">
            Based on your watchlist, we think you'll love these titles.
          </p>
        </div>
        <Link to="/browse/movies" className="self-center">
          <Button variant="primary">Discover More</Button>
        </Link>
      </div>
    );
  }

  // Accounts on
  if (features.accounts) {
    return (
      <div className={`${shell} text-center`}>
        <IconDisc>
          <Lock className="w-6 h-6" strokeWidth={1.75} />
        </IconDisc>
        <h3 className="text-[20px] font-semibold text-[var(--color-text)] mb-2">
          Sign in for personalized recommendations
        </h3>
        <p className="text-[14px] text-[var(--color-text-muted)] mb-6 max-w-md mx-auto">
          Create an account to get recommendations tailored to your taste.
        </p>
        <Button variant="primary">Sign In</Button>
      </div>
    );
  }

  return null;
}