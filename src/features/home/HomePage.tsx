import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { homeConfig } from '../../config/homeSections';
import { isFeatureEnabled } from '../../config/features';
import { SectionRenderer } from './SectionRenderer';

const INITIAL_VISIBLE = 4;

export default function HomePage() {
  const [revealed, setRevealed] = useState(INITIAL_VISIBLE);

  const sections = useMemo(
    () =>
      homeConfig.sections.filter((s) => {
        if (s.enabled === false) return false;
        if (s.featureFlag && !isFeatureEnabled(s.featureFlag)) return false;
        return true;
      }),
    [],
  );

  const batchSize = homeConfig.settings.loadMoreBatchSize;
  const loadMoreIndex = sections.findIndex((s) => s.type === 'loadMore');
  const preSections = loadMoreIndex >= 0 ? sections.slice(0, loadMoreIndex) : sections;
  const loadMoreSection = loadMoreIndex >= 0 ? sections[loadMoreIndex] : undefined;

  const visiblePre = preSections.slice(0, revealed);
  const remaining = preSections.length - visiblePre.length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="pb-16"
    >
      {visiblePre.map((section, i) => (
        <SectionRenderer key={section.id} section={section} eager={i === 0} />
      ))}
      {loadMoreSection && (
        <SectionRenderer
          key={loadMoreSection.id}
          section={loadMoreSection}
          onLoadMore={() => setRevealed((r) => r + (loadMoreSection.batchSize ?? batchSize))}
          loadMoreRemaining={remaining}
        />
      )}
    </motion.div>
  );
}
