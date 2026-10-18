import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

/** Syncs a section's tab/dropdown selection to a URL param keyed by section id. */
export function useSectionParam(
  sectionId: string,
  validValues: (string | number)[],
  defaultValue: string | number,
): [string, (next: string | number) => void] {
  const [searchParams, setSearchParams] = useSearchParams();

  const value = useMemo(() => {
    const raw = searchParams.get(sectionId);
    if (raw === null) return String(defaultValue);
    const match = validValues.find((v) => String(v) === raw);
    return match !== undefined ? String(match) : String(defaultValue);
  }, [searchParams, sectionId, validValues, defaultValue]);

  const setValue = useCallback(
    (next: string | number) => {
      const params = new URLSearchParams(searchParams);
      if (String(next) === String(defaultValue)) {
        params.delete(sectionId);
      } else {
        params.set(sectionId, String(next));
      }
      setSearchParams(params, { replace: true });
    },
    [searchParams, setSearchParams, sectionId, defaultValue],
  );

  return [value, setValue];
}
