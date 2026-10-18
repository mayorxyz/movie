import React from 'react';
import { Link } from 'react-router-dom';
import { Film } from 'lucide-react';
import { site } from '../../config/site';

export function Footer() {
  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-base)] mt-16">
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="flex items-center gap-2">
            <Film className="w-5 h-5 text-[var(--color-accent)]" />
            <span className="text-lg font-[var(--font-display)] font-bold text-[var(--color-text)]">
              {site.name}
            </span>
          </div>
          
          <nav className="flex flex-wrap gap-6">
            {site.nav.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
              >
                {item.label}
              </Link>
            ))}
            <Link to="/about" className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">
              About
            </Link>
          </nav>
        </div>

        <div className="mt-8 pt-8 border-t border-[var(--color-border)]">
          <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
            {site.footer.tmdbAttribution}
          </p>
          <p className="text-xs text-[var(--color-text-muted)] mt-2">
            {site.footer.copyright}
          </p>
        </div>
      </div>
    </footer>
  );
}
