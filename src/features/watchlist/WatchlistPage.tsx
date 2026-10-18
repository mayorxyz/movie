import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bookmark, Trash2 } from 'lucide-react';
import { useWatchlistStore } from '../../store/watchlist';
import { PosterCard } from '../../components/ui/PosterCard';
import { Button } from '../../components/ui/Button';
import { features } from '../../config/features';

export default function WatchlistPage() {
  const { items, removeItem, clearWatchlist } = useWatchlistStore();

  if (!features.watchlist) {
    return (
      <div className="p-8 text-center">
        <p className="text-[var(--color-text-muted)]">Watchlist feature is currently disabled.</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="px-4 md:px-8 lg:px-12 max-w-[1920px] mx-auto py-8"
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-[var(--font-display)] font-bold text-[var(--color-text)] flex items-center gap-3">
            <Bookmark className="w-8 h-8 text-[var(--color-accent)]" />
            My Watchlist
          </h1>
          {items.length > 0 && (
            <p className="text-sm text-[var(--color-text-muted)] mt-1">{items.length} title{items.length !== 1 ? 's' : ''}</p>
          )}
        </div>
        {items.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clearWatchlist}>
            <Trash2 className="w-4 h-4 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16">
          <Bookmark className="w-16 h-16 text-[var(--color-text-muted)] mx-auto mb-4 opacity-30" />
          <p className="text-lg text-[var(--color-text)] mb-2">Your watchlist is empty</p>
          <p className="text-sm text-[var(--color-text-muted)] mb-6">
            Browse movies and TV shows to add titles to your watchlist
          </p>
          <Link to="/browse/movies">
            <Button variant="primary">Browse Movies</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {items.map(item => (
            <div key={`${item.mediaType}-${item.id}`} className="relative group">
              <PosterCard
                id={item.id}
                title={item.title}
                posterPath={item.posterPath || null}
                voteAverage={item.voteAverage}
                releaseDate={item.releaseDate}
                mediaType={item.mediaType}
              />
              <button
                onClick={() => removeItem(item.id, item.mediaType)}
                className="absolute top-2 left-2 p-1.5 rounded-full bg-black/60 text-[var(--color-text)] opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[var(--color-error)]"
                aria-label={`Remove ${item.title} from watchlist`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Future sync notice */}
      <div className="mt-12 p-4 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)]">
        <p className="text-xs text-[var(--color-text-muted)]">
          💾 Your watchlist is saved locally on this device. Account sync coming soon.
        </p>
      </div>
    </motion.div>
  );
}
