import { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { homeConfig } from '../../config/homeSections';
import { isFeatureEnabled } from '../../config/features';
import { globalFilterChips } from '../../config/mediaPresets';
import { useHomeFiltersStore } from '../../store/homeFilters';
import { SectionRenderer } from './SectionRenderer';

export default function HomePage() {
  const setGlobalType = useHomeFiltersStore((state) => state.setGlobalType);
  const location = useLocation();

  useEffect(() => {
    const typeParam = new URLSearchParams(location.search).get('type');
    const type = globalFilterChips.find((chip) => chip.id === typeParam)?.id ?? 'all';
    setGlobalType(type);
  }, [location.search, setGlobalType]);

  const sections = useMemo(
    () =>
      homeConfig.sections.filter((s) => {
        if (s.enabled === false) return false;
        if (s.featureFlag && !isFeatureEnabled(s.featureFlag)) return false;
        return true;
      }),
    [],
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.15 }}
      className="pb-8 md:pb-14 overflow-x-clip"
    >
      {sections.map((section, i) => (
        <SectionRenderer key={section.id} section={section} eager={i < 2} />
      ))}
    </motion.div>
  );
}