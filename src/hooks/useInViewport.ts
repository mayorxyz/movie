import { useEffect, useRef, useState } from 'react';

/** Returns a ref to attach + whether it has entered the viewport (200px margin). */
export function useInViewport<T extends HTMLElement>(eager = false) {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(eager);

  useEffect(() => {
    if (eager) return;
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [eager]);

  return { ref, visible };
}
