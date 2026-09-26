import { StyleSheet, useWindowDimensions, View } from 'react-native';

import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Progress } from '@/components/ui/Progress';
import { Screen } from '@/components/ui/Screen';
import { Typography } from '@/components/ui/Typography';
import { achievements, quizzes } from '@/data';
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
import type { Achievement, Progress as ProgressState } from '@/types';

function ruleProgress(achievement: Achievement, progress: ProgressState) {
  switch (achievement.rule.type) {
    case 'visited-projects':
      return progress.projects.filter((item) => item.lastVisitedAt).length;
    case 'completed-lessons':
      return progress.lessons.filter((item) => item.completedAt).length;
    case 'completed-quizzes':
      return progress.quizzes.filter((item) => item.completedAt).length;
    case 'perfect-quizzes':
      return progress.quizzes.filter((item) => {
        if (!item.completedAt) return false;
        const quiz = quizzes.find((candidate) => candidate.id === item.quizId);
        return Boolean(quiz && item.bestCorrectAnswerCount === quiz.questions.length);
      }).length;
    default: {
      const exhaustive: never = achievement.rule;
      return exhaustive;
    }
  }
}

function LoadingAchievements() {
  return (
    <Screen
      contentContainerStyle={styles.screen}
      edges={['bottom']}
      scrollViewProps={{ accessibilityLabel: 'Başarımlar yükleniyor' }}
    >
      <View style={styles.heading}>
        <View style={[styles.skeleton, styles.loadingLabel]} />
        <View style={[styles.skeleton, styles.loadingTitle]} />
        <View style={[styles.skeleton, styles.loadingLine]} />
      </View>
      <Card style={styles.summaryCard}>
        <View style={[styles.skeleton, styles.loadingTitle]} />
        <View style={[styles.skeleton, styles.loadingProgress]} />
      </Card>
      {achievements.map((achievement) => (
        <Card key={achievement.id} style={styles.achievementCard}>
          <View style={[styles.skeleton, styles.loadingLabel]} />
          <View style={[styles.skeleton, styles.loadingLine]} />
        </Card>
      ))}
    </Screen>
  );
}

export function AchievementsScreen() {
  const { width } = useWindowDimensions();
  const hasHydrated = useProgressStore((state) => state.hasHydrated);
  const totalXp = useProgressStore((state) => state.totalXp);
  const projectsProgress = useProgressStore((state) => state.projects);
  const lessonsProgress = useProgressStore((state) => state.lessons);
  const quizzesProgress = useProgressStore((state) => state.quizzes);
  const earnedAchievementIds = useProgressStore((state) => state.earnedAchievementIds);

  if (!hasHydrated) return <LoadingAchievements />;

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
  const earnedIds = new Set<string>(earnedAchievementIds);
  const earnedCount = achievements.filter((achievement) => earnedIds.has(achievement.id)).length;
  const completionPercentage = Math.round((earnedCount / achievements.length) * 100);
  const progressState: ProgressState = {
    earnedAchievementIds,
    lessons: lessonsProgress,
    projects: projectsProgress,
    quizzes: quizzesProgress,
    totalXp,
  };

  return (
    <Screen
      contentContainerStyle={styles.screen}
      edges={['bottom']}
      scrollViewProps={{ contentInsetAdjustmentBehavior: 'automatic' }}
    >
      <View style={styles.heading}>
        <Typography color="primary" variant="caption">GERÇEK İLERLEME</Typography>
        <Typography accessibilityRole="header" variant="h1">Başarımlar</Typography>
        <Typography color="textSecondary" style={styles.bodyLine} variant="bodyLarge">
          Proje keşfi, tamamlanan dersler ve quiz sonuçlarıyla açılan başarımlar.
        </Typography>
      </View>

      <Card
        accessibilityLabel={`${earnedCount}/${achievements.length} başarım kazanıldı`}
        raised
        style={styles.summaryCard}
      >
        <View style={styles.summaryRow}>
          <View style={styles.cardCopy}>
            <Typography color="primary" variant="caption">KAZANILAN</Typography>
            <Typography variant="h2">{earnedCount} / {achievements.length}</Typography>
          </View>
          <Typography color="textSecondary" variant="small">%{completionPercentage}</Typography>
        </View>
        <Progress
          accessibilityLabel={`Başarım ilerlemesi yüzde ${completionPercentage}`}
          color={earnedCount === achievements.length ? 'success' : 'primary'}
          value={completionPercentage}
        />
      </Card>

      <View style={styles.grid}>
        {achievements.map((achievement) => {
          const earned = earnedIds.has(achievement.id);
          const current = ruleProgress(achievement, progressState);
          const target = achievement.rule.count;
          const value = Math.round((Math.min(current, target) / target) * 100);

          return (
            <Card
              accessibilityLabel={`${achievement.title}, ${earned ? 'kazanıldı' : 'kilitli'}, ${Math.min(current, target)}/${target} ilerleme`}
              key={achievement.id}
              style={[styles.achievementCard, !earned && styles.lockedCard, { width: cardWidth }]}
            >
              <View style={styles.cardTop}>
                <View style={[styles.mark, !earned && styles.lockedMark]}>
                  <Typography color={earned ? 'onPrimary' : 'textMuted'} variant="button">
                    {earned ? '✓' : '—'}
                  </Typography>
                </View>
                <Badge variant={earned ? 'success' : 'neutral'}>
                  {earned ? 'Kazanıldı' : 'Kilitli'}
                </Badge>
              </View>
              <View style={styles.cardCopy}>
                <Typography color={earned ? 'text' : 'textSecondary'} variant="h3">
                  {achievement.title}
                </Typography>
                <Typography color={earned ? 'textSecondary' : 'textMuted'} style={styles.bodyLine}>
                  {achievement.description}
                </Typography>
              </View>
              <View style={styles.progressGroup}>
                <Progress
                  accessibilityLabel={`${achievement.title} koşulu yüzde ${value}`}
                  color={earned ? 'success' : 'primary'}
                  value={value}
                />
                <Typography color="textMuted" variant="caption">
                  İlerleme: {Math.min(current, target)} / {target}
                </Typography>
              </View>
            </Card>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    gap: spacing.xxl,
  },
  heading: {
    gap: spacing.xs,
  },
  bodyLine: {
    lineHeight: spacing.lg,
  },
  summaryCard: {
    gap: spacing.md,
    padding: spacing.xl,
  },
  summaryRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  achievementCard: {
    gap: spacing.lg,
  },
  lockedCard: {
    backgroundColor: colors.background,
  },
  cardTop: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  mark: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    borderRadius: radius.pill,
    borderWidth: border.width,
    height: sizing.button.medium,
    justifyContent: 'center',
    width: sizing.button.medium,
  },
  lockedMark: {
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.border,
  },
  cardCopy: {
    gap: spacing.xs,
  },
  progressGroup: {
    gap: spacing.xs,
  },
  skeleton: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.md,
  },
  loadingLabel: {
    height: spacing.md,
    width: '40%',
  },
  loadingTitle: {
    height: spacing.xxl,
    width: '60%',
  },
  loadingLine: {
    height: spacing.md,
    width: '80%',
  },
  loadingProgress: {
    height: spacing.xs,
    width: '100%',
  },
});
