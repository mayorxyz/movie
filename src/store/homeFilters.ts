import { create } from 'zustand';
import { mediaPresets } from '../config/mediaPresets';
import type { TmdbFilter } from '../types/filter';
import type { MediaPresetId } from '../config/mediaPresets';

interface HomeFiltersState {
  globalType: MediaPresetId;
  setGlobalType: (type: MediaPresetId) => void;
  getGlobalFilter: () => TmdbFilter;
}

export const useHomeFiltersStore = create<HomeFiltersState>((set, get) => ({
  globalType: 'all',
  setGlobalType: (type) => set({ globalType: type }),
  getGlobalFilter: () => {
    const { globalType } = get();
    return mediaPresets[globalType]?.filter || {};
  },
}));
