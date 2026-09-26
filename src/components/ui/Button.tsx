import { useState, type ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import type { PressableProps, StyleProp, ViewStyle } from 'react-native';

import { border, colors, radius, sizing, spacing } from '@/theme/tokens';

import { Typography } from './Typography';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';
export type ButtonSize = keyof typeof sizing.button;

export type ButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  children: ReactNode;
  loading?: boolean;
  size?: ButtonSize;
  style?: StyleProp<ViewStyle>;
  variant?: ButtonVariant;
};

const variantStyles = StyleSheet.create({
  primary: { backgroundColor: colors.primary, borderColor: colors.primary },
  secondary: { backgroundColor: colors.surfaceRaised, borderColor: colors.border },
  ghost: { borderColor: colors.border },
  destructive: { backgroundColor: colors.error, borderColor: colors.error },
});

const pressedVariantStyles = StyleSheet.create({
  primary: { backgroundColor: colors.primaryActive, borderColor: colors.primaryActive },
  secondary: { backgroundColor: colors.surface, borderColor: colors.primary },
  ghost: { backgroundColor: colors.surfaceRaised, borderColor: colors.primary },
  destructive: { backgroundColor: colors.background, borderColor: colors.error },
});

const hoverVariantStyles = StyleSheet.create({
  primary: { backgroundColor: colors.primaryHover, borderColor: colors.primaryHover },
  secondary: { borderColor: colors.primary },
  ghost: { backgroundColor: colors.surfaceRaised },
  destructive: { borderColor: colors.onPrimary },
});

export function Button({
  accessibilityLabel,
  children,
  disabled = false,
  hitSlop,
  loading = false,
  onBlur,
  onFocus,
  onHoverIn,
  onHoverOut,
  size = 'medium',
  style,
  variant = 'primary',
  ...props
}: ButtonProps) {
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const unavailable = disabled || loading;
  const foreground = disabled
    ? 'textMuted'
    : variant === 'primary' || variant === 'destructive'
      ? 'onPrimary'
      : 'text';

  return (
    <Pressable
      {...props}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={props.accessibilityRole ?? 'button'}
      accessibilityState={{ ...props.accessibilityState, busy: loading, disabled: unavailable }}
      disabled={unavailable}
      hitSlop={hitSlop ?? (size === 'small' ? spacing.xxs : undefined)}
      onBlur={(event) => {
        setFocused(false);
        onBlur?.(event);
      }}
      onFocus={(event) => {
        setFocused(true);
        onFocus?.(event);
      }}
      onHoverIn={(event) => {
        setHovered(true);
        onHoverIn?.(event);
      }}
      onHoverOut={(event) => {
        setHovered(false);
        onHoverOut?.(event);
      }}
      style={({ pressed }) => [
        styles.base,
        { minHeight: sizing.button[size] },
        variantStyles[variant],
        hovered && hoverVariantStyles[variant],
        pressed && pressedVariantStyles[variant],
        focused && (variant === 'primary' || variant === 'destructive' ? styles.focusOnSolid : styles.focus),
        disabled && styles.disabled,
        style,
      ]}
    >
      <View style={styles.content}>
        {loading ? <ActivityIndicator color={colors[foreground]} size="small" /> : null}
        <Typography color={foreground} numberOfLines={1} variant="button">
          {children}
        </Typography>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    borderRadius: radius.md,
    borderWidth: border.width,
    justifyContent: 'center',
    minHeight: sizing.touchTarget.minHeight,
    minWidth: sizing.touchTarget.minWidth,
    paddingHorizontal: spacing.md,
  },
  content: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'center',
  },
  disabled: {
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.border,
  },
  focus: {
    borderColor: colors.primary,
  },
  focusOnSolid: {
    borderColor: colors.onPrimary,
  },
});
