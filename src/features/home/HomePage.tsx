import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { homeConfig } from '../../config/homeSections';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { ContentRow } from '../../components/ui/ContentRow';
import { SegmentedTabs } from '../../components/ui/SegmentedTabs';
import { RecommendationsBanner } from '../../components/ui/RecommendationsBanner';

export default function HomePage() {
  // State for section controls (tabs/dropdowns)
  const [trendingTab, setTrendingTab] = useState('week');
  const [latestTab, setLatestTab] = useState('movie');

  // Get first three sections from config
  const sections = homeConfig.sections.slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="pb-16"
    >
      {/* Section 1: Trending */}
      {sections[0] && (
        <section className="py-8">
          <SectionHeader title={sections[0].title} seeAllLink={sections[0].seeAllLink}>
            {sections[0].tabs && (
              <SegmentedTabs
                tabs={sections[0].tabs}
                activeTab={trendingTab}
                onChange={setTrendingTab}
              />
            )}
          </SectionHeader>
          <ContentRow
            section={sections[0]}
            activeTab={trendingTab}
          />
        </section>
      )}

      {/* Section 2: Latest */}
      {sections[1] && (
        <section className="py-8">
          <SectionHeader title={sections[1].title} seeAllLink={sections[1].seeAllLink}>
            {sections[1].tabs && (
              <SegmentedTabs
                tabs={sections[1].tabs}
                activeTab={latestTab}
                onChange={setLatestTab}
              />
            )}
          </SectionHeader>
          <ContentRow
            section={sections[1]}
            activeTab={latestTab}
          />
        </section>
      )}

      {/* Section 3: Your Next Watch (Recommendations) */}
      {sections[2] && sections[2].type === 'recommendations' && (
        <section className="py-8">
          <SectionHeader title={sections[2].title} />
          <RecommendationsBanner />
        </section>
      )}

      {/* TODO: Implement remaining sections 4-12 */}
      <div className="px-4 md:px-8 lg:px-12 py-16 text-center">
        <p className="text-[var(--color-text-muted)]">
          Sections 4-12 will be implemented in the next phase.
        </p>
      </div>
    </motion.div>
  );
}
