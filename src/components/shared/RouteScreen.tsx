import type { Href } from 'expo-router';
import { Link } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Screen } from '@/components/ui/Screen';
import { Typography } from '@/components/ui/Typography';
import { border, colors, radius, sizing, spacing } from '@/theme/tokens';

type RouteLink = { label: string; href: Href };
type RouteScreenProps = { eyebrow?: string; title: string; description: string; links?: RouteLink[] };

export function RouteScreen({ eyebrow, title, description, links = [] }: RouteScreenProps) {
  return (
    <Screen contentContainerStyle={styles.content}>
      <View style={styles.heading}>
        {eyebrow ? <Typography color="primary" style={styles.eyebrow} variant="small">{eyebrow}</Typography> : null}
        <Typography accessibilityRole="header" variant="h1">{title}</Typography>
        <Typography color="textSecondary" style={styles.description} variant="bodyLarge">{description}</Typography>
      </View>
      {links.length > 0 ? (
        <View accessibilityRole="menu" style={styles.linkList}>
          {links.map((item) => (
            <Link key={item.label} href={item.href} asChild>
              <Pressable accessibilityRole="link" style={({ pressed }) => [styles.link, pressed && styles.linkPressed]}>
                <Typography numberOfLines={1} variant="button">{item.label}</Typography>
                <Typography aria-hidden color="primary" variant="h3">→</Typography>
              </Pressable>
            </Link>
          ))}
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.xxl,
  },
  heading: { gap: spacing.xs },
  eyebrow: { textTransform: 'uppercase' },
  description: { lineHeight: spacing.xl },
  linkList: { gap: spacing.md },
  link: { minHeight: sizing.touchTarget.minHeight, alignItems: 'center', flexDirection: 'row', gap: spacing.md, justifyContent: 'space-between', padding: spacing.md, backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.card, borderWidth: border.width },
  linkPressed: { backgroundColor: colors.surfaceRaised },
});
