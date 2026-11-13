import { SegmentedTabs } from '../../components/ui/SegmentedTabs';
import { DropdownSelect } from '../../components/ui/DropdownSelect';
import { site } from '../../config/site';
import { today } from '../../lib/releaseFilters';
import type { Season } from '../../types';

interface SeasonSelectorProps {
  seasons: Season[];
  activeSeason: number;
  onSeasonChange: (season: number) => void;
}

export function SeasonSelector({ seasons, activeSeason, onSeasonChange }: SeasonSelectorProps) {
  const todayStr = today();
  
  // Filter logic remains robust: show unreleased only if they have scheduled episodes.
  const visibleSeasons = seasons.filter((s) => {
    if (s.air_date && s.air_date <= todayStr) return true;
    return s.episode_count > 0 && !!s.air_date;
  });

  // Order: Regular seasons first, Specials (S0) last.
  const regularSeasons = visibleSeasons.filter((s) => s.season_number > 0);
  const specialsSeason = visibleSeasons.find((s) => s.season_number === 0);
  const orderedSeasons = specialsSeason ? [...regularSeasons, specialsSeason] : regularSeasons;

  const tabs = orderedSeasons.map((season) => ({
    id: season.season_number.toString(),
    label:
      season.season_number === 0
        ? site.copy.specials
        : season.air_date && season.air_date > todayStr
        ? `${site.copy.season} ${season.season_number} (Upcoming)`
        : `${site.copy.season} ${season.season_number}`,
  }));

  const dropdownOptions = orderedSeasons.map((season) => ({
    id: season.season_number,
    label: `${
      season.season_number === 0
        ? site.copy.specials
        : `${site.copy.season} ${season.season_number}${season.air_date && season.air_date > todayStr ? ' (Upcoming)' : ''}`
    } (${season.episode_count} ${site.copy.episodes})`,
  }));

  // Use tabs for a cleaner, faster experience if the count is manageable.
  const useTabs = orderedSeasons.length <= 6;

  return (
    <div className="sticky top-[var(--nav-height, 4rem)] z-30 bg-[var(--color-bg)] border-b border-[var(--color-border)] py-4 md:py-3 -mx-4 px-4 md:mx-0 md:px-0">
      <div className="max-w-screen-xl mx-auto min-h-[48px] flex items-center">
        {useTabs ? (
          <SegmentedTabs
            tabs={tabs}
            activeTab={activeSeason.toString()}
            onChange={(id) => onSeasonChange(parseInt(id, 10))}
          />
        ) : (
          <DropdownSelect
            label={site.copy.season}
            options={dropdownOptions}
            value={activeSeason}
            onChange={(value) => onSeasonChange(typeof value === 'number' ? value : parseInt(value, 10))}
          />
        )}
      </div>
    </div>
  );
}