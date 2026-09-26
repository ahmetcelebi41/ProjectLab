import { StyleSheet, useWindowDimensions, View } from 'react-native';

import { Badge, type BadgeVariant } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Progress } from '@/components/ui/Progress';
import { Screen } from '@/components/ui/Screen';
import { Typography } from '@/components/ui/Typography';
import { lessons, projects, quizzes } from '@/data';
import { getLevelProgress, XP_PER_LEVEL } from '@/features/progress/level';
import { getValidQuizAnswers } from '@/features/quiz/quizUtils';
import { useProgressStore } from '@/stores/progressStore';
import { border, breakpoints, colors, layout, radius, spacing } from '@/theme/tokens';
import type {
  Lesson,
  LessonProgress,
  Project,
  ProjectProgress,
  Quiz,
  QuizProgress,
} from '@/types';

function percentage(completed: number, total: number) {
  return total > 0 ? Math.round((completed / total) * 100) : 0;
}

function completedStageIds(project: Project, progress?: ProjectProgress) {
  const projectStageIds = new Set(project.stages.map((stage) => stage.id));
  return new Set(
    (progress?.completedStageIds ?? []).filter((stageId) => projectStageIds.has(stageId)),
  );
}

function ScreenHeading() {
  return (
    <View style={styles.heading}>
      <Typography color="primary" variant="caption">KİŞİSEL İLERLEME</Typography>
      <Typography accessibilityRole="header" variant="h1">İlerlemem</Typography>
      <Typography color="textSecondary" style={styles.bodyLine} variant="bodyLarge">
        Proje aşamalarını, ders okuma durumunu, quiz sonuçlarını ve XP gelişimini birlikte izle.
      </Typography>
    </View>
  );
}

function LoadingProgressDetails() {
  return (
    <Screen
      contentContainerStyle={styles.screen}
      edges={['bottom']}
      scrollViewProps={{ accessibilityLabel: 'İlerleme yükleniyor' }}
    >
      <View style={styles.heading}>
        <View style={[styles.skeleton, styles.loadingLabel]} />
        <View style={[styles.skeleton, styles.loadingTitle]} />
        <View style={[styles.skeleton, styles.loadingLine]} />
      </View>
      {[spacing.max, spacing.xxxxl, spacing.xxxxl].map((height, index) => (
        <Card key={`${height}-${index}`} style={styles.loadingCard}>
          <View style={[styles.skeleton, styles.loadingLabel]} />
          <View style={[styles.skeleton, { height }]} />
        </Card>
      ))}
    </Screen>
  );
}

function LevelSummary({ totalXp }: { totalXp: number }) {
  const { currentLevelXp, level, progressPercentage, xpToNextLevel } = getLevelProgress(totalXp);

  return (
    <Card
      accessibilityLabel={`Seviye ${level}, toplam ${totalXp} XP`}
      raised
      style={styles.levelCard}
    >
      <View style={styles.metaRow}>
        <View style={styles.cardCopy}>
          <Typography color="primary" variant="caption">SEVİYE {level}</Typography>
          <Typography variant="h2">{totalXp} XP</Typography>
        </View>
        <Typography color="textSecondary" variant="small">
          {currentLevelXp} / {XP_PER_LEVEL} XP
        </Typography>
      </View>
      <Progress
        accessibilityLabel={`Seviye ${level} ilerlemesi yüzde ${progressPercentage}`}
        value={progressPercentage}
      />
      <Typography color="textMuted" variant="caption">
        Sonraki seviyeye {xpToNextLevel} XP kaldı
      </Typography>
    </Card>
  );
}

function SummaryCard({ completedLessons, completedProjects, completedQuizzes }: {
  completedLessons: number;
  completedProjects: number;
  completedQuizzes: number;
}) {
  const rows = [
    { completed: completedProjects, label: 'Projeler', total: projects.length },
    { completed: completedLessons, label: 'Dersler', total: lessons.length },
    { completed: completedQuizzes, label: 'Quizler', total: quizzes.length },
  ];

  return (
    <Card style={styles.summaryCard}>
      <Typography accessibilityRole="header" variant="h3">Genel görünüm</Typography>
      {rows.map((row) => {
        const value = percentage(row.completed, row.total);

        return (
          <View key={row.label} style={styles.progressGroup}>
            <View style={styles.metaRow}>
              <Typography variant="button">{row.label}</Typography>
              <Typography color="textSecondary" variant="caption">
                {row.completed} / {row.total}
              </Typography>
            </View>
            <Progress accessibilityLabel={`${row.label} yüzde ${value}`} value={value} />
          </View>
        );
      })}
    </Card>
  );
}

function ProjectCard({ progress, project, width }: {
  progress?: ProjectProgress;
  project: Project;
  width: number;
}) {
  const completedIds = completedStageIds(project, progress);
  const value = percentage(completedIds.size, project.stages.length);

  return (
    <Card
      accessibilityLabel={`${project.title}, ${completedIds.size}/${project.stages.length} aşama tamamlandı`}
      style={[styles.detailCard, { width }]}
    >
      <View style={styles.metaRow}>
        <Typography accessibilityRole="header" variant="h3">{project.title}</Typography>
        <Badge variant={value === 100 ? 'success' : progress?.lastVisitedAt ? 'warning' : 'neutral'}>
          %{value}
        </Badge>
      </View>
      <Progress
        accessibilityLabel={`${project.title} proje ilerlemesi yüzde ${value}`}
        color={value === 100 ? 'success' : 'primary'}
        value={value}
      />
      <View style={styles.stageList}>
        {project.stages.map((stage) => {
          const completed = completedIds.has(stage.id);
          const active = !completed && progress?.activeStageId === stage.id;
          const status: { label: string; variant: BadgeVariant } = completed
            ? { label: 'Tamamlandı', variant: 'success' }
            : active
              ? { label: 'Devam Ediyor', variant: 'warning' }
              : { label: 'Başlanmadı', variant: 'neutral' };

          return (
            <View key={stage.id} style={styles.stageRow}>
              <Typography color={completed || active ? 'text' : 'textMuted'} style={styles.stageTitle}>
                {stage.order}. {stage.title}
              </Typography>
              <Badge variant={status.variant}>{status.label}</Badge>
            </View>
          );
        })}
      </View>
    </Card>
  );
}

function lessonDetail(lesson: Lesson, progress?: LessonProgress) {
  if (progress?.completedAt) {
    return { label: 'Tamamlandı', readCount: lesson.content.length, variant: 'success' as const };
  }

  const lastBlockIndex = lesson.content.findIndex((block) => block.id === progress?.lastBlockId);
  const readCount = Math.max(0, lastBlockIndex + 1);
  return readCount > 0
    ? { label: 'Devam Ediyor', readCount, variant: 'warning' as const }
    : { label: 'Başlanmadı', readCount, variant: 'neutral' as const };
}

function LessonCard({ lesson, progress, width }: {
  lesson: Lesson;
  progress?: LessonProgress;
  width: number;
}) {
  const detail = lessonDetail(lesson, progress);
  const value = percentage(detail.readCount, lesson.content.length);

  return (
    <Card
      accessibilityLabel={`${lesson.title}, ${detail.label}, yüzde ${value}`}
      style={[styles.detailCard, { width }]}
    >
      <View style={styles.metaRow}>
        <Badge variant={detail.variant}>{detail.label}</Badge>
        <Typography color="textMuted" variant="caption">+{lesson.completionXp} XP</Typography>
      </View>
      <View style={styles.cardCopy}>
        <Typography accessibilityRole="header" variant="h4">{lesson.title}</Typography>
        <Typography color="textSecondary" style={styles.bodyLine}>{lesson.summary}</Typography>
      </View>
      <View style={styles.progressGroup}>
        <Progress
          accessibilityLabel={`${lesson.title} ders ilerlemesi yüzde ${value}`}
          color={value === 100 ? 'success' : 'primary'}
          value={value}
        />
        <Typography color="textMuted" variant="caption">
          {detail.readCount} / {lesson.content.length} içerik bloğu
        </Typography>
      </View>
    </Card>
  );
}

function quizDetail(quiz: Quiz, progress?: QuizProgress) {
  const answeredCount = getValidQuizAnswers(quiz, progress?.answers ?? []).length;
  if (progress?.completedAt) {
    return {
      label: 'Tamamlandı',
      supportingText: `En iyi sonuç ${progress.bestCorrectAnswerCount} / ${quiz.questions.length}`,
      value: 100,
      variant: 'success' as const,
    };
  }

  return answeredCount > 0
    ? {
      label: 'Devam Ediyor',
      supportingText: `${answeredCount} / ${quiz.questions.length} soru yanıtlandı`,
      value: percentage(answeredCount, quiz.questions.length),
      variant: 'warning' as const,
    }
    : {
      label: 'Başlanmadı',
      supportingText: `${quiz.questions.length} soru`,
      value: 0,
      variant: 'neutral' as const,
    };
}

function QuizCard({ progress, quiz, width }: {
  progress?: QuizProgress;
  quiz: Quiz;
  width: number;
}) {
  const detail = quizDetail(quiz, progress);

  return (
    <Card
      accessibilityLabel={`${quiz.title}, ${detail.label}, ${detail.supportingText}`}
      style={[styles.detailCard, { width }]}
    >
      <View style={styles.metaRow}>
        <Badge variant={detail.variant}>{detail.label}</Badge>
        <Typography color="textMuted" variant="caption">+{quiz.completionXp} XP</Typography>
      </View>
      <View style={styles.cardCopy}>
        <Typography accessibilityRole="header" variant="h4">{quiz.title}</Typography>
        <Typography color="textSecondary" style={styles.bodyLine}>{quiz.summary}</Typography>
      </View>
      <View style={styles.progressGroup}>
        <Progress
          accessibilityLabel={`${quiz.title} quiz ilerlemesi yüzde ${detail.value}`}
          color={detail.value === 100 ? 'success' : 'primary'}
          value={detail.value}
        />
        <Typography color="textMuted" variant="caption">{detail.supportingText}</Typography>
      </View>
    </Card>
  );
}

function Section({ children, description, title }: {
  children: React.ReactNode;
  description: string;
  title: string;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeading}>
        <Typography accessibilityRole="header" variant="h3">{title}</Typography>
        <Typography color="textSecondary" style={styles.bodyLine}>{description}</Typography>
      </View>
      {children}
    </View>
  );
}

export function ProgressDetailsScreen() {
  const { width } = useWindowDimensions();
  const hasHydrated = useProgressStore((state) => state.hasHydrated);
  const totalXp = useProgressStore((state) => state.totalXp);
  const projectProgress = useProgressStore((state) => state.projects);
  const lessonProgress = useProgressStore((state) => state.lessons);
  const quizProgress = useProgressStore((state) => state.quizzes);

  if (!hasHydrated) return <LoadingProgressDetails />;

  const horizontalPadding = width >= breakpoints.medium
    ? layout.horizontalPadding.wide.min
    : layout.horizontalPadding.mobile;
  const contentWidth = Math.min(width - horizontalPadding * 2, layout.contentMaxWidth);
  const columns = width >= breakpoints.medium ? layout.columns.wide.min : layout.columns.mobile;
  const cardWidth = (contentWidth - spacing.md * (columns - 1)) / columns;
  const completedLessons = lessonProgress.filter((item) => item.completedAt).length;
  const completedQuizzes = quizProgress.filter((item) => item.completedAt).length;
  const completedProjects = projects.filter((project) => {
    const progress = projectProgress.find((item) => item.projectId === project.id);
    return completedStageIds(project, progress).size === project.stages.length;
  }).length;

  return (
    <Screen
      contentContainerStyle={styles.screen}
      edges={['bottom']}
      scrollViewProps={{ contentInsetAdjustmentBehavior: 'automatic' }}
    >
      <ScreenHeading />
      <LevelSummary totalXp={totalXp} />
      <SummaryCard
        completedLessons={completedLessons}
        completedProjects={completedProjects}
        completedQuizzes={completedQuizzes}
      />

      <Section
        description="Her proje, kendi aşamaları üzerinden bağımsız izlenir."
        title="Proje ilerlemesi"
      >
        <View style={styles.grid}>
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              progress={projectProgress.find((item) => item.projectId === project.id)}
              project={project}
              width={cardWidth}
            />
          ))}
        </View>
      </Section>

      <Section
        description="Okunan içerik blokları ve tamamlanma durumu gösterilir."
        title="Ders ilerlemesi"
      >
        <View style={styles.grid}>
          {lessons.map((lesson) => (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              progress={lessonProgress.find((item) => item.lessonId === lesson.id)}
              width={cardWidth}
            />
          ))}
        </View>
      </Section>

      <Section
        description="Tamamlanma ve kaydedilen en iyi sonuçlar birlikte görünür."
        title="Quiz ilerlemesi"
      >
        <View style={styles.grid}>
          {quizzes.map((quiz) => (
            <QuizCard
              key={quiz.id}
              progress={quizProgress.find((item) => item.quizId === quiz.id)}
              quiz={quiz}
              width={cardWidth}
            />
          ))}
        </View>
      </Section>
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
  levelCard: {
    gap: spacing.md,
    padding: spacing.xl,
  },
  summaryCard: {
    gap: spacing.lg,
  },
  progressGroup: {
    gap: spacing.xs,
  },
  metaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  detailCard: {
    gap: spacing.md,
  },
  stageList: {
    borderTopColor: colors.border,
    borderTopWidth: border.width,
    gap: spacing.sm,
    paddingTop: spacing.md,
  },
  stageRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  stageTitle: {
    flex: 1,
  },
  cardCopy: {
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
  loadingCard: {
    gap: spacing.md,
  },
});
