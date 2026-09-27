import type { Href } from 'expo-router';
import { router } from 'expo-router';
import { StyleSheet, useWindowDimensions, View } from 'react-native';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Progress } from '@/components/ui/Progress';
import { Screen } from '@/components/ui/Screen';
import { Typography } from '@/components/ui/Typography';
import { achievements, lessons, projects, quizzes } from '@/data';
import { getLevelProgress, XP_PER_LEVEL } from '@/features/progress/level';
import { getCompletedProjectStageIds } from '@/features/progress/projectProgress';
import { getProfileLearningStats } from '@/features/profile/profileStats';
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
import type { LessonCategory, Project, ProjectProgress } from '@/types';

const categoryLabels: Record<LessonCategory, string> = {
  'ui-ux': 'UI/UX',
  frontend: 'Frontend',
  'backend-api': 'Backend & API',
  database: 'Veritabanı',
  'git-github': 'Git & GitHub',
  'deploy-cloud': 'Deploy & Cloud',
  'project-planning': 'Proje Planlama',
};

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

function MetricsGrid({ cardWidth, metrics }: { cardWidth: number; metrics: readonly Metric[] }) {
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
        <Typography color="textSecondary" variant="caption">{completed} / {total}</Typography>
      </View>
      <Progress accessibilityLabel={`${label} yüzde ${percentage}`} value={percentage} />
    </View>
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

function LearningTopics({ completedLessonIds }: { completedLessonIds: ReadonlySet<string> }) {
  const topics = Object.entries(
    lessons.reduce<Partial<Record<LessonCategory, { completed: number; total: number }>>>((result, lesson) => {
      const current = result[lesson.category] ?? { completed: 0, total: 0 };
      result[lesson.category] = {
        completed: current.completed + (completedLessonIds.has(lesson.id) ? 1 : 0),
        total: current.total + 1,
      };
      return result;
    }, {}),
  ) as [LessonCategory, { completed: number; total: number }][];

  return (
    <Card style={styles.learningCard}>
      <Typography accessibilityRole="header" variant="h4">Öğrenme konuları</Typography>
      {topics.map(([category, counts]) => (
        <DomainProgress
          completed={counts.completed}
          key={category}
          label={categoryLabels[category]}
          total={counts.total}
        />
      ))}
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
  const earnedAchievementIds = useProgressStore((state) => state.earnedAchievementIds);

  if (!hasHydrated) return <LoadingProfile />;

  const horizontalPadding = width >= breakpoints.medium
    ? layout.horizontalPadding.wide.min
    : layout.horizontalPadding.mobile;
  const contentWidth = Math.min(width - horizontalPadding * 2, layout.contentMaxWidth);
  const summaryColumns = width >= breakpoints.expanded
    ? layout.columns.wide.max
    : layout.columns.wide.min;
  const contentColumns = width >= breakpoints.medium ? layout.columns.wide.min : layout.columns.mobile;
  const achievementColumns = width >= breakpoints.expanded
    ? layout.columns.wide.max
    : contentColumns;
  const summaryCardWidth = (contentWidth - spacing.md * (summaryColumns - 1)) / summaryColumns;
  const contentCardWidth = (contentWidth - spacing.md * (contentColumns - 1)) / contentColumns;
  const achievementCardWidth =
    (contentWidth - spacing.md * (achievementColumns - 1)) / achievementColumns;

  const completedLessonIds = new Set(
    lessonProgress.filter((item) => item.completedAt).map((item) => item.lessonId),
  );
  const learningStats = getProfileLearningStats(lessonProgress, quizHistory);
  const completedQuizCount = quizProgress.filter((item) => item.completedAt).length;
  const completedProjectCount = projects.filter(
    (project) => getCompletedStageCount(project) === project.stages.length,
  ).length;
  const earnedIds = new Set<string>(earnedAchievementIds);
  const metrics: readonly Metric[] = [
    { label: 'Toplam proje', value: String(projects.length) },
    { label: 'Tamamlanan proje', value: String(completedProjectCount) },
    { label: 'Tamamlanan ders', value: String(learningStats.completedLessonCount) },
    { label: 'Full quiz denemesi', value: String(learningStats.fullQuizAttemptCount) },
    ...(learningStats.bestFullQuizScore === undefined
      ? []
      : [{ label: 'En iyi full quiz skoru', value: `%${learningStats.bestFullQuizScore}` }]),
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
        {learningStats.completedLessonCount === 0 && learningStats.fullQuizAttemptCount === 0 ? (
          <Card accessibilityLabel="Öğrenme ilerlemesi başlangıç durumu" style={styles.emptyCard}>
            <Typography accessibilityRole="header" variant="h4">İlk adımını at</Typography>
            <Typography color="textSecondary" style={styles.bodyLine}>
              Bir ders veya full quiz tamamladığında öğrenme istatistiklerin burada görünecek.
            </Typography>
          </Card>
        ) : null}
        <Card style={styles.domainCard}>
          <DomainProgress completed={completedProjectCount} label="Projeler" total={projects.length} />
          <DomainProgress completed={completedLessonIds.size} label="Dersler" total={lessons.length} />
          <DomainProgress completed={completedQuizCount} label="Quizler" total={quizzes.length} />
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
        <LearningTopics completedLessonIds={completedLessonIds} />
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
    justifyContent: 'space-between',
  },
  levelBadge: {
    gap: spacing.xxs,
  },
  xpCopy: {
    alignItems: 'flex-end',
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
  emptyCard: {
    gap: spacing.xs,
  },
  domainRow: {
    gap: spacing.xs,
  },
  metaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  projectCard: {
    gap: spacing.md,
  },
  learningCard: {
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
