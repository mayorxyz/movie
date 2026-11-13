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

  const hasTrailer =
    features.trailers &&
    (series as any).videos?.results?.some((v: any) => v.site === 'YouTube' && v.type === 'Trailer');

  return (
    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 sm:gap-2.5">
      {hasTrailer && (
        <Button variant="primary" size="sm" onClick={onTrailerClick}>
          <Play className="w-3.5 h-3.5 fill-current" strokeWidth={1.75} />
          {site.copy.trailer}
        </Button>
      )}

      <Button
        variant={inWatchlist ? 'secondary' : 'primary'}
        size="sm"
        onClick={handleWatchlistToggle}
      >
        {inWatchlist ? (
          <BookmarkCheck className="w-3.5 h-3.5" strokeWidth={1.75} />
        ) : (
          <Bookmark className="w-3.5 h-3.5" strokeWidth={1.75} />
        )}
        {inWatchlist ? site.copy.inWatchlist : site.copy.addToWatchlist}
      </Button>

      {released && (
        <Button variant="secondary" size="sm" comingSoon featureFlag="streamButton">
          <Play className="w-3.5 h-3.5" strokeWidth={1.75} />
          {site.copy.watch}
        </Button>
      )}

      {released && (
        <Button variant="secondary" size="sm" comingSoon featureFlag="downloadButton">
          <Download className="w-3.5 h-3.5" strokeWidth={1.75} />
          {site.copy.download}
        </Button>
      )}
    </div>
  );
}