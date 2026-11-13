import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { WatchlistItem } from '../types';

const STORAGE_KEY = 'movievault-watchlist';
const LEGACY_KEY = 'cinevault-watchlist';

// One-time migration so existing saved collections survive the rebrand.
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

interface WatchlistState {
  items: WatchlistItem[];
  addItem: (item: WatchlistItem) => void;
  removeItem: (id: number, mediaType: 'movie' | 'tv') => void;
  isInWatchlist: (id: number, mediaType: 'movie' | 'tv') => boolean;
  clearWatchlist: () => void;
}

export const useWatchlistStore = create<WatchlistState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const items = get().items;
        if (!items.some(i => i.id === item.id && i.mediaType === item.mediaType)) {
          set({ items: [item, ...items] });
        }
      },
      removeItem: (id, mediaType) => {
        set({ items: get().items.filter(i => !(i.id === id && i.mediaType === mediaType)) });
      },
      isInWatchlist: (id, mediaType) => {
        return get().items.some(i => i.id === id && i.mediaType === mediaType);
      },
      clearWatchlist: () => set({ items: [] }),
    }),
    {
      name: STORAGE_KEY,
    }
  )
);
