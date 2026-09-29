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
import { achievementsById, lessons, projects } from '@/data';
import {
  getLearningStats,
  type LearningStats,
} from '@/features/progress/learningStats';
import { getCompletedProjectStageIds } from '@/features/progress/projectProgress';
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
import type { Lesson, Project, ProjectStatus } from '@/types';

import {
  formatActivityTime,
  getContinueActivity,
  getLatestLearningSummary,
  type ContinueActivity,
  type LearningSummary,
} from './homeProgress';

const projectStatus: Record<
  ProjectStatus,
  { label: string; variant: BadgeVariant }
> = {
  planned: { label: 'Planlandı', variant: 'neutral' },
  'in-progress': { label: 'Devam Ediyor', variant: 'warning' },
  completed: { label: 'Tamamlandı', variant: 'success' },
};

function navigate(href: Href) {
  router.push(href);
}

function SectionHeading({ title, actionLabel, href }: {
  title: string;
  actionLabel?: string;
  href?: Href;
}) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.sectionHeading}>
      <Typography accessibilityRole="header" variant="h3">{title}</Typography>
      {actionLabel && href ? (
        <Pressable
          accessibilityLabel={actionLabel}
          accessibilityRole="link"
          hitSlop={spacing.xs}
          onBlur={() => setFocused(false)}
          onFocus={() => setFocused(true)}
          onPress={() => navigate(href)}
          style={({ pressed }) => [
            styles.sectionAction,
            focused && styles.focusedControl,
            pressed && styles.sectionActionPressed,
          ]}
        >
          <Typography color="primary" variant="button">{actionLabel}</Typography>
        </Pressable>
      ) : null}
    </View>
  );
}

function LoadingHome() {
  return (
    <Screen
      contentContainerStyle={styles.screen}
      edges={['top', 'bottom']}
      scrollViewProps={{
        accessibilityLabel: 'Ana Sayfa yükleniyor',
        accessibilityState: { busy: true },
      }}
    >
      <View style={styles.loadingHeader}>
        <View style={[styles.skeleton, styles.loadingTitle]} />
        <View style={[styles.skeleton, styles.loadingAvatar]} />
      </View>
      {[spacing.max, spacing.max, spacing.max, spacing.xxxxl].map((height, index) => (
        <Card key={`${height}-${index}`} style={{ gap: spacing.md }}>
          <View style={[styles.skeleton, styles.loadingLabel]} />
          <View style={[styles.skeleton, { height }]} />
        </Card>
      ))}
    </Screen>
  );
}

function LearningOverview({ stats }: { stats: LearningStats }) {
  return (
    <Card
      accessibilityLabel={`Öğrenme özeti: ${stats.completedLessons}/${stats.totalLessons} ders, yüzde ${stats.lessonCompletionRate}, ${stats.xp} XP, seviye ${stats.level}`}
      style={styles.overviewCard}
    >
      <View style={styles.overviewTopRow}>
        <View style={styles.overviewItem}>
          <Typography color="textSecondary" variant="caption">DERSLER</Typography>
          <Typography variant="h3">
            {stats.completedLessons}/{stats.totalLessons}
          </Typography>
        </View>
        <View style={styles.overviewItem}>
          <Typography color="textSecondary" variant="caption">İLERLEME</Typography>
          <Typography variant="h3">%{stats.lessonCompletionRate}</Typography>
        </View>
        <View style={styles.overviewItem}>
          <Typography color="textSecondary" variant="caption">XP</Typography>
          <Typography variant="h3">{stats.xp}</Typography>
        </View>
        <View style={styles.overviewItem}>
          <Typography color="textSecondary" variant="caption">SEVİYE</Typography>
          <Typography variant="h3">{stats.level}</Typography>
        </View>
      </View>
      <Progress
        accessibilityLabel={`Ders ilerlemesi yüzde ${stats.lessonCompletionRate}`}
        value={stats.lessonCompletionRate}
      />
    </Card>
  );
}

function ContinueCard({ activity }: { activity: ContinueActivity }) {
  const occurredAt = activity.occurredAt ? formatActivityTime(activity.occurredAt) : undefined;
  return (
    <Card raised style={styles.continueCard}>
      <View style={styles.cardCopy}>
        <Typography color="primary" variant="caption">
          {`SON AKTİVİTE · ${activity.typeLabel.toUpperCase()}`}
        </Typography>
        <Typography accessibilityRole="header" variant="h2">{activity.title}</Typography>
        <Typography color="textSecondary" style={styles.bodyLine} variant="bodyLarge">
          {activity.description}
        </Typography>
        {occurredAt ? (
          <Typography color="textMuted" variant="caption">{occurredAt}</Typography>
        ) : null}
      </View>
      <Button
        accessibilityLabel={`${activity.action}: ${activity.title}`}
        onPress={() => navigate(activity.href)}
        size="large"
      >
        {activity.action}
      </Button>
    </Card>
  );
}

function StartCard() {
  return (
    <Card raised style={styles.continueCard}>
      <View style={styles.cardCopy}>
        <Typography color="primary" variant="caption">İLK ADIMINI SEÇ</Typography>
        <Typography accessibilityRole="header" variant="h2">ProjectLab’e başla</Typography>
        <Typography color="textSecondary" style={styles.bodyLine} variant="bodyLarge">
          Kısa bir dersle öğrenmeye başla veya projeleri keşfet.
        </Typography>
      </View>
      <View style={styles.startActions}>
        <Button accessibilityLabel="Öğren sayfasına git" onPress={() => navigate('/learn')}>
          Öğren’e Git
        </Button>
        <Button
          accessibilityLabel="Projeler sayfasına git"
          onPress={() => navigate('/projects')}
          variant="secondary"
        >
          Projeleri Keşfet
        </Button>
      </View>
    </Card>
  );
}

function LatestLearningCard({ summary }: { summary: LearningSummary }) {
  return (
    <Card style={styles.secondaryCard}>
      <Typography color="primary" variant="caption">{summary.eyebrow}</Typography>
      <View style={styles.cardCopy}>
        <Typography accessibilityRole="header" variant="h4">{summary.title}</Typography>
        <Typography color="textSecondary" style={styles.bodyLine}>
          {summary.description}
        </Typography>
        <Typography color="textMuted" variant="caption">
          {formatActivityTime(summary.occurredAt)}
        </Typography>
      </View>
      <Button accessibilityLabel="Öğrenme ilerlemesini aç" onPress={() => navigate('/learn')} variant="ghost">
        Öğrenme İlerlemesi
      </Button>
    </Card>
  );
}

function ProjectCard({ project, width }: { project: Project; width: number }) {
  const completedStageCount = getCompletedProjectStageIds(project).length;
  const progressValue = Math.round((completedStageCount / project.stages.length) * 100);
  const status = projectStatus[project.status];

  return (
    <Card style={[styles.projectCard, { width }]}>
      <View style={styles.projectCardTop}>
        <View style={styles.projectMonogram}>
          <Typography color="primary" variant="h4">{project.title.slice(0, 1)}</Typography>
        </View>
        <Badge variant={status.variant}>{status.label}</Badge>
      </View>
      <View style={styles.cardCopy}>
        <Typography accessibilityRole="header" variant="h4">{project.title}</Typography>
        <Typography color="textSecondary" numberOfLines={3} style={styles.bodyLine}>
          {project.summary}
        </Typography>
      </View>
      <View style={styles.progressBlock}>
        <View style={styles.metaRow}>
          <Typography color="textMuted" variant="caption">Kişisel ilerleme</Typography>
          <Typography color="textSecondary" variant="caption">%{progressValue}</Typography>
        </View>
        <Progress
          accessibilityLabel={`${project.title} kişisel ilerlemesi yüzde ${progressValue}`}
          value={progressValue}
        />
      </View>
      <Button
        accessibilityLabel={`${project.title} projesini aç`}
        onPress={() => navigate(`/projects/${project.id}` as Href)}
        variant="secondary"
      >
        Projeyi Aç
      </Button>
    </Card>
  );
}

function LearningCard({ lesson }: { lesson: Lesson }) {
  const progress = useProgressStore((state) =>
    state.lessons.find((item) => item.lessonId === lesson.id),
  );
  const status = progress?.completedAt
    ? { label: 'Tamamlandı', variant: 'success' as const }
    : progress?.lastBlockId
      ? { label: 'Devam Ediyor', variant: 'warning' as const }
      : { label: 'Başlanmadı', variant: 'neutral' as const };

  return (
    <Card style={styles.learningCard}>
      <View style={styles.learningMeta}>
        <Badge variant={status.variant}>{status.label}</Badge>
        <Typography color="textMuted" variant="caption">
          {lesson.durationMinutes} dk · +{lesson.completionXp} XP
        </Typography>
      </View>
      <View style={styles.cardCopy}>
        <Typography accessibilityRole="header" variant="h4">{lesson.title}</Typography>
        <Typography color="textSecondary" style={styles.bodyLine}>{lesson.summary}</Typography>
      </View>
      <Button
        accessibilityLabel={`${lesson.title} dersini aç`}
        onPress={() => navigate(`/learn/${lesson.id}` as Href)}
        variant="secondary"
      >
        {progress?.completedAt ? 'Tekrar İncele' : progress?.lastBlockId ? 'Devam Et' : 'Dersi Aç'}
      </Button>
    </Card>
  );
}

function DailyTask({ lesson }: { lesson: Lesson }) {
  const completed = useProgressStore((state) =>
    Boolean(state.lessons.find((item) => item.lessonId === lesson.id)?.completedAt),
  );

  return (
    <Card style={styles.secondaryCard}>
      <View style={styles.secondaryCardTop}>
        <Typography color="primary" variant="caption">GÜNLÜK GÖREV</Typography>
        <Badge variant={completed ? 'success' : 'primary'}>
          {completed ? 'Tamamlandı' : `+${lesson.completionXp} XP`}
        </Badge>
      </View>
      <View style={styles.cardCopy}>
        <Typography accessibilityRole="header" variant="h4">Bir mikro dersi tamamla</Typography>
        <Typography color="textSecondary" style={styles.bodyLine}>
          {completed ? `${lesson.title} tamamlandı.` : `${lesson.title} ile bugünkü öğrenme adımını tamamla.`}
        </Typography>
      </View>
      <Button
        accessibilityLabel={completed ? 'Öğren sayfasını aç' : `${lesson.title} günlük görevini aç`}
        onPress={() => navigate(completed ? '/learn' : `/learn/${lesson.id}` as Href)}
        variant="ghost"
      >
        {completed ? 'Öğren’e Git' : 'Görevi Aç'}
      </Button>
    </Card>
  );
}

function LatestAchievement() {
  const earnedAchievementIds = useProgressStore((state) => state.earnedAchievementIds);
  const latestId = earnedAchievementIds.at(-1);
  const achievement = latestId ? achievementsById[latestId] : undefined;

  return (
    <Card style={styles.secondaryCard}>
      <View style={styles.secondaryCardTop}>
        <Typography color="primary" variant="caption">SON BAŞARIM</Typography>
        {achievement ? <Badge variant="success">Kazanıldı</Badge> : null}
      </View>
      <View style={styles.cardCopy}>
        <Typography accessibilityRole="header" variant="h4">
          {achievement?.title ?? 'Henüz başarım yok'}
        </Typography>
        <Typography color="textSecondary" style={styles.bodyLine}>
          {achievement?.description ?? 'Projeleri keşfet, dersleri tamamla ve ilk başarımını kazan.'}
        </Typography>
      </View>
      <Button
        accessibilityLabel="Tüm başarımları aç"
        onPress={() => navigate('/profile/achievements')}
        variant="ghost"
      >
        Tüm Başarımlar
      </Button>
    </Card>
  );
}

export function HomeScreen() {
  const { width } = useWindowDimensions();
  const [avatarFocused, setAvatarFocused] = useState(false);
  const hasHydrated = useProgressStore((state) => state.hasHydrated);
  const totalXp = useProgressStore((state) => state.totalXp);
  const lessonProgress = useProgressStore((state) => state.lessons);
  const projectProgress = useProgressStore((state) => state.projects);
  const quizProgress = useProgressStore((state) => state.quizzes);
  const quizHistory = useProgressStore((state) => state.quizHistory);
  const lastActivity = useProgressStore((state) => state.lastActivity);

  const horizontalPadding = width >= breakpoints.medium
    ? layout.horizontalPadding.wide.min
    : layout.horizontalPadding.mobile;
  const contentWidth = Math.min(width - horizontalPadding * 2, layout.contentMaxWidth);
  const projectColumns = width >= breakpoints.expanded
    ? layout.columns.wide.max
    : width >= breakpoints.medium
      ? layout.columns.wide.min
      : layout.columns.mobile;
  const projectCardWidth =
    (contentWidth - spacing.md * (projectColumns - 1)) / projectColumns;
  const secondaryColumns = width >= breakpoints.medium ? layout.columns.wide.min : 1;
  const secondaryCardWidth =
    (contentWidth - spacing.md * (secondaryColumns - 1)) / secondaryColumns;
  const todayLesson = lessons.find(
    (lesson) => !lessonProgress.find((item) => item.lessonId === lesson.id)?.completedAt,
  ) ?? lessons[0];
  const progressSource = useMemo(() => ({
    lastActivity,
    lessons: lessonProgress,
    projects: projectProgress,
    quizHistory,
    quizzes: quizProgress,
    totalXp,
  }), [lastActivity, lessonProgress, projectProgress, quizHistory, quizProgress, totalXp]);
  const learningStats = useMemo(() => getLearningStats(progressSource), [progressSource]);
  const continueActivity = getContinueActivity(learningStats.lastActivity);
  const latestLearning = getLatestLearningSummary(lessonProgress, quizHistory);

  if (!hasHydrated) return <LoadingHome />;

  return (
    <Screen
      contentContainerStyle={styles.screen}
      edges={['top', 'bottom']}
      scrollViewProps={{ contentInsetAdjustmentBehavior: 'automatic' }}
    >
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Typography color="textSecondary" variant="bodyLarge">Tekrar hoş geldin</Typography>
          <Typography accessibilityRole="header" variant="h1">ProjectLab</Typography>
        </View>
        <Pressable
          accessibilityLabel="Profili aç"
          accessibilityRole="link"
          onBlur={() => setAvatarFocused(false)}
          onFocus={() => setAvatarFocused(true)}
          onPress={() => navigate('/profile')}
          style={({ pressed }) => [
            styles.avatar,
            avatarFocused && styles.focusedControl,
            pressed && styles.avatarPressed,
          ]}
        >
          <Typography color="onPrimary" variant="button">PL</Typography>
        </Pressable>
      </View>

      <View style={styles.section}>
        <SectionHeading title="Öğrenme Özeti" />
        <LearningOverview stats={learningStats} />
      </View>

      <View style={styles.section}>
        <SectionHeading title="Kaldığın Yerden Devam Et" />
        {continueActivity ? <ContinueCard activity={continueActivity} /> : <StartCard />}
      </View>

      <View style={styles.section}>
        <SectionHeading title="Projelerim" actionLabel="Tümünü Gör" href="/projects" />
        <View style={styles.grid}>
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} width={projectCardWidth} />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <SectionHeading title="Bugün Öğren" actionLabel="Öğren’e Git" href="/learn" />
        <LearningCard lesson={todayLesson} />
      </View>

      <View style={styles.grid}>
        {latestLearning ? (
          <View style={{ width: secondaryCardWidth }}>
            <LatestLearningCard summary={latestLearning} />
          </View>
        ) : null}
        <View style={{ width: secondaryCardWidth }}>
          <DailyTask lesson={todayLesson} />
        </View>
        <View style={{ width: secondaryCardWidth }}>
          <LatestAchievement />
        </View>
      </View>

      <Button
        accessibilityLabel="Portföy moduna geç"
        onPress={() => navigate('/portfolio')}
        variant="ghost"
      >
        Portföy Moduna Geç
      </Button>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    gap: spacing.xxl,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerCopy: {
    gap: spacing.xxs,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: colors.primaryActive,
    borderColor: 'transparent',
    borderWidth: border.width,
    borderRadius: radius.pill,
    height: sizing.button.large,
    justifyContent: 'center',
    width: sizing.button.large,
  },
  avatarPressed: {
    borderColor: colors.onPrimary,
  },
  overviewCard: {
    gap: spacing.md,
  },
  overviewTopRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
    justifyContent: 'space-between',
  },
  overviewItem: {
    flexBasis: '20%',
    flexGrow: 1,
    gap: spacing.xxs,
    minWidth: sizing.button.large,
  },
  section: {
    gap: spacing.md,
  },
  sectionHeading: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: sizing.touchTarget.minHeight,
  },
  continueCard: {
    gap: spacing.xl,
    padding: spacing.xl,
  },
  startActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  cardCopy: {
    gap: spacing.xs,
  },
  bodyLine: {
    lineHeight: spacing.lg,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  projectCard: {
    gap: spacing.lg,
  },
  projectCardTop: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  projectMonogram: {
    alignItems: 'center',
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.md,
    height: sizing.button.medium,
    justifyContent: 'center',
    width: sizing.button.medium,
  },
  progressBlock: {
    gap: spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  learningCard: {
    gap: spacing.lg,
  },
  learningMeta: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  secondaryCard: {
    gap: spacing.lg,
    height: '100%',
  },
  secondaryCardTop: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  sectionAction: {
    borderColor: 'transparent',
    borderWidth: border.width,
    borderRadius: radius.sm,
    padding: spacing.xs,
  },
  focusedControl: {
    borderColor: colors.primaryHover,
  },
  sectionActionPressed: {
    backgroundColor: colors.surfaceRaised,
  },
  loadingHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  skeleton: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.md,
  },
  loadingTitle: {
    height: spacing.xxl,
    width: '50%',
  },
  loadingAvatar: {
    borderRadius: radius.pill,
    height: sizing.button.large,
    width: sizing.button.large,
  },
  loadingLabel: {
    height: spacing.md,
    width: '40%',
  },
});
