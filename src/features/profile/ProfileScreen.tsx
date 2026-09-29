import type { Href } from 'expo-router';
import { router } from 'expo-router';
import { StyleSheet, useWindowDimensions, View } from 'react-native';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Progress } from '@/components/ui/Progress';
import { Screen } from '@/components/ui/Screen';
import { Typography } from '@/components/ui/Typography';
import {
  achievements,
  lessonsById,
  projects,
  projectsById,
  quizzesById,
} from '@/data';
import { getLevelProgress, XP_PER_LEVEL } from '@/features/progress/level';
import {
  getCategoryProgress,
  getLearningStats,
  getQuizStats,
  type LatestActivity,
  type QuizStats,
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
import type { Project, ProjectProgress } from '@/types';

function navigate(href: Href) {
  router.push(href);
}

function getPercentage(completed: number, total: number) {
  return total > 0 ? Math.round((completed / total) * 100) : 0;
}

function getCompletedStageCount(project: Project) {
  return getCompletedProjectStageIds(project).length;
}

function SectionHeading({ description, title }: { description: string; title: string }) {
  return (
    <View style={styles.sectionHeading}>
      <Typography accessibilityRole="header" variant="h3">{title}</Typography>
      <Typography color="textSecondary" style={styles.bodyLine}>{description}</Typography>
    </View>
  );
}

function LoadingProfile() {
  return (
    <Screen
      contentContainerStyle={styles.screen}
      edges={['top', 'bottom']}
      scrollViewProps={{
        accessibilityLabel: 'Profil yükleniyor',
        accessibilityState: { busy: true },
      }}
    >
      <Card raised style={styles.profileCard}>
        <View style={[styles.skeleton, styles.loadingAvatar]} />
        <View style={styles.loadingCopy}>
          <View style={[styles.skeleton, styles.loadingTitle]} />
          <View style={[styles.skeleton, styles.loadingLine]} />
        </View>
      </Card>
      <Card style={styles.loadingCard}>
        <View style={[styles.skeleton, styles.loadingLabel]} />
        <View style={[styles.skeleton, styles.loadingProgress]} />
      </Card>
      <View style={styles.loadingGrid}>
        {achievements.map((achievement) => (
          <Card key={achievement.id} style={styles.loadingAchievement}>
            <View style={[styles.skeleton, styles.loadingLabel]} />
            <View style={[styles.skeleton, styles.loadingLine]} />
          </Card>
        ))}
      </View>
    </Screen>
  );
}

function ProfileSummary() {
  return (
    <Card raised style={styles.profileCard}>
      <View accessibilityLabel="ProjectLab profil avatarı" style={styles.avatar}>
        <Typography color="onPrimary" variant="h3">PL</Typography>
      </View>
      <View style={styles.profileCopy}>
        <View style={styles.titleRow}>
          <View style={styles.titleCopy}>
            <Typography accessibilityRole="header" variant="h1">ProjectLab Geliştiricisi</Typography>
            <Typography color="textSecondary" style={styles.bodyLine} variant="bodyLarge">
              Gerçek projeler üzerinden öğreniyor, üretiyor ve ilerlemeyi görünür kılıyor.
            </Typography>
          </View>
          <Badge variant="primary">Kişisel Profil</Badge>
        </View>
        <Button
          accessibilityLabel="Portföyü gör"
          onPress={() => navigate('/portfolio')}
          variant="ghost"
        >
          Portföyü Gör
        </Button>
      </View>
    </Card>
  );
}

function LevelCard({ totalXp }: { totalXp: number }) {
  const safeTotalXp = Number.isFinite(totalXp) ? Math.max(0, totalXp) : 0;
  const { currentLevelXp, level, progressPercentage, xpToNextLevel } = getLevelProgress(safeTotalXp);

  return (
    <Card
      accessibilityLabel={`Seviye ${level}, toplam ${safeTotalXp} XP, sonraki seviyeye ${xpToNextLevel} XP`}
      style={styles.levelCard}
    >
      <View style={styles.levelTopRow}>
        <View style={styles.levelBadge}>
          <Typography color="primary" variant="caption">SEVİYE</Typography>
          <Typography variant="displayCompact">{level}</Typography>
        </View>
        <View style={styles.xpCopy}>
          <Typography variant="h3">{safeTotalXp} XP</Typography>
          <Typography color="textSecondary" variant="small">
            Bu seviyede {currentLevelXp} / {XP_PER_LEVEL} XP
          </Typography>
        </View>
      </View>
      <View style={styles.progressBlock}>
        <Progress
          accessibilityLabel={`Seviye ${level} ilerlemesi yüzde ${progressPercentage}`}
          value={progressPercentage}
        />
        <Typography color="textMuted" variant="caption">
          Sonraki seviyeye {xpToNextLevel} XP kaldı
        </Typography>
      </View>
    </Card>
  );
}

type Metric = Readonly<{
  label: string;
  value: string;
}>;

function MetricsGrid({
  cardWidth,
  metrics,
}: {
  cardWidth: number | '100%';
  metrics: readonly Metric[];
}) {
  return (
    <View style={styles.grid}>
      {metrics.map((metric) => (
        <Card
          accessibilityLabel={`${metric.label}: ${metric.value}`}
          key={metric.label}
          style={[styles.metricCard, { width: cardWidth }]}
        >
          <Typography variant="h3">{metric.value}</Typography>
          <Typography color="textSecondary" variant="small">{metric.label}</Typography>
        </Card>
      ))}
    </View>
  );
}

function DomainProgress({ completed, label, total }: {
  completed: number;
  label: string;
  total: number;
}) {
  const percentage = getPercentage(completed, total);

  return (
    <View style={styles.domainRow}>
      <View style={styles.metaRow}>
        <Typography variant="button">{label}</Typography>
        <Typography color="textSecondary" variant="caption">
          {completed} / {total} · %{percentage}
        </Typography>
      </View>
      <Progress accessibilityLabel={`${label} yüzde ${percentage}`} value={percentage} />
    </View>
  );
}

function LearningSummary({
  completedLessons,
  completedQuizzes,
  lessonCompletionRate,
  quizAccuracy,
  quizCompletionRate,
  totalLessons,
  totalQuizzes,
}: {
  completedLessons: number;
  completedQuizzes: number;
  lessonCompletionRate: number;
  quizAccuracy: number | null;
  quizCompletionRate: number;
  totalLessons: number;
  totalQuizzes: number;
}) {
  return (
    <Card style={styles.statsCard}>
      <Typography accessibilityRole="header" variant="h4">Öğrenme Özeti</Typography>
      <DomainProgress completed={completedLessons} label="Ders ilerlemesi" total={totalLessons} />
      <DomainProgress completed={completedQuizzes} label="Quiz ilerlemesi" total={totalQuizzes} />
      <View style={styles.metaRow}>
        <Typography variant="button">Genel doğruluk</Typography>
        <Typography color={quizAccuracy === null ? 'textMuted' : 'text'} variant="h4">
          {quizAccuracy === null ? 'Veri yetersiz' : `%${quizAccuracy}`}
        </Typography>
      </View>
      <Typography color="textMuted" variant="caption">
        Ders %{lessonCompletionRate} · Quiz %{quizCompletionRate}
      </Typography>
    </Card>
  );
}

function CategoryProgressCard({ categories }: {
  categories: ReturnType<typeof getCategoryProgress>;
}) {
  return (
    <Card style={styles.statsCard}>
      <Typography accessibilityRole="header" variant="h4">Kategori İlerlemesi</Typography>
      {categories.map((category) => (
        <DomainProgress
          completed={category.completedLessons}
          key={category.category}
          label={category.label}
          total={category.totalLessons}
        />
      ))}
    </Card>
  );
}

function QuizPerformance({ stats }: { stats: QuizStats }) {
  const isIncomplete = stats.historyStatus === 'incomplete-history';
  const metrics: readonly Metric[] = [
    {
      label: isIncomplete ? 'Kayıtlı genel doğruluk' : 'Genel doğruluk',
      value: stats.quizAccuracy === null ? 'Veri yetersiz' : `%${stats.quizAccuracy}`,
    },
    { label: isIncomplete ? 'Kayıtlı full attempt' : 'Full attempt', value: String(stats.fullAttempts) },
    { label: isIncomplete ? 'Kayıtlı retry attempt' : 'Retry attempt', value: String(stats.retryAttempts) },
    { label: isIncomplete ? 'Kayıtlı toplam attempt' : 'Toplam attempt', value: String(stats.quizAttempts) },
  ];

  return (
    <Card style={styles.statsCard}>
      <Typography accessibilityRole="header" variant="h4">Quiz Performansı</Typography>
      <MetricsGrid cardWidth="100%" metrics={metrics} />
      {isIncomplete ? (
        <Typography accessibilityLabel="Geçmiş quiz verisi eksik" color="textMuted" variant="small">
          Geçmiş quiz verisi eksik. Yalnızca kayıtlı denemeler gösteriliyor.
        </Typography>
      ) : stats.historyStatus === 'no-data' ? (
        <Typography color="textMuted" variant="small">Henüz quiz performans verisi yok.</Typography>
      ) : null}
    </Card>
  );
}

function getActivityDetails(activity: LatestActivity): Readonly<{ title: string; type: string }> {
  if (activity.type === 'lesson') {
    return { title: lessonsById[activity.lessonId]?.title ?? 'Ders', type: 'Ders' };
  }
  if (activity.type === 'quiz') {
    return { title: quizzesById[activity.quizId]?.title ?? 'Quiz', type: 'Quiz' };
  }
  return { title: projectsById[activity.projectId]?.title ?? 'Proje', type: 'Proje' };
}

function formatActivityDate(value: string): string {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return 'Tarih bilgisi yok';

  return new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

function LastActivityCard({ activity }: { activity: LatestActivity | null }) {
  if (!activity) {
    return (
      <Card style={styles.statsCard}>
        <Typography accessibilityRole="header" variant="h4">Son Aktivite</Typography>
        <Typography color="textMuted">Henüz aktivite yok.</Typography>
      </Card>
    );
  }

  const details = getActivityDetails(activity);
  const date = formatActivityDate(activity.occurredAt);

  return (
    <Card
      accessibilityLabel={`Son aktivite, ${details.type}, ${details.title}, ${date}`}
      style={styles.statsCard}
    >
      <Typography accessibilityRole="header" variant="h4">Son Aktivite</Typography>
      <View style={styles.metaRow}>
        <View style={styles.cardCopy}>
          <Typography variant="button">{details.title}</Typography>
          <Typography color="textSecondary" variant="small">Tür: {details.type}</Typography>
        </View>
        <Typography color="textSecondary" variant="small">{date}</Typography>
      </View>
    </Card>
  );
}

function ProjectProgressCard({ progress, project, width }: {
  progress?: ProjectProgress;
  project: Project;
  width: number;
}) {
  const completedStageCount = getCompletedStageCount(project);
  const percentage = getPercentage(completedStageCount, project.stages.length);

  return (
    <Card
      accessibilityLabel={`${project.title}, ${completedStageCount}/${project.stages.length} aşama tamamlandı`}
      style={[styles.projectCard, { width }]}
    >
      <View style={styles.metaRow}>
        <Typography accessibilityRole="header" variant="h4">{project.title}</Typography>
        <Badge variant={percentage === 100 ? 'success' : progress?.lastVisitedAt ? 'warning' : 'neutral'}>
          %{percentage}
        </Badge>
      </View>
      <Progress
        accessibilityLabel={`${project.title} proje ilerlemesi yüzde ${percentage}`}
        color={percentage === 100 ? 'success' : 'primary'}
        value={percentage}
      />
      <Typography color="textMuted" variant="caption">
        {completedStageCount} / {project.stages.length} aşama tamamlandı
      </Typography>
    </Card>
  );
}

function AchievementGrid({ cardWidth, earnedIds }: {
  cardWidth: number;
  earnedIds: ReadonlySet<string>;
}) {
  return (
    <View style={styles.grid}>
      {achievements.map((achievement) => {
        const earned = earnedIds.has(achievement.id);

        return (
          <Card
            accessibilityLabel={`${achievement.title}, ${earned ? 'kazanıldı' : 'kilitli'}`}
            key={achievement.id}
            style={[styles.achievementCard, !earned && styles.lockedCard, { width: cardWidth }]}
          >
            <View style={styles.achievementTop}>
              <View style={[styles.achievementMark, !earned && styles.lockedMark]}>
                <Typography color={earned ? 'onPrimary' : 'textMuted'} variant="button">
                  {earned ? '✓' : '—'}
                </Typography>
              </View>
              <Badge variant={earned ? 'success' : 'neutral'}>
                {earned ? 'Kazanıldı' : 'Kilitli'}
              </Badge>
            </View>
            <View style={styles.cardCopy}>
              <Typography accessibilityRole="header" color={earned ? 'text' : 'textSecondary'} variant="h4">
                {achievement.title}
              </Typography>
              <Typography color={earned ? 'textSecondary' : 'textMuted'} style={styles.bodyLine}>
                {achievement.description}
              </Typography>
            </View>
          </Card>
        );
      })}
    </View>
  );
}

export function ProfileScreen() {
  const { width } = useWindowDimensions();
  const hasHydrated = useProgressStore((state) => state.hasHydrated);
  const totalXp = useProgressStore((state) => state.totalXp);
  const projectProgress = useProgressStore((state) => state.projects);
  const lessonProgress = useProgressStore((state) => state.lessons);
  const quizProgress = useProgressStore((state) => state.quizzes);
  const quizHistory = useProgressStore((state) => state.quizHistory);
  const lastActivity = useProgressStore((state) => state.lastActivity);
  const earnedAchievementIds = useProgressStore((state) => state.earnedAchievementIds);

  if (!hasHydrated) return <LoadingProfile />;

  const horizontalPadding = width >= breakpoints.medium
    ? layout.horizontalPadding.wide.min
    : layout.horizontalPadding.mobile;
  const contentWidth = Math.min(width - horizontalPadding * 2, layout.contentMaxWidth);
  const summaryColumns = width >= breakpoints.expanded
    ? layout.columns.wide.max
    : width >= breakpoints.compact
      ? layout.columns.wide.min
      : layout.columns.mobile;
  const contentColumns = width >= breakpoints.medium ? layout.columns.wide.min : layout.columns.mobile;
  const achievementColumns = width >= breakpoints.expanded
    ? layout.columns.wide.max
    : contentColumns;
  const summaryCardWidth = (contentWidth - spacing.md * (summaryColumns - 1)) / summaryColumns;
  const contentCardWidth = (contentWidth - spacing.md * (contentColumns - 1)) / contentColumns;
  const achievementCardWidth =
    (contentWidth - spacing.md * (achievementColumns - 1)) / achievementColumns;

  const progressSource = {
    totalXp,
    projects: projectProgress,
    lessons: lessonProgress,
    quizzes: quizProgress,
    quizHistory,
    lastActivity,
  };
  const learningStats = getLearningStats(progressSource);
  const categoryProgress = getCategoryProgress(progressSource);
  const quizStats = getQuizStats(progressSource);
  const completedProjectCount = projects.filter(
    (project) => getCompletedStageCount(project) === project.stages.length,
  ).length;
  const earnedIds = new Set<string>(earnedAchievementIds);
  const metrics: readonly Metric[] = [
    { label: 'Toplam proje', value: String(projects.length) },
    { label: 'Tamamlanan proje', value: String(completedProjectCount) },
    { label: 'Kazanılan başarım', value: `${earnedIds.size} / ${achievements.length}` },
  ];

  return (
    <Screen
      contentContainerStyle={styles.screen}
      edges={['top', 'bottom']}
      scrollViewProps={{ contentInsetAdjustmentBehavior: 'automatic' }}
    >
      <ProfileSummary />
      <LevelCard totalXp={totalXp} />

      <View style={styles.section}>
        <SectionHeading
          description="Projeler, dersler ve quizlerden gelen güncel kişisel görünüm."
          title="İlerlemem"
        />
        <MetricsGrid cardWidth={summaryCardWidth} metrics={metrics} />
        <LearningSummary
          completedLessons={learningStats.completedLessons}
          completedQuizzes={learningStats.completedQuizzes}
          lessonCompletionRate={learningStats.lessonCompletionRate}
          quizAccuracy={quizStats.quizAccuracy}
          quizCompletionRate={learningStats.quizCompletionRate}
          totalLessons={learningStats.totalLessons}
          totalQuizzes={learningStats.totalQuizzes}
        />
        <CategoryProgressCard categories={categoryProgress} />
        <QuizPerformance stats={quizStats} />
        <LastActivityCard activity={learningStats.lastActivity} />
        <Card style={styles.domainCard}>
          <DomainProgress completed={completedProjectCount} label="Projeler" total={projects.length} />
        </Card>
        <View style={styles.grid}>
          {projects.map((project) => (
            <ProjectProgressCard
              key={project.id}
              progress={projectProgress.find((item) => item.projectId === project.id)}
              project={project}
              width={contentCardWidth}
            />
          ))}
        </View>
        <Button
          accessibilityLabel="Ayrıntılı ilerlemeyi aç"
          onPress={() => navigate('/profile/progress')}
          size="large"
          variant="secondary"
        >
          Ayrıntılı İlerlemeyi Gör
        </Button>
      </View>

      <View style={styles.section}>
        <SectionHeading
          description="Gerçek proje ve öğrenme adımlarından kazanılan altı başarım."
          title="Başarımlar"
        />
        <AchievementGrid cardWidth={achievementCardWidth} earnedIds={earnedIds} />
        <Button
          accessibilityLabel="Tüm başarımları aç"
          onPress={() => navigate('/profile/achievements')}
          size="large"
          variant="secondary"
        >
          Tüm Başarımları Gör
        </Button>
      </View>

      <Card style={styles.settingsCard}>
        <View style={styles.settingsCopy}>
          <Typography accessibilityRole="header" variant="h4">Profil ve uygulama ayarları</Typography>
          <Typography color="textSecondary" style={styles.bodyLine}>
            Profil bilgilerini ve yerel uygulama tercihlerini yönet.
          </Typography>
        </View>
        <Button
          accessibilityLabel="Ayarları aç"
          onPress={() => navigate('/profile/settings')}
          variant="ghost"
        >
          Ayarları Aç
        </Button>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    gap: spacing.xxl,
  },
  section: {
    gap: spacing.md,
  },
  sectionHeading: {
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
  profileCard: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xl,
    padding: spacing.xl,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: colors.primaryActive,
    borderRadius: radius.pill,
    height: spacing.max,
    justifyContent: 'center',
    width: spacing.max,
  },
  profileCopy: {
    flex: 1,
    gap: spacing.lg,
    minWidth: layout.readingWidth.min / layout.columns.wide.max,
  },
  titleRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  titleCopy: {
    flex: 1,
    gap: spacing.xs,
    minWidth: layout.readingWidth.min / layout.columns.wide.max,
  },
  levelCard: {
    gap: spacing.lg,
    padding: spacing.xl,
  },
  levelTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  levelBadge: {
    gap: spacing.xxs,
  },
  xpCopy: {
    alignItems: 'flex-end',
    flexShrink: 1,
    gap: spacing.xxs,
  },
  progressBlock: {
    gap: spacing.xs,
  },
  metricCard: {
    gap: spacing.xs,
    minHeight: sizing.control.important + spacing.xxxl,
  },
  domainCard: {
    gap: spacing.lg,
  },
  domainRow: {
    gap: spacing.xs,
  },
  metaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  projectCard: {
    gap: spacing.md,
  },
  statsCard: {
    gap: spacing.lg,
  },
  achievementCard: {
    gap: spacing.md,
  },
  lockedCard: {
    backgroundColor: colors.background,
  },
  achievementTop: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  achievementMark: {
    alignItems: 'center',
    backgroundColor: colors.primaryActive,
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
  settingsCard: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
    justifyContent: 'space-between',
  },
  settingsCopy: {
    flex: 1,
    gap: spacing.xs,
    minWidth: layout.readingWidth.min / layout.columns.wide.max,
  },
  skeleton: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.md,
  },
  loadingAvatar: {
    borderRadius: radius.pill,
    height: spacing.max,
    width: spacing.max,
  },
  loadingCopy: {
    flex: 1,
    gap: spacing.sm,
  },
  loadingTitle: {
    height: spacing.xxl,
    width: '60%',
  },
  loadingLine: {
    height: spacing.md,
    width: '80%',
  },
  loadingCard: {
    gap: spacing.md,
  },
  loadingLabel: {
    height: spacing.md,
    width: '40%',
  },
  loadingProgress: {
    height: spacing.xs,
    width: '100%',
  },
  loadingGrid: {
    gap: spacing.md,
  },
  loadingAchievement: {
    gap: spacing.md,
    minHeight: spacing.max,
  },
});
