import React, { useEffect, useRef } from 'react';
import { Outlet } from 'react-router-dom';
import { StickyHeader } from './StickyHeader';
import { Footer } from './Footer';
import { ScrollToTop } from './ScrollToTop';
import { ScrollToTopButton } from './ScrollToTopButton';

export function Layout() {
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut: / to focus the header search bar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-base)]">
      <div className="film-grain" aria-hidden="true" />
      <ScrollToTop />
      <StickyHeader searchInputRef={searchInputRef} />
      <main className="flex-1 pt-14 md:pt-[72px]">
        <Outlet />
      </main>
      <Footer />
      <ScrollToTopButton />
    </div>
  );
}
