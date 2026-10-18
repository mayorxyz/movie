import React from 'react';
import { SegmentedTabs } from '../../components/ui/SegmentedTabs';
import { DropdownSelect } from '../../components/ui/DropdownSelect';
import { site } from '../../config/site';
import type { Season } from '../../types';

interface SeasonSelectorProps {
  seasons: Season[];
  activeSeason: number;
  onSeasonChange: (season: number) => void;
}

export function SeasonSelector({ seasons, activeSeason, onSeasonChange }: SeasonSelectorProps) {
  // Filter out season 0, then add it back at the end if it exists
  const regularSeasons = seasons.filter(s => s.season_number > 0);
  const specialsSeason = seasons.find(s => s.season_number === 0);
  
  const orderedSeasons = specialsSeason 
    ? [...regularSeasons, specialsSeason]
    : regularSeasons;

  // Build tabs/dropdown options
  const tabs = orderedSeasons.map(season => ({
    id: season.season_number.toString(),
    label: season.season_number === 0 
      ? site.copy.specials 
      : `${site.copy.season} ${season.season_number}`,
  }));

  const dropdownOptions = orderedSeasons.map(season => ({
    id: season.season_number,
    label: `${season.season_number === 0 ? site.copy.specials : `${site.copy.season} ${season.season_number}`} (${season.episode_count} ${site.copy.episodes})`,
  }));

  const useTabs = orderedSeasons.length <= 6;

  return (
    <div className="sticky top-16 z-30 bg-[var(--color-base)] py-3 -mx-4 px-4 md:-mx-0 md:px-0 border-b border-[var(--color-border)] md:border-0">
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
  );
}
