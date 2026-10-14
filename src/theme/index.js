export const baseTheme = {
  colors: {
    primary: '#0B2A5B',
    primaryDark: '#071F3F',
    primarySoft: '#EEF3FF',
    accent: '#EA6A12',
    accentSoft: '#FFF2E8',
    background: '#F8F9FD',
    surface: '#FFFFFF',
    text: '#0F1F3C',
    textMuted: '#686C78',
    border: '#EBEEF5',
    success: '#2BA569',
    successSoft: '#E9F8EF',
    warning: '#EA6A12',
    danger: '#C61D1F',
    dangerSoft: '#FFEEEE',
    info: '#1D6BD6',
    infoSoft: '#EEF3FF',
  },
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
  radius: { sm: 10, md: 16, lg: 24, pill: 999 },
  shadow: {
    shadowColor: '#071F3F',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 3,
  },
};

export function createTheme(accessibility = {}) {
  const highContrast = Boolean(accessibility.highContrast);
  return {
    ...baseTheme,
    fontScale: accessibility.largeText ? 1.16 : 1,
    colors: highContrast
      ? {
          ...baseTheme.colors,
          primary: '#001B44',
          primaryDark: '#00122F',
          accent: '#D95700',
          background: '#FFFFFF',
          text: '#000000',
          textMuted: '#343434',
          border: '#707070',
        }
      : baseTheme.colors,
  };
}

export const theme = baseTheme;
