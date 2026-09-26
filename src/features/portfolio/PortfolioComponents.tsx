import type { Href } from 'expo-router';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Badge, type BadgeVariant } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Typography } from '@/components/ui/Typography';
import { border, breakpoints, colors, layout, radius, sizing, spacing } from '@/theme/tokens';
import type { Project, ProjectStatus, ProjectType } from '@/types';

const typeLabels: Record<ProjectType, string> = {
  web: 'Web Projesi',
  mobile: 'Mobil Uygulama',
  dashboard: 'Yönetim Paneli',
};

const statusDetails: Record<ProjectStatus, { label: string; variant: BadgeVariant }> = {
  planned: { label: 'Planlandı', variant: 'neutral' },
  'in-progress': { label: 'Geliştiriliyor', variant: 'warning' },
  completed: { label: 'Tamamlandı', variant: 'success' },
};

export function PortfolioSectionHeading({ description, eyebrow, title }: {
  description?: string;
  eyebrow?: string;
  title: string;
}) {
  return (
    <View style={styles.sectionHeading}>
      {eyebrow ? <Typography color="primary" variant="caption">{eyebrow.toUpperCase()}</Typography> : null}
      <Typography accessibilityRole="header" variant="h2">{title}</Typography>
      {description ? (
        <Typography color="textSecondary" style={styles.sectionDescription} variant="bodyLarge">
          {description}
        </Typography>
      ) : null}
    </View>
  );
}

export function ProjectVisual({ compact = false, project }: { compact?: boolean; project: Project }) {
  return (
    <View
      accessibilityLabel={`${project.title}, ${typeLabels[project.type]} proje görseli`}
      accessibilityRole="image"
      style={[styles.visual, compact && styles.visualCompact]}
    >
      <Typography color="textMuted" variant="caption">{typeLabels[project.type].toUpperCase()}</Typography>
      <Typography color="primary" numberOfLines={1} variant={compact ? 'h1' : 'displayExpanded'}>
        {project.title}
      </Typography>
      <View aria-hidden style={styles.visualRule} />
    </View>
  );
}

export function PortfolioProjectCard({ project, width }: { project: Project; width: number }) {
  const status = statusDetails[project.status];
  const href = `/portfolio/projects/${project.id}` as Href;

  return (
    <Pressable
      accessibilityHint="Portföy proje detayını açar"
      accessibilityLabel={`${project.title}, ${typeLabels[project.type]}, ${status.label}`}
      accessibilityRole="link"
      onPress={() => router.push(href)}
      style={({ pressed }) => [styles.cardPressable, { width }, pressed && styles.pressed]}
    >
      <Card style={styles.projectCard}>
        <ProjectVisual compact project={project} />
        <View style={styles.cardTop}>
          <View style={styles.cardTitle}>
            <Typography accessibilityRole="header" variant="h3">{project.title}</Typography>
            <Typography color="textMuted" variant="caption">{typeLabels[project.type]}</Typography>
          </View>
          <Badge variant={status.variant}>{status.label}</Badge>
        </View>
        <Typography color="textSecondary" style={styles.bodyLine}>{project.summary}</Typography>
        <View style={styles.technologyRow}>
          {project.technologies.map((technology) => (
            <Badge key={technology}>{technology}</Badge>
          ))}
        </View>
        <View style={styles.cardAction}>
          <Typography color="primary" variant="button">Projeyi İncele</Typography>
          <Typography aria-hidden color="primary" variant="h4">→</Typography>
        </View>
      </Card>
    </Pressable>
  );
}

export function getPortfolioGrid(width: number, itemCount?: number) {
  const horizontalPadding = width >= breakpoints.medium
    ? layout.horizontalPadding.wide.min
    : layout.horizontalPadding.mobile;
  const contentWidth = Math.min(width - horizontalPadding * 2, layout.contentMaxWidth);
  const responsiveColumns = width >= breakpoints.expanded
    ? layout.columns.wide.max
    : width >= breakpoints.medium
      ? layout.columns.wide.min
      : layout.columns.mobile;
  const columns = itemCount ? Math.min(responsiveColumns, itemCount) : responsiveColumns;
  return {
    columns,
    itemWidth: (contentWidth - spacing.md * (columns - 1)) / columns,
  };
}

const styles = StyleSheet.create({
  sectionHeading: { gap: spacing.xs, maxWidth: layout.readingWidth.max },
  sectionDescription: { lineHeight: spacing.xl },
  visual: {
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: border.width,
    gap: spacing.md,
    justifyContent: 'flex-end',
    minHeight: spacing.max * 4,
    overflow: 'hidden',
    padding: spacing.xxl,
  },
  visualCompact: { borderRadius: radius.md, minHeight: spacing.max + spacing.xxxxl, padding: spacing.lg },
  visualRule: { backgroundColor: colors.primary, borderRadius: radius.pill, height: spacing.xxs, width: spacing.max },
  cardPressable: { borderRadius: radius.card },
  pressed: { opacity: border.width / 2 },
  projectCard: { gap: spacing.lg, height: '100%', padding: spacing.sm },
  cardTop: { alignItems: 'flex-start', flexDirection: 'row', gap: spacing.sm, justifyContent: 'space-between' },
  cardTitle: { flex: 1, gap: spacing.xxs, paddingHorizontal: spacing.xxs },
  bodyLine: { lineHeight: spacing.lg, paddingHorizontal: spacing.xxs },
  technologyRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, paddingHorizontal: spacing.xxs },
  cardAction: {
    alignItems: 'center',
    borderTopColor: colors.border,
    borderTopWidth: border.width,
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'flex-end',
    minHeight: sizing.touchTarget.minHeight,
    paddingHorizontal: spacing.xxs,
    paddingTop: spacing.sm,
  },
});
