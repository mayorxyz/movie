import React from 'react';
import { Play, Download, Bookmark, BookmarkCheck } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { site } from '../../config/site';
import { features } from '../../config/features';
import { useWatchlistStore } from '../../store/watchlist';
import type { TvSeries } from '../../types';

interface ActionRowProps {
  series: TvSeries;
  onTrailerClick: () => void;
  released?: boolean;
}

export function ActionRow({ series, onTrailerClick, released = true }: ActionRowProps) {
  const { addItem, removeItem, isInWatchlist } = useWatchlistStore();
  const inWatchlist = isInWatchlist(series.id, 'tv');

  const handleWatchlistToggle = () => {
    if (inWatchlist) {
      removeItem(series.id, 'tv');
    } else {
      addItem({
        id: series.id,
        mediaType: 'tv',
        title: series.name,
        posterPath: series.poster_path || undefined,
        backdropPath: series.backdrop_path || undefined,
        voteAverage: series.vote_average,
        releaseDate: series.first_air_date,
        addedAt: Date.now(),
      });
    }
  };

  const hasTrailer = features.trailers && (series as any).videos?.results?.some(
    (v: any) => v.site === 'YouTube' && v.type === 'Trailer'
  );

  return (
    <div className="flex flex-wrap items-center gap-3 mt-6">
      {/* Trailer button */}
      {hasTrailer && (
        <Button variant="primary" size="md" onClick={onTrailerClick}>
          <Play className="w-4 h-4 mr-2" />
          {site.copy.trailer}
        </Button>
      )}

      {/* Watchlist button */}
      <Button
        variant={inWatchlist ? 'secondary' : 'primary'}
        size="md"
        onClick={handleWatchlistToggle}
      >
        {inWatchlist ? <BookmarkCheck className="w-4 h-4 mr-2" /> : <Bookmark className="w-4 h-4 mr-2" />}
        {inWatchlist ? site.copy.inWatchlist : site.copy.addToWatchlist}
      </Button>

      {/* Stream button (disabled) */}
      {released && (
        <Button variant="secondary" size="md" comingSoon featureFlag="streamButton">
          <Play className="w-4 h-4 mr-2" />
          {site.copy.watch}
        </Button>
      )}

      {/* Download button (disabled) */}
      {released && (
        <Button variant="secondary" size="md" comingSoon featureFlag="downloadButton">
          <Download className="w-4 h-4 mr-2" />
          {site.copy.download}
        </Button>
      )}
    </div>
  );
}
