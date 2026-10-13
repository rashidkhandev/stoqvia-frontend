// STOQVIA Design Tokens (Luxury Dark & Clean Light)
export const tokens = {
  colors: {
    dark: {
      bg: '#0A0A0B',
      surface: '#141416',
      surfaceElevated: '#1C1C1F',
      border: 'rgba(255, 255, 255, 0.08)',
      borderGold: 'rgba(212, 175, 55, 0.25)',
      primary: '#D4AF37', // Luxury Gold
      primaryHover: '#E5C04A',
      secondary: '#14B8A6', // Accent Teal
      text: '#F4F4F5',
      textMuted: '#A1A1AA',
      error: '#EF4444',
      success: '#10B981',
      warning: '#F59E0B',
      glowGold: '0 0 25px rgba(212, 175, 55, 0.18)',
    },
    light: {
      bg: '#F8F9FA',
      surface: '#FFFFFF',
      surfaceElevated: '#F1F3F5',
      border: '#E4E4E7',
      borderGold: 'rgba(212, 175, 55, 0.35)',
      primary: '#B8860B', // Darker Gold for contrast
      primaryHover: '#996515',
      secondary: '#0D9488',
      text: '#18181B',
      textMuted: '#71717A',
      error: '#DC2626',
      success: '#059669',
      warning: '#D97706',
      glowGold: '0 0 15px rgba(184, 134, 11, 0.12)',
    },
  },
  fonts: {
    heading: "'Playfair Display', Georgia, serif",
    body: "'Inter', system-ui, -apple-system, sans-serif",
    mono: "'JetBrains Mono', Consolas, monospace",
    urdu: "'Noto Nastaliq Urdu', 'Jameel Noori Nastaleeq', serif",
  },
  radii: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    full: '9999px',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },
  shadows: {
    cardDark: '0 4px 20px -2px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.06)',
    cardGoldDark: '0 8px 30px rgba(212, 175, 55, 0.12), 0 0 0 1px rgba(212, 175, 55, 0.25)',
    cardLight: '0 2px 12px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.05)',
  },
}
