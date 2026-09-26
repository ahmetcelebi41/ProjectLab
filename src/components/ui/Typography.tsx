import type { ComponentProps } from 'react';
import { StyleSheet, Text as NativeText } from 'react-native';

import { colors, typography, type ColorToken } from '@/theme/tokens';

type NativeTextProps = ComponentProps<typeof NativeText>;

const variantStyles = {
  displayCompact: typography.display.compact,
  displayExpanded: typography.display.expanded,
  h1: typography.h1,
  h2: typography.h2,
  h3: typography.h3,
  h4: typography.h4,
  bodyLarge: typography.bodyLarge,
  body: typography.body,
  small: typography.small,
  caption: typography.caption,
  button: typography.button,
} as const;

const accessibleTextColors = {
  ...colors,
  primary: colors.primaryHover,
  textMuted: colors.textSecondary,
} as const;

export type TypographyVariant = keyof typeof variantStyles;

export type TypographyProps = NativeTextProps & {
  color?: ColorToken;
  variant?: TypographyVariant;
};

export function Typography({ color = 'text', style, variant = 'body', ...props }: TypographyProps) {
  return (
    <NativeText
      {...props}
      style={[styles.base, variantStyles[variant], { color: accessibleTextColors[color] }, style]}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    fontFamily: typography.fontFamily.primary,
  },
});
