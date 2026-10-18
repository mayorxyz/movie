import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Film, Tv, Menu, X, User } from 'lucide-react';
import { site } from '../../config/site';
import { features } from '../../config/features';
import { globalFilterChips } from '../../config/mediaPresets';
import { useHomeFiltersStore } from '../../store/homeFilters';
import type { MediaPresetId } from '../../config/mediaPresets';

interface StickyHeaderProps {
  showChips?: boolean;
}

export function StickyHeader({ showChips = false }: StickyHeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { globalType, setGlobalType } = useHomeFiltersStore();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  const handleChipChange = (type: MediaPresetId) => {
    setGlobalType(type);
    // Update URL param
    const params = new URLSearchParams(location.search);
    if (type === 'all') {
      params.delete('type');
    } else {
      params.set('type', type);
    }
    navigate({ search: params.toString() }, { replace: true });
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[var(--color-base)]/90 backdrop-blur-md border-b border-[var(--color-border)]'
          : 'bg-gradient-to-b from-black/60 to-transparent'
      }`}
    >
      {/* Row 1: Logo, Search, Actions */}
      <nav className="flex items-center justify-between h-16 px-4 md:px-8 lg:px-12 max-w-[1920px] mx-auto">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <Film className="w-6 h-6 text-[var(--color-accent)] group-hover:scale-110 transition-transform" />
          <span className="text-xl font-[var(--font-display)] font-bold text-[var(--color-text)] tracking-tight">
            {site.name}
          </span>
        </Link>

        {/* Search Input (wide, centered) */}
        <div className="hidden md:flex flex-1 max-w-2xl mx-8">
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)]" />
            <input
              type="text"
              placeholder="Search movies, TV shows, people..."
              onFocus={() => navigate('/search')}
              className="w-full pl-12 pr-4 py-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent)] outline-none transition-colors"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-2">
          <Link
            to="/browse/movies"
            className="px-4 py-2 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] text-sm font-medium text-[var(--color-text)] hover:border-[var(--color-text-muted)] transition-colors"
          >
            Browse
          </Link>
          <Link
            to="/watchlist"
            className="px-4 py-2 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] text-sm font-medium text-[var(--color-text)] hover:border-[var(--color-text-muted)] transition-colors"
          >
            Collections
          </Link>
          {features.accounts && (
            <button className="px-4 py-2 rounded-full bg-[var(--color-accent)] text-[var(--color-base)] text-sm font-medium hover:bg-[var(--color-accent-hover)] transition-colors">
              Sign in
            </button>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 text-[var(--color-text)]"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* Row 2: Global Filter Chips (opt-in per route) */}
      {showChips && (
        <div className="px-4 md:px-8 lg:px-12 pb-3 max-w-[1920px] mx-auto">
          <div className="flex gap-2 overflow-x-auto rail-scroll">
            {globalFilterChips.map(chip => (
              <button
                key={chip.id}
                onClick={() => handleChipChange(chip.id as MediaPresetId)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  globalType === chip.id
                    ? 'bg-[var(--color-accent)] text-[var(--color-base)]'
                    : 'bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:border-[var(--color-text-muted)]'
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="md:hidden bg-[var(--color-base)]/95 backdrop-blur-md border-b border-[var(--color-border)]">
          <div className="flex flex-col p-4 gap-1">
            <Link
              to="/browse/movies"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-raised)]"
            >
              <Film className="w-4 h-4" />
              Browse
            </Link>
            <Link
              to="/watchlist"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-raised)]"
            >
              <Tv className="w-4 h-4" />
              Collections
            </Link>
            {features.accounts && (
              <button className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-raised)]">
                <User className="w-4 h-4" />
                Sign in
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
