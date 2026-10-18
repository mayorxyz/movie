import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { WatchlistItem } from '../types';

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
      name: 'cinevault-watchlist',
    }
  )
);
