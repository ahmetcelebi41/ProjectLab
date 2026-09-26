import type { ComponentProps } from 'react';
import { StyleSheet, View } from 'react-native';

import { border, colors, radius, shadows, spacing } from '@/theme/tokens';

type ViewProps = ComponentProps<typeof View>;

export type CardProps = ViewProps & {
  raised?: boolean;
};

export function Card({ raised = false, style, ...props }: CardProps) {
  return <View {...props} style={[styles.base, raised && styles.raised, style]} />;
}

const styles = StyleSheet.create({
  base: {
    ...shadows.none,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: border.width,
    padding: spacing.md,
  },
  raised: {
    backgroundColor: colors.surfaceRaised,
  },
});
