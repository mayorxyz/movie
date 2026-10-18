import { useSearchParams } from 'react-router-dom';
import { useMemo } from 'react';
import type { TvSeries } from '../types';
import { today } from '../lib/releaseFilters';

interface UseSeriesFiltersResult {
  season: number;
  setSeason: (season: number) => void;
  sort: 'asc' | 'desc';
  setSort: (sort: 'asc' | 'desc') => void;
}

export function useSeriesFilters(series: TvSeries | undefined): UseSeriesFiltersResult {
  const [searchParams, setSearchParams] = useSearchParams();

  // Calculate default season: highest season >0 with air_date <= today and episode_count >0
  const defaultSeason = useMemo(() => {
    if (!series?.seasons || series.seasons.length === 0) return 1;

    const todayStr = today();
    const validSeasons = series.seasons
      .filter(s => s.season_number > 0) // Exclude season 0 (Specials)
      .filter(s => s.episode_count > 0)
      .filter(s => {
        if (!s.air_date) return false;
        return s.air_date <= todayStr;
      })
      .sort((a, b) => b.season_number - a.season_number); // Sort descending

    return validSeasons.length > 0 ? validSeasons[0].season_number : 1;
  }, [series]);

  // Get season from URL, validate it exists in series, fallback to default
  const seasonParam = searchParams.get('season');
  const season = useMemo(() => {
    if (!series?.seasons) return defaultSeason;
    
    if (seasonParam) {
      const seasonNum = parseInt(seasonParam, 10);
      if (!isNaN(seasonNum) && series.seasons.some(s => s.season_number === seasonNum)) {
        return seasonNum;
      }
    }
    
    return defaultSeason;
  }, [seasonParam, series, defaultSeason]);

  const setSeason = (newSeason: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('season', newSeason.toString());
    setSearchParams(params, { replace: true });
  };

  // Get sort from URL, default to 'asc'
  const sortParam = searchParams.get('sort');
  const sort: 'asc' | 'desc' = sortParam === 'desc' ? 'desc' : 'asc';

  const setSort = (newSort: 'asc' | 'desc') => {
    const params = new URLSearchParams(searchParams);
    params.set('sort', newSort);
    setSearchParams(params, { replace: true });
  };

  return { season, setSeason, sort, setSort };
}
