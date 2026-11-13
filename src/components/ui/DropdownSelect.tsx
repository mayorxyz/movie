import { useState, useRef, useEffect, useId } from 'react';
import { ChevronDown, X } from 'lucide-react';

interface DropdownSelectProps {
  label: string;
  options: { id: string | number; label: string }[];
  value: string | number;
  onChange: (value: string | number) => void;
}

export function DropdownSelect({ label, options, value, onChange }: DropdownSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const selectedOption = options.find((opt) => String(opt.id) === String(value));

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKey);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || window.innerWidth >= 768) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  const pick = (id: string | number) => {
    onChange(id);
    setIsOpen(false);
  };

  const renderOptions = () => (
    <div
      className="max-h-[42dvh] md:max-h-[260px] overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch] space-y-0.5"
      role="listbox"
      id={listId}
      aria-label={label}
    >
      {options.map((option) => {
        const selected = String(option.id) === String(value);
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => pick(option.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                pick(option.id);
              }
            }}
            role="option"
            aria-selected={selected}
            className={`w-full flex items-center justify-between gap-2.5 px-3 py-2 rounded-lg text-left text-[13px] transition-colors duration-150 hover:bg-[var(--color-surface)] active:bg-[var(--color-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] ${
              selected
                ? 'bg-[var(--color-surface)]/70 text-[var(--color-text)] font-medium'
                : 'text-[var(--color-text-muted)]'
            }`}
          >
            <span className="truncate">{option.label}</span>
            {selected && <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] shrink-0" />}
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="relative inline-block max-w-full min-w-0" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={listId}
        className="inline-flex max-w-full items-center gap-1.5 h-8 md:h-9 px-3 md:px-3.5 rounded-full bg-[var(--color-surface)] text-[12px] md:text-[13px] text-[var(--color-text)] hover:bg-[var(--color-surface-raised)] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] touch-manipulation"
      >
        <span className="shrink-0 text-[var(--color-text-muted)]">{label}:</span>
        <span className="max-w-[110px] sm:max-w-[150px] truncate font-medium">{selectedOption?.label}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 shrink-0 text-[var(--color-text-muted)] transition-transform duration-150 ${
            isOpen ? 'rotate-180' : ''
          }`}
          strokeWidth={1.75}
        />
      </button>

      {isOpen && (
        <>
          {/* Desktop popover */}
          <div className="hidden md:block absolute top-full right-0 mt-1.5 min-w-[175px] max-w-[230px] p-1 rounded-xl bg-[var(--color-surface-raised)] shadow-[0_20px_50px_rgba(0,0,0,0.6)] z-50">
            {renderOptions()}
          </div>

          {/* Mobile bottom sheet */}
          <div className="md:hidden fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-label={label}>
            <button
              type="button"
              aria-label="Close"
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute bottom-0 left-0 right-0 rounded-t-[20px] bg-[var(--color-surface-raised)] px-3.5 pt-2 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-[0_-16px_40px_rgba(0,0,0,0.5)]">
              <div className="w-8 h-1 rounded-full bg-[var(--color-border)] mx-auto mb-2" />
              <div className="flex items-center justify-between mb-1.5 px-1">
                <span className="text-[13px] font-semibold text-[var(--color-text)]">{label}</span>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close options"
                  className="w-7 h-7 inline-flex items-center justify-center rounded-full bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
                >
                  <X className="w-3.5 h-3.5" strokeWidth={1.75} />
                </button>
              </div>
              {renderOptions()}
            </div>
          </div>
        </>
      )}
    </div>
  );
}