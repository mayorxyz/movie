import React, { useId } from 'react';
import { motion } from 'framer-motion';

interface SegmentedTabsProps {
  tabs: { id: string; label: string }[];
  activeTab: string;
  onChange: (tabId: string) => void;
}

export function SegmentedTabs({ tabs, activeTab, onChange }: SegmentedTabsProps) {
  const groupId = useId();

  return (
    <div
      className="rail-scroll inline-flex items-center gap-0.5 max-w-full overflow-x-auto no-scrollbar p-0.5 md:p-1 rounded-full bg-[var(--color-surface)] [overflow-scrolling:touch]"
      role="tablist"
      aria-label="Section options"
    >
      {tabs.map((tab) => {
        const active = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.id)}
            className="relative shrink-0 h-7 md:h-8 px-2.5 md:px-3.5 rounded-full text-[12px] md:text-[13px] font-medium whitespace-nowrap select-none touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
          >
            {active && (
              <motion.span
                layoutId={`tab-pill-${groupId}`}
                className="absolute inset-0 rounded-full bg-[var(--color-accent)]"
                transition={{ duration: 0.15, ease: 'easeOut' }}
              />
            )}
            <span
              className={`relative z-10 transition-colors duration-150 ${
                active ? 'text-white' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
              }`}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}