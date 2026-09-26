import { StyleSheet, View } from 'react-native';

import { colors, radius, spacing, type ColorToken } from '@/theme/tokens';

export type ProgressProps = {
  accessibilityLabel: string;
  color?: Extract<ColorToken, 'primary' | 'success' | 'warning' | 'error' | 'info'>;
  value: number;
};

export function Progress({ accessibilityLabel, color = 'primary', value }: ProgressProps) {
  const normalizedValue = Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : 0;

  return (
    <View
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="progressbar"
      accessibilityValue={{ max: 100, min: 0, now: normalizedValue }}
      style={styles.track}
    >
      <View style={[styles.fill, { backgroundColor: colors[color], width: `${normalizedValue}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.pill,
    height: spacing.xs,
    overflow: 'hidden',
    width: '100%',
  },
  fill: {
    borderRadius: radius.pill,
    height: '100%',
  },
});
