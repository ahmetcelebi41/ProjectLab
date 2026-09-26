import type { Href } from 'expo-router';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';

import { Badge, type BadgeVariant } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Progress } from '@/components/ui/Progress';
import { Screen } from '@/components/ui/Screen';
import { Typography } from '@/components/ui/Typography';
import { projects } from '@/data/projects';
import { useProgressStore } from '@/stores/progressStore';
import {
  border,
  breakpoints,
  colors,
  layout,
  radius,
  sizing,
  spacing,
} from '@/theme/tokens';
import type { Project, ProjectProgress, ProjectStatus, ProjectType } from '@/types';

type ProjectFilter = 'all' | 'in-progress' | 'completed';

const filters: readonly { id: ProjectFilter; label: string }[] = [
  { id: 'all', label: 'Tümü' },
  { id: 'in-progress', label: 'Devam Eden' },
  { id: 'completed', label: 'Tamamlanan' },
];

const statusDetails: Record<ProjectStatus, { label: string; variant: BadgeVariant }> = {
  planned: { label: 'Planlandı', variant: 'neutral' },
  'in-progress': { label: 'Devam Ediyor', variant: 'warning' },
  completed: { label: 'Tamamlandı', variant: 'success' },
};

const typeLabels: Record<ProjectType, string> = {
  web: 'Web projesi',
  mobile: 'Mobil uygulama',
  dashboard: 'Yönetim paneli',
};

function getCompletedStageIds(project: Project, progress?: ProjectProgress) {
  if (progress) return progress.completedStageIds;

  return project.stages
    .filter((stage) => stage.status === 'completed')
    .map((stage) => stage.id);
}

function getProgressValue(project: Project, progress?: ProjectProgress) {
  if (project.stages.length === 0) return 0;

  return Math.round(
    (getCompletedStageIds(project, progress).length / project.stages.length) * 100,
  );
}

function getActionLabel(status: ProjectStatus) {
  if (status === 'completed') return 'Projeyi İncele';
  if (status === 'in-progress') return 'Devam Et';
  return 'Projeyi Gör';
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

function LoadingProjects() {
  const { width } = useWindowDimensions();
  const horizontalPadding = width >= breakpoints.medium
    ? layout.horizontalPadding.wide.min
    : layout.horizontalPadding.mobile;
  const contentWidth = Math.min(width - horizontalPadding * 2, layout.contentMaxWidth);
  const columns = width >= breakpoints.expanded
    ? layout.columns.wide.max
    : width >= breakpoints.medium
      ? layout.columns.wide.min
      : layout.columns.mobile;
  const cardWidth = (contentWidth - spacing.md * (columns - 1)) / columns;

  return (
    <Screen
      contentContainerStyle={styles.screen}
      edges={['top', 'bottom']}
      scrollViewProps={{ accessibilityLabel: 'Projeler yükleniyor' }}
    >
      <View style={styles.headerCopy}>
        <View style={[styles.skeleton, styles.loadingTitle]} />
        <View style={[styles.skeleton, styles.loadingDescription]} />
      </View>
      <Card style={styles.summaryCard}>
        <View style={[styles.skeleton, styles.loadingMetric]} />
        <View style={[styles.skeleton, styles.loadingMetric]} />
        <View style={[styles.skeleton, styles.loadingMetric]} />
      </Card>
      <View style={styles.filterRow}>
        {filters.map((filter) => (
          <View key={filter.id} style={[styles.skeleton, styles.loadingFilter]} />
        ))}
      </View>
      <View style={styles.grid}>
        {projects.map((project) => (
          <Card key={project.id} style={[styles.loadingCard, { width: cardWidth }]}>
            <View style={[styles.skeleton, styles.loadingCover]} />
            <View style={[styles.skeleton, styles.loadingCardLine]} />
            <View style={[styles.skeleton, styles.loadingCardCopy]} />
          </Card>
        ))}
      </View>
    </Screen>
  );
}

function ProjectSummary() {
  const completedCount = projects.filter((project) => project.status === 'completed').length;
  const activeCount = projects.filter((project) => project.status === 'in-progress').length;
  const metrics = [
    { label: 'Toplam proje', value: projects.length },
    { label: 'Devam eden', value: activeCount },
    { label: 'Tamamlanan', value: completedCount },
  ];

  return (
    <Card accessibilityLabel={`${projects.length} toplam proje, ${activeCount} devam eden, ${completedCount} tamamlanan`} style={styles.summaryCard}>
      {metrics.map((metric) => (
        <View key={metric.label} style={styles.metric}>
          <Typography variant="h2">{metric.value}</Typography>
          <Typography color="textMuted" variant="caption">{metric.label}</Typography>
        </View>
      ))}
    </Card>
  );
}

function ProjectCover({ project }: { project: Project }) {
  return (
    <View
      accessibilityLabel={`${project.title} proje kapak görseli`}
      accessibilityRole="image"
      style={styles.cover}
    >
      <Typography color="textMuted" variant="caption">
        {typeLabels[project.type].toUpperCase()}
      </Typography>
      <Typography color="primary" numberOfLines={1} style={styles.coverTitle} variant="displayCompact">
        {project.title}
      </Typography>
      <View style={styles.coverRule} />
    </View>
  );
}

function ProjectCard({ project, progress, width }: {
  project: Project;
  progress?: ProjectProgress;
  width: number;
}) {
  const status = statusDetails[project.status];
  const progressValue = getProgressValue(project, progress);
  const activeStageId = progress?.activeStageId ?? project.currentStageId;
  const activeStage = project.stages.find((stage) => stage.id === activeStageId);
  const href = `/projects/${project.id}` as Href;
  const actionLabel = getActionLabel(project.status);

  return (
    <Pressable
      accessibilityHint="Proje genel bakışını açar"
      accessibilityLabel={`${project.title}, ${status.label}, yüzde ${progressValue} tamamlandı`}
      accessibilityRole="link"
      onPress={() => router.push(href)}
      style={({ pressed }) => [styles.cardPressable, { width }, pressed && styles.cardPressed]}
    >
      <Card style={styles.projectCard}>
        <ProjectCover project={project} />
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleGroup}>
            <Typography accessibilityRole="header" numberOfLines={1} variant="h3">{project.title}</Typography>
            <Typography color="textMuted" variant="caption">{typeLabels[project.type]}</Typography>
          </View>
          <Badge variant={status.variant}>{status.label}</Badge>
        </View>
        <Typography color="textSecondary" style={styles.summary}>{project.summary}</Typography>
        <View style={styles.progressBlock}>
          <View style={styles.metaRow}>
            <Typography color="textMuted" variant="caption">İlerleme</Typography>
            <Typography color="textSecondary" variant="caption">%{progressValue}</Typography>
          </View>
          <Progress
            accessibilityLabel={`${project.title} ilerlemesi yüzde ${progressValue}`}
            color={project.status === 'completed' ? 'success' : 'primary'}
            value={progressValue}
          />
        </View>
        <View style={styles.detailList}>
          <View style={styles.detailRow}>
            <Typography color="textMuted" variant="caption">Son aşama</Typography>
            <Typography numberOfLines={1} style={styles.detailValue} variant="small">
              {activeStage?.title ?? 'Aşama belirtilmedi'}
            </Typography>
          </View>
          <View style={styles.detailRow}>
            <Typography color="textMuted" variant="caption">Son güncelleme</Typography>
            <Typography style={styles.detailValue} variant="small">{formatDate(project.updatedAt)}</Typography>
          </View>
        </View>
        <View style={styles.cardAction}>
          <Typography color="primary" variant="button">{actionLabel}</Typography>
          <Typography accessibilityElementsHidden color="primary" importantForAccessibility="no" variant="h4">→</Typography>
        </View>
      </Card>
    </Pressable>
  );
}

export function ProjectsScreen() {
  const { width } = useWindowDimensions();
  const [filter, setFilter] = useState<ProjectFilter>('all');
  const hasHydrated = useProgressStore((state) => state.hasHydrated);
  const storedProgress = useProgressStore((state) => state.projects);

  const horizontalPadding = width >= breakpoints.medium
    ? layout.horizontalPadding.wide.min
    : layout.horizontalPadding.mobile;
  const contentWidth = Math.min(width - horizontalPadding * 2, layout.contentMaxWidth);
  const columns = width >= breakpoints.expanded
    ? layout.columns.wide.max
    : width >= breakpoints.medium
      ? layout.columns.wide.min
      : layout.columns.mobile;
  const cardWidth = (contentWidth - spacing.md * (columns - 1)) / columns;

  const visibleProjects = useMemo(() => {
    const filtered = filter === 'all'
      ? projects
      : projects.filter((project) => project.status === filter);

    return [...filtered].sort((left, right) => {
      if (left.status === 'completed' && right.status !== 'completed') return 1;
      if (right.status === 'completed' && left.status !== 'completed') return -1;

      const leftProgress = storedProgress.find((item) => item.projectId === left.id);
      const rightProgress = storedProgress.find((item) => item.projectId === right.id);
      const leftActivity = leftProgress?.lastVisitedAt ?? left.updatedAt;
      const rightActivity = rightProgress?.lastVisitedAt ?? right.updatedAt;

      return rightActivity.localeCompare(leftActivity);
    });
  }, [filter, storedProgress]);

  if (!hasHydrated) return <LoadingProjects />;

  return (
    <Screen
      contentContainerStyle={styles.screen}
      edges={['top', 'bottom']}
      scrollViewProps={{ contentInsetAdjustmentBehavior: 'automatic' }}
    >
      <View style={styles.headerCopy}>
        <Typography accessibilityRole="header" variant="h1">Projeler</Typography>
        <Typography color="textSecondary" style={styles.headerDescription} variant="bodyLarge">
          Ürün fikirlerinden çalışan deneyimlere uzanan proje yolculuklarını keşfet.
        </Typography>
      </View>
      <ProjectSummary />
      <View accessibilityLabel="Proje filtresi" accessibilityRole="tablist" style={styles.filterRow}>
        {filters.map((item) => {
          const selected = filter === item.id;
          return (
            <Button
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              key={item.id}
              onPress={() => setFilter(item.id)}
              size="small"
              style={styles.filterButton}
              variant={selected ? 'primary' : 'ghost'}
            >
              {item.label}
            </Button>
          );
        })}
      </View>
      {visibleProjects.length > 0 ? (
        <View style={styles.grid}>
          {visibleProjects.map((project) => (
            <ProjectCard
              key={project.id}
              progress={storedProgress.find((item) => item.projectId === project.id)}
              project={project}
              width={cardWidth}
            />
          ))}
        </View>
      ) : (
        <Card style={styles.emptyState}>
          <Typography accessibilityRole="header" variant="h4">Filtre sonucu yok</Typography>
          <Typography color="textSecondary">Bu durumda gösterilecek bir proje bulunmuyor.</Typography>
          <Button onPress={() => setFilter('all')} variant="secondary">Tüm projeleri göster</Button>
        </Card>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { gap: spacing.xxl },
  headerCopy: { gap: spacing.xs },
  headerDescription: { lineHeight: spacing.xl, maxWidth: layout.readingWidth.min },
  summaryCard: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, padding: spacing.lg },
  metric: { flex: 1, gap: spacing.xxs },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  filterButton: { borderRadius: radius.pill },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  cardPressable: { borderRadius: radius.card },
  cardPressed: { opacity: border.width / 2 },
  projectCard: { gap: spacing.lg, height: '100%', padding: spacing.sm },
  cover: {
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: border.width,
    gap: spacing.xs,
    justifyContent: 'flex-end',
    minHeight: spacing.max + spacing.xxxxl,
    overflow: 'hidden',
    padding: spacing.lg,
  },
  coverTitle: { letterSpacing: border.width },
  coverRule: { backgroundColor: colors.primary, borderRadius: radius.pill, height: spacing.xxs, width: spacing.xxxxl },
  cardHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xxs,
  },
  cardTitleGroup: { flex: 1, gap: spacing.xxs },
  summary: { lineHeight: spacing.lg, minHeight: spacing.xxl + spacing.xxl, paddingHorizontal: spacing.xxs },
  progressBlock: { gap: spacing.xs, paddingHorizontal: spacing.xxs },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between' },
  detailList: {
    borderTopColor: colors.border,
    borderTopWidth: border.width,
    gap: spacing.sm,
    paddingHorizontal: spacing.xxs,
    paddingTop: spacing.md,
  },
  detailRow: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm, justifyContent: 'space-between' },
  detailValue: { flex: 1, textAlign: 'right' },
  cardAction: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'flex-end',
    minHeight: sizing.touchTarget.minHeight,
    paddingHorizontal: spacing.xxs,
  },
  emptyState: { alignItems: 'flex-start', gap: spacing.md, padding: spacing.xl },
  skeleton: { backgroundColor: colors.surfaceRaised, borderRadius: radius.md },
  loadingTitle: { height: spacing.xxl, width: '40%' },
  loadingDescription: { height: spacing.lg, width: '75%' },
  loadingMetric: { flex: 1, height: spacing.xxxxl },
  loadingFilter: { height: sizing.button.small, width: spacing.max + spacing.xl },
  loadingCard: { gap: spacing.lg },
  loadingCover: { height: spacing.max + spacing.xxxxl },
  loadingCardLine: { height: spacing.xl, width: '50%' },
  loadingCardCopy: { height: spacing.xxxxl, width: '100%' },
});
