export const theme = {
  colors: {
    base: '#0B0B0C',
    surface: '#141416',
    surfaceRaised: '#1C1C1F',
    text: '#F5F5F5',
    textMuted: '#8A8A8D',
    accent: '#D4A853',
    accentHover: '#E0B86A',
    border: '#2A2A2D',
    error: '#E5484D',
    success: '#46A758',
  },
  fonts: {
    display: "'Playfair Display', serif",
    body: "'Inter', sans-serif",
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
    '3xl': '64px',
  },
  radius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    full: '9999px',
  },
  motion: {
    fast: '150ms',
    normal: '250ms',
    slow: '400ms',
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const;
