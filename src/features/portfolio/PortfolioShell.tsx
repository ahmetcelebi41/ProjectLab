import type { Href } from 'expo-router';
import { router } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { Typography } from '@/components/ui/Typography';
import { border, colors, radius, sizing, spacing } from '@/theme/tokens';

export type PortfolioRoute = 'home' | 'projects' | 'about';

const navigationItems: readonly { id: PortfolioRoute; label: string; href: Href }[] = [
  { id: 'home', label: 'Ana Sayfa', href: '/portfolio' },
  { id: 'projects', label: 'Projeler', href: '/portfolio/projects' },
  { id: 'about', label: 'Hakkımda', href: '/portfolio/about' },
];

export function PortfolioShell({ activeRoute, children }: {
  activeRoute?: PortfolioRoute;
  children: ReactNode;
}) {
  const [focusedControl, setFocusedControl] = useState<PortfolioRoute | 'brand' | null>(null);

  return (
    <Screen
      contentContainerStyle={styles.screen}
      edges={['top', 'bottom']}
      scrollViewProps={{ contentInsetAdjustmentBehavior: 'automatic' }}
    >
      <View style={styles.header}>
        <Pressable
          accessibilityLabel="Portföy ana sayfasına git"
          accessibilityRole="link"
          onBlur={() => setFocusedControl(null)}
          onFocus={() => setFocusedControl('brand')}
          onPress={() => router.push('/portfolio')}
          style={({ pressed }) => [styles.brand, focusedControl === 'brand' && styles.focused, pressed && styles.pressed]}
        >
          <View aria-hidden style={styles.brandMark}>
            <Typography color="onPrimary" variant="button">PL</Typography>
          </View>
          <View>
            <Typography variant="h4">ProjectLab</Typography>
            <Typography color="textMuted" variant="caption">PORTFÖY</Typography>
          </View>
        </Pressable>

        <View accessibilityLabel="Portföy navigasyonu" accessibilityRole="tablist" style={styles.navigation}>
          {navigationItems.map((item) => {
            const selected = item.id === activeRoute;
            return (
              <Pressable
                accessibilityRole="tab"
                accessibilityState={{ selected }}
                key={item.id}
                onBlur={() => setFocusedControl(null)}
                onFocus={() => setFocusedControl(item.id)}
                onPress={() => router.push(item.href)}
                style={({ pressed }) => [
                  styles.navigationItem,
                  selected && styles.navigationItemSelected,
                  focusedControl === item.id && styles.focused,
                  pressed && styles.pressed,
                ]}
              >
                <Typography color={selected ? 'text' : 'textSecondary'} variant="button">
                  {item.label}
                </Typography>
              </Pressable>
            );
          })}
        </View>

        <Button
          accessibilityLabel="Kişisel moda dön"
          onPress={() => router.replace('/home')}
          size="small"
          variant="ghost"
        >
          Kişisel Moda Dön
        </Button>
      </View>

      <View style={styles.content}>{children}</View>

      <View style={styles.footer}>
        <Typography color="textMuted" variant="caption">PROJECTLAB · PORTFÖY MODU</Typography>
        <Button onPress={() => router.replace('/home')} size="small" variant="ghost">
          Kişisel Moda Dön
        </Button>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { gap: spacing.max, paddingBottom: spacing.xxl },
  header: {
    alignItems: 'center',
    borderBottomColor: colors.border,
    borderBottomWidth: border.width,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'space-between',
    paddingBottom: spacing.lg,
  },
  brand: {
    alignItems: 'center',
    borderColor: 'transparent',
    borderRadius: radius.md,
    borderWidth: border.width,
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: sizing.touchTarget.minHeight,
  },
  brandMark: {
    alignItems: 'center',
    backgroundColor: colors.primaryActive,
    borderRadius: radius.md,
    height: sizing.button.medium,
    justifyContent: 'center',
    width: sizing.button.medium,
  },
  navigation: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  navigationItem: {
    borderColor: 'transparent',
    borderRadius: radius.sm,
    borderWidth: border.width,
    borderBottomColor: 'transparent',
    borderBottomWidth: border.width,
    justifyContent: 'center',
    minHeight: sizing.touchTarget.minHeight,
    paddingHorizontal: spacing.sm,
  },
  navigationItemSelected: { borderBottomColor: colors.primary },
  focused: { borderColor: colors.primaryHover },
  pressed: { opacity: border.width / 2 },
  content: { gap: spacing.max },
  footer: {
    alignItems: 'center',
    borderTopColor: colors.border,
    borderTopWidth: border.width,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'space-between',
    paddingTop: spacing.xl,
  },
});
