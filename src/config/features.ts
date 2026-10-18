// Feature flags - toggle to enable/disable features without code changes
export const features = {
  downloadButton: false,
  streamButton: false,
  watchProviders: true,
  watchlist: true,
  trailers: true,
  reviews: true,
  personPages: true,
  upcomingRail: true,
  upcomingCalendar: true,
  accounts: false,
  circles: false,
  appLinks: false,
  markWatched: true,
} as const;

export type Features = typeof features;
export type FeatureFlag = keyof Features;

export function isFeatureEnabled(flag: FeatureFlag): boolean {
  return features[flag];
}
