import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { mediaPresets } from '../config/mediaPresets';
import type { TmdbFilter } from '../types/filter';
import type { MediaPresetId } from '../config/mediaPresets';

interface HomeFiltersState {
  globalType: MediaPresetId;
  setGlobalType: (type: MediaPresetId) => void;
  getGlobalFilter: () => TmdbFilter;
}

export const useHomeFiltersStore = create<HomeFiltersState>()(
  persist(
    (set, get) => ({
      globalType: 'all',
      setGlobalType: (type) => set({ globalType: type }),
      getGlobalFilter: () => {
        const { globalType } = get();
        return mediaPresets[globalType]?.filter || {};
      },
    }),
    {
      name: 'movievault-home-filters',
      partialize: (state) => ({ globalType: state.globalType }),
      merge: (persisted, current) => {
        const saved = persisted as Partial<HomeFiltersState> | undefined;
        const globalType = saved?.globalType;
        return globalType && mediaPresets[globalType]
          ? { ...current, globalType }
          : current;
      },
    },
  ),
);
