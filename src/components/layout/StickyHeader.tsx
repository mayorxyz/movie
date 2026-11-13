import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, Film, Tv, Menu, X, User, Clock, ArrowLeft, Calendar, Bookmark } from 'lucide-react';
import { site } from '../../config/site';
import { features } from '../../config/features';
import { tmdbService } from '../../services/tmdbClient';
import type { SearchMultiResult } from '../../types';

interface StickyHeaderProps {
  searchInputRef?: React.RefObject<HTMLInputElement>;
}

const RECENT_SEARCHES_KEY = 'movievault-recent-searches';
const LEGACY_RECENT_SEARCHES_KEY = 'cinevault-recent-searches';
const SEARCH_DEBOUNCE_MS = 120;
const SEARCH_CACHE_LIMIT = 60;
const MAX_RESULTS = 10;

// One-time migration so saved searches survive the rebrand.
try {
  if (!localStorage.getItem(RECENT_SEARCHES_KEY)) {
    const legacy = localStorage.getItem(LEGACY_RECENT_SEARCHES_KEY);
    if (legacy) {
      localStorage.setItem(RECENT_SEARCHES_KEY, legacy);
      localStorage.removeItem(LEGACY_RECENT_SEARCHES_KEY);
    }
  }
} catch {
  /* storage unavailable */
}

const NAV_ITEMS = [
  { to: '/browse/movies', match: '/browse', label: 'Browse', icon: Film },
  { to: '/watchlist', match: '/watchlist', label: 'Collections', icon: Tv },
];

const MOBILE_NAV_ITEMS = [
  { to: '/browse/movies', match: '/browse/movies', label: 'Movies', icon: Film },
  { to: '/browse/tv', match: '/browse/tv', label: 'TV Shows', icon: Tv },
  { to: '/upcoming', match: '/upcoming', label: 'Upcoming', icon: Calendar },
  { to: '/watchlist', match: '/watchlist', label: 'Collections', icon: Bookmark },
];

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]';

const iconBtn = `w-11 h-11 inline-flex items-center justify-center rounded-full bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[var(--color-surface-raised)] active:scale-95 transition-colors duration-200 ${focusRing}`;

type SearchItem = SearchMultiResult & { profile_path?: string | null };

function readRecent(): string[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeRecent(list: string[]) {
  try {
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(list));
  } catch {
    /* storage unavailable */
  }
}

function resultTitle(result: SearchItem): string {
  return (result.title || result.name || '').trim();
}

/** Puts exact and prefix title matches ahead of fuzzy TMDB relevance. */
function rankResults(results: SearchItem[], query: string): SearchItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return results;
  const score = (result: SearchItem) => {
    const title = resultTitle(result).toLowerCase();
    if (title === q) return 0;
    if (title.startsWith(q)) return 1;
    if (title.split(/\s+/).some((word) => word.startsWith(q))) return 2;
    if (title.includes(q)) return 3;
    return 4;
  };
  return [...results].sort((a, b) => score(a) - score(b));
}

/** Highlights the typed fragment inside a result title without regex escaping. */
function Highlight({ text, query }: { text: string; query: string }) {
  const q = query.trim().toLowerCase();
  const index = q ? text.toLowerCase().indexOf(q) : -1;
  if (index === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, index)}
      <mark className="bg-transparent text-[var(--color-text)] font-semibold">
        {text.slice(index, index + q.length)}
      </mark>
      {text.slice(index + q.length)}
    </>
  );
}

/** Shared results list: recents, loading, empty, and result rows. Used by desktop dropdown and mobile overlay. */
function SearchPanel({
  query,
  results,
  isSearching,
  recent,
  onRecent,
  onClearRecent,
  onPick,
}: {
  query: string;
  results: SearchItem[];
  isSearching: boolean;
  recent: string[];
  onRecent: (term: string) => void;
  onClearRecent: () => void;
  onPick: (r: SearchItem) => void;
}) {
  if (!query.trim()) {
    if (recent.length === 0) {
      return <p className="p-4 text-sm text-[var(--color-text-muted)]">Search movies, series and people</p>;
    }
    return (
      <div className="p-3">
        <div className="flex items-center justify-between mb-2 px-1">
          <h3 className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-[0.1em]">
            Recent searches
          </h3>
          <button
            type="button"
            onClick={onClearRecent}
            className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] h-8 px-2"
          >
            Clear all
          </button>
        </div>
        <div className="space-y-1">
          {recent.map((term) => (
            <button
              key={term}
              type="button"
              onClick={() => onRecent(term)}
              className="w-full flex items-center justify-between gap-3 px-3 min-h-[44px] rounded-lg text-left hover:bg-[var(--color-surface-raised)] active:bg-[var(--color-surface-raised)] transition-colors text-sm text-[var(--color-text)]"
            >
              <span className="truncate">{term}</span>
              <Clock className="w-4 h-4 shrink-0 text-[var(--color-text-muted)]" />
            </button>
          ))}
        </div>
      </div>
    );
  }

  const q = query.trim().toLowerCase();
  const recentSuggestions = recent
    .filter((term) => term.toLowerCase() !== q && term.toLowerCase().includes(q))
    .slice(0, 3);

  if (isSearching && results.length === 0) {
    return (
      <div className="p-2 space-y-1" aria-busy="true">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-3 py-2">
            <div className="w-10 h-14 rounded-[10px] bg-[var(--color-surface)] animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-2/3 rounded bg-[var(--color-surface)] animate-pulse" />
              <div className="h-3 w-1/4 rounded bg-[var(--color-surface)] animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!isSearching && results.length === 0) {
    return (
      <div className="p-3">
        {recentSuggestions.length > 0 && (
          <div className="space-y-1 mb-2">
            {recentSuggestions.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => onRecent(term)}
                className="w-full flex items-center gap-3 px-3 min-h-[44px] rounded-lg text-left hover:bg-[var(--color-surface-raised)] active:bg-[var(--color-surface-raised)] transition-colors text-sm text-[var(--color-text)]"
              >
                <Clock className="w-4 h-4 shrink-0 text-[var(--color-text-muted)]" />
                <span className="truncate">{term}</span>
              </button>
            ))}
          </div>
        )}
        <p className="px-1 text-sm text-[var(--color-text-muted)]">No results found</p>
      </div>
    );
  }

  return (
    <div className="p-2 space-y-1">
      {isSearching && (
        <p className="px-3 pb-1 text-[11px] uppercase tracking-[0.1em] text-[var(--color-text-muted)] animate-pulse">
          Searching…
        </p>
      )}
      {!isSearching && recentSuggestions.length > 0 && (
        <div className="pb-1">
          <p className="px-3 py-1 text-[11px] uppercase tracking-[0.1em] text-[var(--color-text-muted)]">
            Suggestions
          </p>
          {recentSuggestions.map((term) => (
            <button
              key={term}
              type="button"
              onClick={() => onRecent(term)}
              className="w-full flex items-center gap-3 px-3 min-h-[44px] rounded-lg text-left hover:bg-[var(--color-surface-raised)] active:bg-[var(--color-surface-raised)] transition-colors text-sm text-[var(--color-text)]"
            >
              <Clock className="w-4 h-4 shrink-0 text-[var(--color-text-muted)]" />
              <span className="truncate">{term}</span>
            </button>
          ))}
        </div>
      )}
      {results.map((result, index) => {
        const isMovie = result.media_type === 'movie';
        const isPerson = result.media_type === 'person';
        const title = resultTitle(result);
        const year = isPerson ? '' : (isMovie ? result.release_date : result.first_air_date)?.slice(0, 4);
        const img = result.poster_path || result.profile_path || result.backdrop_path;
        const kind = isPerson ? 'Person' : isMovie ? 'Movie' : 'Series';
        return (
          <button
            key={`${result.media_type}-${result.id}`}
            type="button"
            onClick={() => onPick(result)}
            className="w-full flex items-center gap-3 px-3 py-2 min-h-[64px] rounded-lg text-left hover:bg-[var(--color-surface-raised)] active:bg-[var(--color-surface-raised)] transition-colors"
          >
            {img ? (
              <img
                src={img}
                alt=""
                loading="lazy"
                className="w-10 h-14 shrink-0 rounded-[10px] object-cover bg-[var(--color-surface)]"
              />
            ) : (
              <div className="w-10 h-14 shrink-0 rounded-[10px] bg-[var(--color-surface)] flex items-center justify-center text-[var(--color-text-muted)]">
                <Search className="w-4 h-4" strokeWidth={1.75} />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-[var(--color-text)] truncate">
                <Highlight text={title} query={query} />
              </p>
              <p className="text-xs text-[var(--color-text-muted)] truncate">
                {kind}
                {year ? ` · ${year}` : ''}
              </p>
            </div>
            {index === 0 && !isSearching && (
              <span className="shrink-0 text-[10px] uppercase tracking-[0.08em] text-[var(--color-text-muted)] bg-[var(--color-surface)] rounded-full px-2 py-1">
                Top result
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function StickyHeader({ searchInputRef }: StickyHeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false); // desktop dropdown
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false); // mobile full-screen overlay
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => readRecent());
  const desktopInputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);
  const ref = searchInputRef || desktopInputRef;
  const location = useLocation();
  const navigate = useNavigate();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const requestId = useRef(0);
  const abortRef = useRef<AbortController | null>(null);
  const searchCache = useRef(new Map<string, SearchItem[]>());

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close everything on navigation
  useEffect(() => {
    setMobileOpen(false);
    setMobileSearchOpen(false);
    setSearchOpen(false);
  }, [location]);

  useEffect(
    () => () => {
      clearTimeout(debounceRef.current);
      abortRef.current?.abort();
    },
    [],
  );

  // Lock page scroll while the dropdown or mobile search is open; Escape closes the top layer
  const overlayOpen = mobileOpen || mobileSearchOpen;
  useEffect(() => {
    if (!overlayOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (mobileSearchOpen) setMobileSearchOpen(false);
      else setMobileOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [overlayOpen, mobileSearchOpen]);

  // Escape closes the desktop dropdown
  useEffect(() => {
    if (!searchOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSearchOpen(false);
        ref.current?.blur();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [searchOpen, ref]);

  const addRecentSearch = useCallback((query: string) => {
    const q = query.trim();
    if (!q) return;
    const next = [q, ...readRecent().filter((s) => s !== q)].slice(0, 10);
    writeRecent(next);
    setRecentSearches(next);
  }, []);

  const clearRecent = () => {
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch {
      /* ignore */
    }
    setRecentSearches([]);
  };

  const cacheResults = useCallback((key: string, results: SearchItem[]) => {
    const cache = searchCache.current;
    cache.delete(key);
    cache.set(key, results);
    while (cache.size > SEARCH_CACHE_LIMIT) {
      const oldest = cache.keys().next().value;
      if (oldest === undefined) break;
      cache.delete(oldest);
    }
  }, []);

  const runSearch = useCallback(
    async (value: string) => {
      const q = value.trim();
      if (!q) return;
      const key = q.toLowerCase();

      const cached = searchCache.current.get(key);
      if (cached) {
        requestId.current++;
        abortRef.current?.abort();
        setSearchResults(cached);
        setIsSearching(false);
        return;
      }

      const id = ++requestId.current;
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setIsSearching(true);
      try {
        const response = await tmdbService.searchMulti(q, { signal: controller.signal });
        if (id !== requestId.current) return; // stale response
        const results = rankResults((response.results ?? []) as unknown as SearchItem[], q).slice(0, MAX_RESULTS);
        cacheResults(key, results);
        setSearchResults(results);
      } catch (error) {
        if ((error as { name?: string })?.name === 'AbortError') return;
        if (id === requestId.current) setSearchResults([]);
      } finally {
        if (id === requestId.current) setIsSearching(false);
      }
    },
    [cacheResults],
  );

  const debouncedSearch = useCallback(
    (value: string) => {
      clearTimeout(debounceRef.current);
      const q = value.trim();
      if (!q) {
        requestId.current++;
        abortRef.current?.abort();
        setSearchResults([]);
        setIsSearching(false);
        return;
      }
      const cached = searchCache.current.get(q.toLowerCase());
      if (cached) {
        requestId.current++;
        abortRef.current?.abort();
        setSearchResults(cached);
        setIsSearching(false);
        return;
      }
      setIsSearching(true);
      debounceRef.current = setTimeout(() => runSearch(value), SEARCH_DEBOUNCE_MS);
    },
    [runSearch],
  );

  const handleQueryChange = (value: string) => {
    setSearchQuery(value);
    debouncedSearch(value);
  };

  const handleSearchClear = (inputRef: React.RefObject<HTMLInputElement>) => {
    setSearchQuery('');
    debouncedSearch('');
    inputRef.current?.focus();
  };

  const handleRecentClick = (term: string) => {
    setSearchQuery(term);
    addRecentSearch(term);
    clearTimeout(debounceRef.current);
    runSearch(term);
  };

  const handleResultClick = (result: SearchItem) => {
    setSearchOpen(false);
    setMobileSearchOpen(false);
    addRecentSearch(searchQuery || result.title || result.name || '');
    if (result.media_type === 'movie') navigate(`/movie/${result.id}`);
    else if (result.media_type === 'tv') navigate(`/tv/${result.id}`);
    else navigate(`/person/${result.id}`);
  };

  /** Enter jumps straight to the top match while it is already showing. */
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchResults.length > 0 && !isSearching) {
      e.preventDefault();
      handleResultClick(searchResults[0]);
    }
  };

  const openMobileSearch = () => {
    setMobileOpen(false);
    setMobileSearchOpen(true);
  };

  const closeMobileSearch = () => setMobileSearchOpen(false);

  const panelProps = {
    query: searchQuery,
    results: searchResults,
    isSearching,
    recent: recentSearches,
    onRecent: handleRecentClick,
    onClearRecent: clearRecent,
    onPick: handleResultClick,
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 pt-[env(safe-area-inset-top)] transition-[background-color,box-shadow,backdrop-filter] duration-200 ${
          scrolled
            ? 'bg-[var(--color-panel)]/90 backdrop-blur-md shadow-[0_8px_24px_rgba(0,0,0,0.35)]'
            : 'bg-gradient-to-b from-black/60 to-transparent'
        }`}
      >
        <nav className="flex items-center justify-between gap-3 h-14 md:h-[72px] pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] md:px-8 lg:px-12 max-w-[1920px] mx-auto">
          <Link
            to="/"
            className={`flex items-center gap-2 h-11 rounded-full pr-2 min-w-0 ${focusRing}`}
            aria-label={`${site.name} home`}
          >
            <span className="text-[18px] md:text-[20px] font-bold text-[var(--color-text)] tracking-tight truncate">
              {site.name}
              <span className="text-[var(--color-accent)]">.</span>
            </span>
          </Link>

          {/* Search, desktop */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-8">
            <div className="relative w-full">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)] pointer-events-none"
                strokeWidth={1.75}
              />
              <input
                ref={ref}
                type="search"
                placeholder="Search everything"
                aria-label="Search everything"
                autoComplete="off"
                value={searchQuery}
                onChange={(e) => handleQueryChange(e.target.value)}
                onKeyDown={handleInputKeyDown}
                onFocus={() => setSearchOpen(true)}
                onBlur={() => setSearchOpen(false)}
                className="w-full h-11 pl-11 pr-11 rounded-full bg-[var(--color-surface)] text-[14px] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] hover:bg-[var(--color-surface-raised)] focus:bg-[var(--color-surface-raised)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] transition-colors duration-200 [&::-webkit-search-cancel-button]:appearance-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSearchClear(ref)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 inline-flex items-center justify-center rounded-full text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                >
                  <X className="w-4 h-4" strokeWidth={1.75} />
                </button>
              )}
              {searchOpen && (
                <div
                  onMouseDown={(e) => e.preventDefault()}
                  className="absolute top-full left-0 right-0 mt-1 z-[60] max-h-[400px] overflow-y-auto rounded-[20px] bg-[var(--color-panel)]/90 backdrop-blur-xl border border-[var(--color-border)] shadow-[0_20px_40px_rgba(0,0,0,0.5)]"
                >
                  <SearchPanel {...panelProps} />
                </div>
              )}
            </div>
          </div>

          {/* Actions, desktop */}
          <div className="hidden md:flex items-center gap-2">
            {NAV_ITEMS.map(({ to, match, label }) => {
              const active = location.pathname.startsWith(match);
              return (
                <Link
                  key={to}
                  to={to}
                  aria-current={active ? 'page' : undefined}
                  className={`px-6 h-11 inline-flex items-center justify-center rounded-full text-[14px] font-medium transition-colors duration-200 ${focusRing} ${
                    active
                      ? 'bg-[var(--color-surface-raised)] text-[var(--color-text)]'
                      : 'bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-raised)]'
                  }`}
                >
                  {label}
                </Link>
              );
            })}
            {features.accounts && (
              <button
                className={`px-6 h-11 inline-flex items-center justify-center rounded-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white text-[14px] font-semibold active:scale-[0.98] transition-colors duration-200 ${focusRing}`}
              >
                Sign in
              </button>
            )}
          </div>

          {/* Actions, mobile */}
          <div className="flex md:hidden items-center gap-2">
            <button className={iconBtn} onClick={openMobileSearch} aria-label="Search">
              <Search className="w-5 h-5" strokeWidth={1.75} />
            </button>
            <button
              className={iconBtn}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Open menu"
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
            >
              <Menu className="w-5 h-5" strokeWidth={1.75} />
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile search overlay */}
      <AnimatePresence>
        {mobileSearchOpen && (
          <motion.div
            className="md:hidden fixed inset-0 z-[70] bg-[var(--color-base)]/80 backdrop-blur-xl flex flex-col pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]"
            role="dialog"
            aria-modal="true"
            aria-label="Search"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.18 }}
          >
            <form
              className="flex items-center gap-2 h-14 pl-[max(0.75rem,env(safe-area-inset-left))] pr-[max(0.75rem,env(safe-area-inset-right))] bg-[var(--color-panel)]/80 backdrop-blur-md border-b border-[var(--color-border)]"
              onSubmit={(e) => {
                e.preventDefault();
                if (!searchQuery.trim()) return;
                addRecentSearch(searchQuery);
                clearTimeout(debounceRef.current);
                if (searchResults.length > 0 && !isSearching) {
                  handleResultClick(searchResults[0]);
                  return;
                }
                runSearch(searchQuery);
                mobileInputRef.current?.blur();
              }}
            >
              <button type="button" className={iconBtn} onClick={closeMobileSearch} aria-label="Close search">
                <ArrowLeft className="w-5 h-5" strokeWidth={1.75} />
              </button>
              <div className="relative flex-1">
                <input
                  ref={mobileInputRef}
                  type="search"
                  inputMode="search"
                  enterKeyHint="search"
                  autoFocus
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  placeholder="Search everything"
                  aria-label="Search everything"
                  value={searchQuery}
                  onChange={(e) => handleQueryChange(e.target.value)}
                  className="w-full h-11 pl-4 pr-11 rounded-full bg-[var(--color-surface)] text-[16px] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none [&::-webkit-search-cancel-button]:appearance-none"
                />
                {searchQuery && (
                  <button
                    type="button"
                    aria-label="Clear search"
                    onClick={() => handleSearchClear(mobileInputRef)}
                    className="absolute right-1 top-1/2 -translate-y-1/2 w-9 h-9 inline-flex items-center justify-center rounded-full text-[var(--color-text-muted)] active:text-[var(--color-text)]"
                  >
                    <X className="w-4 h-4" strokeWidth={1.75} />
                  </button>
                )}
              </div>
            </form>
            <div
              className="flex-1 overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch]"
              onClick={(e) => {
                if (!(e.target as HTMLElement).closest('button, a, input')) closeMobileSearch();
              }}
            >
              <SearchPanel {...panelProps} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile dropdown menu */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="md:hidden fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label="Menu" id="mobile-menu">
            <motion.button
              aria-label="Close menu"
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              className="absolute top-[calc(3.5rem+0.5rem)] left-4 right-4 bg-[var(--color-panel)]/95 backdrop-blur-xl border border-[var(--color-border)] rounded-[24px] shadow-[0_20px_40px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col pt-2 pb-3 px-2 z-10"
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-center justify-between px-3 py-2 mb-1 border-b border-[var(--color-border)]">
                <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--color-text-muted)]">Menu</span>
                <button
                  className="w-8 h-8 inline-flex items-center justify-center rounded-full text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface)]"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close menu"
                >
                  <X className="w-4 h-4" strokeWidth={1.75} />
                </button>
              </div>

              <div className="space-y-1 py-1">
                {MOBILE_NAV_ITEMS.map(({ to, match, label, icon: Icon }) => {
                  const active = location.pathname.startsWith(match);
                  return (
                    <Link
                      key={to}
                      to={to}
                      aria-current={active ? 'page' : undefined}
                      className={`flex items-center gap-3 h-12 px-3 rounded-xl text-[15px] font-medium transition-colors duration-200 ${focusRing} ${
                        active
                          ? 'bg-[var(--color-surface-raised)] text-[var(--color-text)]'
                          : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface)]'
                      }`}
                    >
                      <span
                        className={`w-7 h-7 rounded-full inline-flex items-center justify-center ${
                          active ? 'bg-[var(--color-accent)] text-white' : 'bg-[var(--color-surface)]'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" strokeWidth={1.75} />
                      </span>
                      {label}
                    </Link>
                  );
                })}
              </div>

              {features.accounts && (
                <div className="pt-2 mt-1 border-t border-[var(--color-border)]">
                  <button
                    className={`w-full h-11 inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white text-[15px] font-semibold active:scale-[0.98] transition-colors duration-200 ${focusRing}`}
                  >
                    <User className="w-4 h-4" strokeWidth={1.75} />
                    Sign in
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}