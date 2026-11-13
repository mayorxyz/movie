import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const STORAGE_KEY = 'movievault-watched';
const LEGACY_KEY = 'cinevault-watched';

// One-time migration so existing watched history survives the rebrand.
try {
  if (!localStorage.getItem(STORAGE_KEY)) {
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy) {
      localStorage.setItem(STORAGE_KEY, legacy);
      localStorage.removeItem(LEGACY_KEY);
    }
  }
} catch {
  /* storage unavailable */
}

interface WatchedState {
  watchedIds: string[];
  markWatched: (id: number, mediaType: 'movie' | 'tv') => void;
  unmarkWatched: (id: number, mediaType: 'movie' | 'tv') => void;
  isWatched: (id: number, mediaType: 'movie' | 'tv') => boolean;
}

export const useWatchedStore = create<WatchedState>()(
  persist(
    (set, get) => ({
      watchedIds: [],
      markWatched: (id, mediaType) => {
        const key = `${mediaType}-${id}`;
        const watchedIds = get().watchedIds;
        if (!watchedIds.includes(key)) {
          set({ watchedIds: [...watchedIds, key] });
        }
      },
      unmarkWatched: (id, mediaType) => {
        const key = `${mediaType}-${id}`;
        set({ watchedIds: get().watchedIds.filter(id => id !== key) });
      },
      isWatched: (id, mediaType) => {
        const key = `${mediaType}-${id}`;
        return get().watchedIds.includes(key);
      },
    }),
    {
      name: STORAGE_KEY,
    }
  )
);
