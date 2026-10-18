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
} as const;

export type FeatureFlag = keyof typeof features;

export function isFeatureEnabled(flag: FeatureFlag): boolean {
  return features[flag];
}
