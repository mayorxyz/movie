import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Bookmark, Film, Tv, Menu, X } from 'lucide-react';
import { site } from '../../config/site';
import { useState, useEffect } from 'react';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[var(--color-base)]/90 backdrop-blur-md border-b border-[var(--color-border)]'
          : 'bg-gradient-to-b from-black/60 to-transparent'
      }`}
    >
      <nav className="flex items-center justify-between h-16 px-4 md:px-8 lg:px-12 max-w-[1920px] mx-auto">
        <Link to="/" className="flex items-center gap-2 group">
          <Film className="w-6 h-6 text-[var(--color-accent)] group-hover:scale-110 transition-transform" />
          <span className="text-xl font-[var(--font-display)] font-bold text-[var(--color-text)] tracking-tight">
            {site.name}
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {site.nav.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === item.path || location.pathname.startsWith(item.path + '/')
                  ? 'text-[var(--color-accent)] bg-[var(--color-accent)]/10'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-raised)]'
              }`}
            >
              {item.label}
            </Link>
          ))}
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

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="md:hidden bg-[var(--color-base)]/95 backdrop-blur-md border-b border-[var(--color-border)]">
          <div className="flex flex-col p-4 gap-1">
            {site.nav.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === item.path || location.pathname.startsWith(item.path + '/')
                    ? 'text-[var(--color-accent)] bg-[var(--color-accent)]/10'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-raised)]'
                }`}
              >
                {item.label === 'Movies' && <Film className="w-4 h-4" />}
                {item.label === 'TV Shows' && <Tv className="w-4 h-4" />}
                {item.label === 'Search' && <Search className="w-4 h-4" />}
                {item.label === 'Watchlist' && <Bookmark className="w-4 h-4" />}
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
