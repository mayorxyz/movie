# Feature 1: Upcoming Calendar - Implementation Report (v2)

## Overview
Implemented the Upcoming Calendar feature at `/upcoming` route with month-based navigation (including jump-to-month picker), type filtering (Movies/TV/All), and responsive layout (calendar grid on desktop, day-grouped list on mobile).

## Files Created/Modified

### Configuration
- **src/config/features.ts**: Added `upcomingCalendar: true` flag
- **src/config/site.ts**: Added "Upcoming" nav entry, copy strings, and `minReleasesForFallback: 10`
- **src/config/tmdb.ts**: Added `upcomingCalendar` cache time (1 hour) and `discover` endpoints

### Types
- **src/features/upcoming/types.ts**: Defined `UpcomingRelease`, `UpcomingDayGroup`, `UpcomingType`, `UpcomingFilters`

### Utilities
- **src/features/upcoming/utils.ts**: Date manipulation, URL param parsing, formatting functions
  - Uses YYYY-MM-DD string comparison (no Date shifting)
  - Boundary tests for leap years, month boundaries
  - Range validation (-6 to +24 months)

### Hooks
- **src/features/upcoming/useUpcomingFilters.ts**: URL-synced filter state (month, type, day)
- **src/features/upcoming/useUpcomingReleases.ts**: Data fetching with:
  - Pagination (up to 5 pages)
  - Concurrency limiter (max 4 concurrent requests)
  - Region fallback (US when NG returns fewer than minReleasesForFallback)
  - 429 handling with stale cache via `placeholderData`

### Components
- **UpcomingPage.tsx**: Main page component - redirects to 404 when flag is off
- **UpcomingHeader.tsx**: Title and type switch (Movies/TV/All)
- **MonthNavigator.tsx**: Previous/next month navigation + jump-to-month picker dropdown
- **CalendarGrid.tsx**: Desktop calendar with poster dots (role="grid", arrow keys, text labels)
- **ReleaseList.tsx**: Desktop release list with day filtering
- **ReleaseCard.tsx**: Individual release card with poster, title, date, rating
- **DayGroupedList.tsx**: Mobile day-grouped list
- **UpcomingPageSkeleton.tsx**: Loading skeleton matching final layout

### Tests
- **src/features/upcoming/utils.test.ts**: Unit tests for date logic, URL parsing, filter building, TV date validation

### Router
- **src/App.tsx**: Added lazy-loaded route for `/upcoming`

## Implementation Details

### Data Fetching
- **Movies**: `/discover/movie` with `release_date.gte/lte`, `region`, `with_release_type=2|3|4`
  - Type 2 = Theatrical (limited)
  - Type 3 = Theatrical
  - Type 4 = Digital
- **TV**: `/discover/tv` with `first_air_date.gte/lte` (NOT `with_first_air_date`)
- **Pagination**: Fetches up to 5 pages per type, sorted by popularity
- **Concurrency**: Max 4 concurrent requests via limiter
- **Region Fallback**: If NG returns fewer than 10 movies, also fetches US and merges
- **Filtering**: Removes items without poster_path
- **Sorting**: By date (ascending), then popularity (descending)
- **Caching**: 1 hour stale time via TanStack Query
- **429 Handling**: Uses stale cache via `placeholderData`, retries with exponential backoff

### URL Parameters
- `?month=YYYY-MM`: Month to display (defaults to current month)
- `?type=movie|tv|all`: Filter by media type (defaults to "all")
- `?day=YYYY-MM-DD`: Selected day in calendar (optional)

### Date Handling
- **String Comparison**: Uses YYYY-MM-DD string comparison, no Date object shifting
- **Range Validation**: Only allows months within -6 to +24 months from current
- **Leap Year Support**: Correctly handles February 29 in leap years
- **Region Formatting**: Formats dates based on `site.region.default` (NG/US)

### Responsive Layout
- **Desktop (≥768px)**: Calendar grid (left) + Release list (right, 400px)
- **Mobile (<768px)**: Day-grouped list only
- **Calendar Grid**: 7-column grid with weekday headers, poster dots indicator
- **Day Selection**: Click day to filter list, click again to clear

### Accessibility
- **Keyboard Navigation**: Arrow keys for calendar grid
- **ARIA Labels**: Day cells have descriptive labels with release count
- **Focus Management**: Proper focus states on interactive elements
- **Semantic HTML**: Uses `role="grid"` for calendar

### Performance
- **Lazy Loading**: Route is code-split via React.lazy
- **Skeleton**: Matches final layout to prevent shift
- **Pagination**: Limits to 5 pages to avoid excessive fetching
- **Caching**: 1 hour cache reduces API calls
- **Concurrency**: Max 4 concurrent requests prevents API overload

## Deviations from Spec

### 1. Release Type Labels
**Spec**: "label premiere vs theatrical when available"
**Implementation**: Dropped labels per approval change #1. Used `with_release_type=2|3|4` filter to fetch theatrical (limited), theatrical, and digital releases.

### 2. TV Data Source
**Spec**: "TV via /discover/tv with air_date range or /tv/on_the_air"
**Implementation**: Used only `/discover/tv` with `first_air_date.gte/lte` per approval change #3. Removed `/tv/on_the_air` endpoint. Added test to verify all TV dates fall within the month.

### 3. Load More Button
**Spec**: "paginate beyond one page"
**Implementation**: Removed "Load more" button per approval change #4. Fetches up to 5 pages automatically.

### 4. Month Picker
**Spec**: "jump-to-month"
**Implementation**: Added jump-to-month picker dropdown with month options from -6 to +24 months. Click month display to open picker.

### 5. Past Date Muting
**Spec**: "past dates muted"
**Implementation**: Applied `opacity-60` to past dates in calendar grid and release cards.

### 6. Calendar Grid Poster Dots
**Spec**: "month grid with poster dots"
**Implementation**: Shows up to 3 dots per day, with "+N" indicator if more than 3 releases.

### 7. Feature Flag Gating
**Spec**: "Gate the route on the flag so the page never mounts or fetches when off"
**Implementation**: When `upcomingCalendar: false`, page redirects to `/404` (NotFound). No data fetching occurs.

### 8. Region Fallback
**Spec**: "Add a US fallback when region NG returns fewer than N titles; make N a config value"
**Implementation**: If NG returns fewer than `minReleasesForFallback` (default 10) movies, also fetches from US region and merges results (avoiding duplicates by ID). N is configurable via `site.copy.upcoming.minReleasesForFallback`.

### 9. Concurrency Limiting
**Spec**: "Cap concurrent requests at 4 and handle 429 with stale cache"
**Implementation**: Added concurrency limiter with max 4 concurrent requests. On 429, uses stale cache via TanStack Query's `placeholderData` option.

## Package.json Changes

### Added Dependencies
- **vitest**: Added for unit testing. Required to run the test suite for date logic, URL parsing, and filter building.

### No Other Changes
- No unrelated lockfile upgrades
- No other dependencies added or modified
- All existing dependencies remain at their original versions

## Testing

### Unit Tests Coverage
- ✅ Current month formatting
- ✅ Month parsing (valid/invalid)
- ✅ First/last day of month (including leap years)
- ✅ Previous/next month (including year boundaries)
- ✅ Month range validation
- ✅ Month display formatting
- ✅ Date display formatting (US/NG regions)
- ✅ URL param parsing (valid/invalid/missing)
- ✅ Filter to search params conversion
- ✅ Past date detection (string comparison)
- ✅ Day of week calculation
- ✅ Days in month (30/31/28/29 days)
- ✅ TV date validation (all dates fall within month)
- ✅ TV discover params (first_air_date.gte/lte, not with_first_air_date)

### Manual Testing Checklist
- [ ] Navigate to `/upcoming`
- [ ] Verify current month displays
- [ ] Click prev/next month buttons
- [ ] Click month display to open jump-to-month picker
- [ ] Select a month from picker
- [ ] Switch between Movies/TV/All
- [ ] Click day in calendar to filter list
- [ ] Verify mobile layout (day-grouped list)
- [ ] Verify desktop layout (calendar + list)
- [ ] Check skeleton loading state
- [ ] Verify feature flag disables route (redirects to 404)
- [ ] Verify region fallback (if NG returns < 10 movies, US is also fetched)

## Feature Flag Behavior

When `upcomingCalendar: false`:
- Nav entry is hidden (controlled by `site.ts` nav array)
- Route redirects to `/404` (NotFound page)
- No rendering occurs
- No data fetching occurs

## Known Limitations

1. **Limited Pagination**: Max 5 pages per type (could miss some releases)
2. **No Infinite Scroll**: All data loaded upfront (up to 5 pages)
3. **No Shareable Settings**: URL params work but no explicit share functionality
4. **No Release Type Labels**: Dropped per approval (theatrical vs premiere vs digital)

## Future Enhancements

1. Add infinite scroll for months with many releases
2. Add "Share this month" functionality
3. Add keyboard shortcuts (left/right arrows for month navigation)
4. Add analytics tracking for popular months/types
5. Add release type labels if TMDB provides reliable data

## Build Status
✅ **Build successful** - No errors or warnings
✅ **Type checking passed** - All types properly defined
✅ **Tests written** - Comprehensive unit test coverage

## Conclusion

Feature 1 (Upcoming Calendar) is fully implemented according to the approved spec with all requested changes including:
- Jump-to-month picker restored
- Release types updated to 2|3|4 (Theatrical limited, Theatrical, Digital)
- TV discover params corrected to `first_air_date.gte/lte`
- Route gated on feature flag with 404 redirect
- US fallback when NG returns fewer than minReleasesForFallback
- Concurrent requests capped at 4
- 429 handling with stale cache
- Empty month and fetch error states confirmed
- Documentation moved to docs/

The implementation is config-driven, accessible, responsive, and performant. All copy, endpoints, and settings come from config files as required.
