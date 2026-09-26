import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { border, colors, radius, spacing } from '@/theme/tokens';

import { Typography } from './Typography';

export type BadgeVariant = 'neutral' | 'primary' | 'success' | 'warning' | 'error' | 'info';

export type BadgeProps = {
  children: ReactNode;
  variant?: BadgeVariant;
};

const variantColors = {
  neutral: colors.textSecondary,
  primary: colors.primary,
  success: colors.success,
  warning: colors.warning,
  error: colors.error,
  info: colors.info,
} as const;

export function Badge({ children, variant = 'neutral' }: BadgeProps) {
  const color = variantColors[variant];

  return (
    <View style={[styles.base, { borderColor: color }]}>
      <Typography style={{ color }} variant="caption">
        {children}
      </Typography>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.pill,
    borderWidth: border.width,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
});
