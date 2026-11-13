import React from 'react';
import { Link } from 'react-router-dom';
import { Film } from 'lucide-react';
import { site } from '../../config/site';

export function Footer() {
  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-base)] mt-10 md:mt-16 pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-6 md:py-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link to="/" className="inline-flex items-center gap-2 self-start">
            <Film className="w-4 h-4 md:w-5 md:h-5 text-[var(--color-accent)]" strokeWidth={1.75} />
            <span className="text-base md:text-lg font-[var(--font-display)] font-bold text-[var(--color-text)] tracking-tight">
              {site.name}
              <span className="text-[var(--color-accent)]">.</span>
            </span>
          </Link>

          <nav aria-label="Footer navigation" className="flex flex-wrap items-center gap-x-5 gap-y-1">
            {site.nav
              .filter((item) => item.path !== '/search')
              .map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="inline-flex items-center min-h-[36px] text-xs md:text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            <Link
              to="/about"
              className="inline-flex items-center min-h-[36px] text-xs md:text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
            >
              About
            </Link>
          </nav>
        </div>

        <div className="mt-4 pt-4 md:mt-6 md:pt-6 border-t border-[var(--color-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] md:text-xs text-[var(--color-text-muted)]">
          <p className="leading-relaxed max-w-2xl">
            {site.footer.tmdbAttribution}
          </p>
          <p className="shrink-0">
            {site.footer.copyright}
          </p>
        </div>
      </div>
    </footer>
  );
}