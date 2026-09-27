import { StyleSheet, View } from 'react-native';

import { Badge, type BadgeVariant } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Typography } from '@/components/ui/Typography';
import { colors, radius, spacing } from '@/theme/tokens';
import type { ProjectStage, ProjectStageStatus } from '@/types';

const milestoneStatuses: Record<ProjectStageStatus, { label: string; variant: BadgeVariant }> = {
  completed: { label: 'Tamamlandı', variant: 'success' },
  'in-progress': { label: 'Devam Ediyor', variant: 'warning' },
  'not-started': { label: 'Henüz Başlanmadı', variant: 'neutral' },
};

export function getOrderedProjectStages(stages: readonly ProjectStage[]) {
  return [...stages].sort((left, right) => left.order - right.order);
}

export function formatProjectStageDate(date?: string) {
  if (!date) return undefined;

  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return undefined;

  return new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(parsedDate);
}

export function getUniqueTechnologies(technologies?: readonly string[]) {
  const seen = new Set<string>();

  return (technologies ?? []).flatMap((technology) => {
    const label = technology.trim();
    const normalizedLabel = label.toLocaleLowerCase('tr-TR');
    if (!label || seen.has(normalizedLabel)) return [];

    seen.add(normalizedLabel);
    return [label];
  });
}

export function ProjectTechnologyList({ technologies }: { technologies?: readonly string[] }) {
  const uniqueTechnologies = getUniqueTechnologies(technologies);
  if (!uniqueTechnologies.length) return null;

  return (
    <View accessibilityLabel="Projede kullanılan teknolojiler" style={styles.chipList}>
      {uniqueTechnologies.map((technology) => (
        <View key={technology} style={styles.chipItem}>
          <Badge variant="primary">{technology}</Badge>
        </View>
      ))}
    </View>
  );
}

export function ProjectLearningList({ learnings }: { learnings?: readonly string[] }) {
  if (!learnings?.length) return null;

  return (
    <Card accessibilityLabel="Bu projede öğrenilenler" style={styles.learningList}>
      {learnings.map((learning) => (
        <View key={learning} style={styles.learningItem}>
          <View accessibilityElementsHidden importantForAccessibility="no" style={styles.learningMarker} />
          <Typography color="textSecondary" style={styles.learningText}>{learning}</Typography>
        </View>
      ))}
    </Card>
  );
}

export function ProjectMilestoneList({ stages }: { stages?: readonly ProjectStage[] }) {
  if (!stages?.length) return null;
  const orderedStages = getOrderedProjectStages(stages);
  const completedCount = orderedStages.filter((stage) => stage.status === 'completed').length;

  return (
    <View accessibilityLabel="Proje kilometre taşları" style={styles.milestoneList}>
      <Typography color="textSecondary" variant="small">
        {completedCount}/{orderedStages.length} kilometre taşı tamamlandı
      </Typography>
      {orderedStages.map((stage) => {
        const status = milestoneStatuses[stage.status];

        return (
          <Card key={stage.id} style={styles.milestoneCard}>
            <View style={styles.milestoneHeader}>
              <View style={styles.milestoneTitleRow}>
                <Typography color="primary" variant="caption">
                  {String(stage.order).padStart(2, '0')}
                </Typography>
                <Typography accessibilityRole="header" style={styles.milestoneTitle} variant="h4">
                  {stage.title}
                </Typography>
              </View>
              <Badge variant={status.variant}>{status.label}</Badge>
            </View>
          </Card>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  chipList: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chipItem: { flexShrink: 1, maxWidth: '100%' },
  learningList: { gap: spacing.md, padding: spacing.lg },
  learningItem: { alignItems: 'flex-start', flexDirection: 'row', gap: spacing.sm },
  learningMarker: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    height: spacing.xs,
    marginTop: spacing.xs,
    width: spacing.xs,
  },
  learningText: { flex: 1, flexShrink: 1, lineHeight: spacing.lg },
  milestoneList: { gap: spacing.sm },
  milestoneCard: { gap: spacing.sm, padding: spacing.lg },
  milestoneHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  milestoneTitleRow: { alignItems: 'flex-start', flex: 1, flexDirection: 'row', gap: spacing.sm },
  milestoneTitle: { flex: 1, flexShrink: 1 },
});
