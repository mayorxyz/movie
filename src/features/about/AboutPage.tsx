import React from 'react';
import { motion } from 'framer-motion';
import { Film } from 'lucide-react';
import { site } from '../../config/site';

export default function AboutPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="px-4 md:px-8 lg:px-12 max-w-3xl mx-auto py-16"
    >
      <div className="flex items-center gap-3 mb-8">
        <Film className="w-8 h-8 text-[var(--color-accent)]" />
        <h1 className="text-3xl md:text-4xl font-[var(--font-display)] font-bold text-[var(--color-text)]">
          About {site.name}
        </h1>
      </div>

      <div className="space-y-8 text-[var(--color-text)]">
        <section>
          <h2 className="text-xl font-[var(--font-display)] font-semibold mb-3 text-[var(--color-accent)]">
            What is {site.name}?
          </h2>
          <p className="text-sm leading-relaxed text-[var(--color-text-muted)]">
            {site.name} is a curated catalogue for discovering movies and TV shows. Browse trending titles, 
            explore by genre, and build your personal watchlist. We believe in the power of great storytelling 
            and want to make it easy to find your next favorite film or series.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-[var(--font-display)] font-semibold mb-3 text-[var(--color-accent)]">
            Features
          </h2>
          <ul className="space-y-2 text-sm text-[var(--color-text-muted)]">
            <li>• Browse thousands of movies and TV shows</li>
            <li>• Search by title, genre, or person</li>
            <li>• Build a personal watchlist (saved locally)</li>
            <li>• Discover trending and top-rated content</li>
            <li>• Detailed information including cast, synopsis, and ratings</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-[var(--font-display)] font-semibold mb-3 text-[var(--color-accent)]">
            Data & Attribution
          </h2>
          <div className="p-4 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)]">
            <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
              {site.footer.tmdbAttribution}
            </p>
            <div className="mt-4 flex items-center gap-3">
              <div className="w-16 h-8 bg-[var(--color-surface-raised)] rounded flex items-center justify-center text-xs text-[var(--color-text-muted)] border border-[var(--color-border)]">
                TMDB
              </div>
              <span className="text-xs text-[var(--color-text-muted)]">
                Powered by The Movie Database API
              </span>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-[var(--font-display)] font-semibold mb-3 text-[var(--color-accent)]">
            Coming Soon
          </h2>
          <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
            We're working on adding streaming integration, download options, user accounts with 
            cross-device watchlist sync, personalized recommendations, and more. Stay tuned!
          </p>
        </section>
      </div>
    </motion.div>
  );
}
