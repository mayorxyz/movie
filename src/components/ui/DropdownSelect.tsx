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
  }, []);

  const pick = (id: string | number) => {
    onChange(id);
    setIsOpen(false);
  };

  const renderOptions = () => (
    <div className="max-h-[300px] overflow-y-auto" role="listbox" id={listId} aria-label={label}>
      {options.map((option) => (
        <button
          key={option.id}
          onClick={() => pick(option.id)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              pick(option.id);
            }
          }}
          className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
            String(option.id) === String(value)
              ? 'bg-[var(--color-accent)] text-[var(--color-base)]'
              : 'text-[var(--color-text)] hover:bg-[var(--color-surface-raised)]'
          }`}
          role="option"
          aria-selected={String(option.id) === String(value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-sm text-[var(--color-text)] hover:border-[var(--color-text-muted)] transition-colors"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={listId}
      >
        <span className="text-[var(--color-text-muted)]">{label}:</span>
        <span className="font-medium">{selectedOption?.label}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="hidden md:block absolute top-full left-0 mt-2 min-w-[200px] rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xl z-50 overflow-hidden">
            {renderOptions()}
          </div>
          <div className="md:hidden fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={label}>
            <button aria-label="Close" className="absolute inset-0 bg-black/60" onClick={() => setIsOpen(false)} />
            <div className="absolute bottom-0 left-0 right-0 rounded-t-2xl bg-[var(--color-surface)] border-t border-[var(--color-border)] p-4 pb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-[var(--color-text)]">{label}</span>
                <button
                  onClick={() => setIsOpen(false)}
                  aria-label="Close options"
                  className="p-2 rounded-full hover:bg-[var(--color-surface-raised)]"
                >
                  <X className="w-4 h-4" />
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
