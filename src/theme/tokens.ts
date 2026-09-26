const fontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

export const colors = {
  background: '#0B0D10',
  surface: '#11151A',
  surfaceRaised: '#171C22',
  border: '#262D36',
  text: '#F4F7FA',
  textSecondary: '#A7B0BC',
  textMuted: '#737D89',
  primary: '#7C5CFC',
  primaryHover: '#8D72FF',
  primaryActive: '#6D4AE8',
  onPrimary: '#FFFFFF',
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#38BDF8',
} as const;

export const typography = {
  fontFamily: {
    primary: 'Inter',
    monospace: 'monospace',
  },
  fontWeight,
  display: {
    compact: { fontSize: 36, fontWeight: fontWeight.bold },
    expanded: { fontSize: 40, fontWeight: fontWeight.bold },
  },
  h1: { fontSize: 32, fontWeight: fontWeight.bold },
  h2: { fontSize: 26, fontWeight: fontWeight.bold },
  h3: { fontSize: 22, fontWeight: fontWeight.semibold },
  h4: { fontSize: 18, fontWeight: fontWeight.semibold },
  bodyLarge: { fontSize: 16, fontWeight: fontWeight.regular },
  body: { fontSize: 14, fontWeight: fontWeight.regular },
  small: { fontSize: 13, fontWeight: fontWeight.regular },
  caption: { fontSize: 12, fontWeight: fontWeight.medium },
  button: { fontSize: 14, fontWeight: fontWeight.semibold },
} as const;

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
  xxxxl: 48,
  max: 64,
} as const;

export const radius = {
  sm: 6,
  md: 8,
  card: 12,
  lg: 16,
  pill: 999,
} as const;

export const border = {
  width: 1,
} as const;

export const breakpoints = {
  compact: 480,
  medium: 768,
  expanded: 1024,
  wide: 1440,
} as const;

export const layout = {
  contentMaxWidth: 1200,
  readingWidth: { min: 720, max: 800 },
  horizontalPadding: {
    mobile: spacing.md,
    wide: { min: spacing.lg, max: spacing.xl },
  },
  columns: { mobile: 1, wide: { min: 2, max: 3 } },
} as const;

export const sizing = {
  button: { small: 36, medium: 44, large: 48 },
  control: { standard: 44, important: 48 },
  touchTarget: { minWidth: 44, minHeight: 44 },
  icon: { small: 16, medium: 20, large: 24 },
  iconStroke: { min: 1.75, max: 2 },
} as const;

export const motion = {
  duration: {
    fast: 150,
    fastMax: 180,
    standard: 220,
    emphasis: 250,
    emphasisMax: 300,
    reduced: 0,
  },
  preferredProperties: ['transform', 'opacity'],
} as const;

export const shadows = {
  none: { elevation: 0, shadowOpacity: 0 },
} as const;

export const elevation = {
  flat: 0,
} as const;

export const zIndex = {
  base: 0,
  stickyNavigation: 1,
  dropdown: 2,
  overlay: 3,
  modal: 4,
  toast: 5,
} as const;

export const tokens = {
  colors,
  typography,
  spacing,
  radius,
  border,
  breakpoints,
  layout,
  sizing,
  motion,
  shadows,
  elevation,
  zIndex,
} as const;

export type ThemeTokens = typeof tokens;
export type ColorToken = keyof typeof colors;
export type SpacingToken = keyof typeof spacing;
export type RadiusToken = keyof typeof radius;
export type BreakpointToken = keyof typeof breakpoints;
