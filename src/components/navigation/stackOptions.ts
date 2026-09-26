import { colors } from '@/theme/tokens';

export const stackScreenOptions = {
  contentStyle: { backgroundColor: colors.background },
  headerBackButtonDisplayMode: 'minimal' as const,
  headerStyle: { backgroundColor: colors.background },
  headerTintColor: colors.text,
  headerTitleStyle: { fontWeight: '700' as const },
  headerShadowVisible: false,
};
