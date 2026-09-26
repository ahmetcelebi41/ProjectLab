import type { Href } from 'expo-router';
import { Link } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { border, colors, layout, radius, spacing, typography } from '@/theme/tokens';

type RouteLink = { label: string; href: Href };
type RouteScreenProps = { eyebrow?: string; title: string; description: string; links?: RouteLink[] };

export function RouteScreen({ eyebrow, title, description, links = [] }: RouteScreenProps) {
  return (
    <SafeAreaView edges={['bottom']} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heading}>
          {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
          <Text accessibilityRole="header" style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
        </View>
        {links.length > 0 ? (
          <View accessibilityRole="menu" style={styles.linkList}>
            {links.map((item) => (
              <Link key={item.label} href={item.href} asChild>
                <Pressable accessibilityRole="link" style={({ pressed }) => [styles.link, pressed && styles.linkPressed]}>
                  <Text style={styles.linkLabel}>{item.label}</Text>
                  <Text aria-hidden style={styles.arrow}>→</Text>
                </Pressable>
              </Link>
            ))}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: {
    flexGrow: 1,
    gap: spacing.xxl,
    paddingHorizontal: layout.horizontalPadding.mobile,
    paddingVertical: spacing.xl,
  },
  heading: { gap: spacing.xs },
  eyebrow: { color: colors.primary, ...typography.small, letterSpacing: 1.2, textTransform: 'uppercase' },
  title: { color: colors.text, ...typography.h1 },
  description: { color: colors.textSecondary, ...typography.bodyLarge, lineHeight: spacing.xl },
  linkList: { gap: spacing.md },
  link: { minHeight: 56, alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: spacing.md, backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.card, borderWidth: border.width },
  linkPressed: { backgroundColor: colors.surfaceRaised },
  linkLabel: { color: colors.text, ...typography.button },
  arrow: { color: colors.primary, ...typography.h3 },
});
