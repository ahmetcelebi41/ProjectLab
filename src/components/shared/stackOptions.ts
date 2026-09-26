import { colors, typography } from '@/theme/tokens';

export const stackScreenOptions = {
  contentStyle: { backgroundColor: colors.background },
  headerBackButtonDisplayMode: 'minimal' as const,
  headerStyle: { backgroundColor: colors.background },
  headerTintColor: colors.text,
  headerTitleStyle: { fontWeight: typography.fontWeight.bold },
  headerShadowVisible: false,
};
