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
import { lessons } from '@/data/lessons';
import { projects, projectsById } from '@/data/projects';
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
import type {
  ContentProgressStatus,
  Lesson,
  LessonCategory,
  LessonProgress,
  Project,
} from '@/types';

type CategoryFilter = 'all' | LessonCategory;

const categories: readonly { id: CategoryFilter; label: string }[] = [
  { id: 'all', label: 'Tümü' },
  { id: 'ui-ux', label: 'UI/UX' },
  { id: 'frontend', label: 'Frontend' },
  { id: 'backend-api', label: 'Backend & API' },
  { id: 'database', label: 'Veritabanı' },
  { id: 'git-github', label: 'Git & GitHub' },
  { id: 'deploy-cloud', label: 'Deploy & Cloud' },
  { id: 'project-planning', label: 'Proje Planlama' },
];

const categoryLabels = Object.fromEntries(
  categories
    .filter((category): category is { id: LessonCategory; label: string } => category.id !== 'all')
    .map((category) => [category.id, category.label]),
) as Record<LessonCategory, string>;

const statusDetails: Record<
  ContentProgressStatus,
  { label: string; variant: BadgeVariant }
> = {
  'not-started': { label: 'Başlanmadı', variant: 'neutral' },
  'in-progress': { label: 'Devam Ediyor', variant: 'warning' },
  completed: { label: 'Tamamlandı', variant: 'success' },
};

function getLessonStatus(progress?: LessonProgress): ContentProgressStatus {
  if (progress?.completedAt) return 'completed';
  if (progress?.lastBlockId) return 'in-progress';
  return 'not-started';
}

function lessonHref(lesson: Lesson) {
  return `/learn/${lesson.id}` as Href;
}

function SectionHeading({ description, title }: { description?: string; title: string }) {
  return (
    <View style={styles.sectionHeading}>
      <Typography accessibilityRole="header" variant="h2">{title}</Typography>
      {description ? (
        <Typography color="textSecondary" style={styles.bodyLine}>{description}</Typography>
      ) : null}
    </View>
  );
}

function LoadingLearn() {
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
      scrollViewProps={{ accessibilityLabel: 'Öğren sayfası yükleniyor' }}
    >
      <View style={styles.headerCopy}>
        <View style={[styles.skeleton, styles.loadingTitle]} />
        <View style={[styles.skeleton, styles.loadingDescription]} />
      </View>
      <Card style={styles.summaryCard}>
        <View style={styles.summaryTop}>
          <View style={[styles.skeleton, styles.loadingSummaryTitle]} />
          <View style={[styles.skeleton, styles.loadingSummaryValue]} />
        </View>
        <View style={[styles.skeleton, styles.loadingProgress]} />
      </Card>
      <Card raised style={styles.featureCard}>
        <View style={[styles.skeleton, styles.loadingEyebrow]} />
        <View style={[styles.skeleton, styles.loadingFeatureTitle]} />
        <View style={[styles.skeleton, styles.loadingDescription]} />
        <View style={[styles.skeleton, styles.loadingButton]} />
      </Card>
      <View style={styles.filterRow}>
        {categories.slice(0, layout.columns.wide.max + layout.columns.mobile).map((category) => (
          <View key={category.id} style={[styles.skeleton, styles.loadingFilter]} />
        ))}
      </View>
      <View style={styles.grid}>
        {lessons.map((lesson) => (
          <Card key={lesson.id} style={[styles.loadingCard, { width: cardWidth }]}>
            <View style={[styles.skeleton, styles.loadingCardLine]} />
            <View style={[styles.skeleton, styles.loadingCardCopy]} />
            <View style={[styles.skeleton, styles.loadingButton]} />
          </Card>
        ))}
      </View>
    </Screen>
  );
}

function LearningSummary({ progress }: { progress: readonly LessonProgress[] }) {
  const completedCount = lessons.filter(
    (lesson) => getLessonStatus(progress.find((item) => item.lessonId === lesson.id)) === 'completed',
  ).length;
  const activeCount = lessons.filter(
    (lesson) => getLessonStatus(progress.find((item) => item.lessonId === lesson.id)) === 'in-progress',
  ).length;
  const progressValue = Math.round((completedCount / lessons.length) * 100);

  return (
    <Card
      accessibilityLabel={`${lessons.length} dersten ${completedCount} tanesi tamamlandı, ${activeCount} ders devam ediyor`}
      style={styles.summaryCard}
    >
      <View style={styles.summaryTop}>
        <View style={styles.summaryCopy}>
          <Typography accessibilityRole="header" variant="h4">Öğrenme ilerlemen</Typography>
          <Typography color="textMuted" variant="small">
            {activeCount > 0 ? `${activeCount} ders devam ediyor` : 'Yeni bir konu seçerek devam et'}
          </Typography>
        </View>
        <Typography color="primary" variant="h2">%{progressValue}</Typography>
      </View>
      <Progress
        accessibilityLabel={`Ders tamamlama ilerlemesi yüzde ${progressValue}`}
        color={completedCount === lessons.length ? 'success' : 'primary'}
        value={progressValue}
      />
      <View style={styles.metricRow}>
        <Typography color="textSecondary" variant="caption">{completedCount} tamamlandı</Typography>
        <Typography color="textSecondary" variant="caption">
          {lessons.length - completedCount} kaldı
        </Typography>
      </View>
    </Card>
  );
}

function ContinueLesson({ lesson }: { lesson: Lesson }) {
  const projectNames = lesson.projectIds.map((id) => projectsById[id].title).join(', ');

  return (
    <View style={styles.section}>
      <SectionHeading title="Devam Et" />
      <Card raised style={styles.featureCard}>
        <View style={styles.featureTop}>
          <Badge variant="warning">Devam Ediyor</Badge>
          <Typography color="textMuted" variant="caption">
            {lesson.durationMinutes} dk · +{lesson.completionXp} XP
          </Typography>
        </View>
        <View style={styles.featureCopy}>
          <Typography color="primary" variant="caption">{projectNames.toUpperCase()}</Typography>
          <Typography accessibilityRole="header" variant="h2">{lesson.title}</Typography>
          <Typography color="textSecondary" style={styles.bodyLine} variant="bodyLarge">
            {lesson.summary}
          </Typography>
        </View>
        <Button
          accessibilityLabel={`${lesson.title} dersine devam et`}
          onPress={() => router.push(lessonHref(lesson))}
          size="large"
        >
          Derse Devam Et
        </Button>
      </Card>
    </View>
  );
}

function TodayLesson({ lesson, progress }: { lesson: Lesson; progress?: LessonProgress }) {
  const status = getLessonStatus(progress);
  const action = status === 'completed'
    ? 'Tekrar İncele'
    : status === 'in-progress'
      ? 'Devam Et'
      : 'Bugün Öğren';

  return (
    <View style={styles.section}>
      <SectionHeading
        description="Gerçek bir proje kararından üretilen kısa bir ders."
        title="Bugün Öğren"
      />
      <Card style={styles.todayCard}>
        <View style={styles.featureTop}>
          <Badge variant="primary">{categoryLabels[lesson.category]}</Badge>
          <Typography color="textMuted" variant="caption">
            {lesson.durationMinutes} dk · +{lesson.completionXp} XP
          </Typography>
        </View>
        <View style={styles.featureCopy}>
          <Typography accessibilityRole="header" variant="h3">{lesson.title}</Typography>
          <Typography color="textSecondary" style={styles.bodyLine}>{lesson.summary}</Typography>
        </View>
        <Button
          accessibilityLabel={`${action}: ${lesson.title}`}
          onPress={() => router.push(lessonHref(lesson))}
          variant="secondary"
        >
          {action}
        </Button>
      </Card>
    </View>
  );
}

function LessonCard({ lesson, progress, width }: {
  lesson: Lesson;
  progress?: LessonProgress;
  width: number;
}) {
  const status = getLessonStatus(progress);
  const statusDetail = statusDetails[status];
  const projectNames = lesson.projectIds.map((id) => projectsById[id].title).join(', ');

  return (
    <Pressable
      accessibilityHint="Ders detayını açar"
      accessibilityLabel={`${lesson.title}, ${statusDetail.label}, ${projectNames} projesine bağlı, ${lesson.durationMinutes} dakika, ${lesson.completionXp} XP`}
      accessibilityRole="link"
      onPress={() => router.push(lessonHref(lesson))}
      style={({ pressed }) => [styles.cardPressable, { width }, pressed && styles.cardPressed]}
    >
      <Card style={styles.lessonCard}>
        <View style={styles.cardTop}>
          <Badge variant={statusDetail.variant}>{statusDetail.label}</Badge>
          <Typography color="textMuted" variant="caption">{categoryLabels[lesson.category]}</Typography>
        </View>
        <View style={styles.cardCopy}>
          <Typography accessibilityRole="header" numberOfLines={2} variant="h3">{lesson.title}</Typography>
          <Typography color="textSecondary" numberOfLines={3} style={styles.cardSummary}>
            {lesson.summary}
          </Typography>
        </View>
        <View style={styles.lessonMeta}>
          <View style={styles.metaItem}>
            <Typography color="textMuted" variant="caption">Bağlı proje</Typography>
            <Typography numberOfLines={1} variant="small">{projectNames}</Typography>
          </View>
          <View style={styles.metaRow}>
            <Typography color="textMuted" variant="caption">{lesson.durationMinutes} dk</Typography>
            <Typography color="primary" variant="caption">+{lesson.completionXp} XP</Typography>
          </View>
        </View>
        <View style={styles.cardAction}>
          <Typography color="primary" variant="button">
            {status === 'completed' ? 'Tekrar İncele' : status === 'in-progress' ? 'Devam Et' : 'Dersi Aç'}
          </Typography>
          <Typography accessibilityElementsHidden color="primary" importantForAccessibility="no" variant="h4">→</Typography>
        </View>
      </Card>
    </Pressable>
  );
}

function ProjectLearningCard({ project, width }: { project: Project; width: number }) {
  const projectLessons = lessons.filter((lesson) =>
    lesson.projectIds.some((projectId) => projectId === project.id),
  );

  return (
    <Card style={[styles.projectCard, { width }]}>
      <View style={styles.projectMonogram}>
        <Typography color="primary" variant="h3">{project.title.slice(0, 1)}</Typography>
      </View>
      <View style={styles.cardCopy}>
        <Typography accessibilityRole="header" variant="h4">{project.title}</Typography>
        <Typography color="textSecondary" numberOfLines={2} style={styles.bodyLine}>
          {project.summary}
        </Typography>
      </View>
      <View style={styles.projectLessonList}>
        {projectLessons.map((lesson) => (
          <Pressable
            accessibilityLabel={`${project.title} projesinden ${lesson.title} dersini aç`}
            accessibilityRole="link"
            key={lesson.id}
            onPress={() => router.push(lessonHref(lesson))}
            style={({ pressed }) => [styles.projectLessonLink, pressed && styles.linkPressed]}
          >
            <Typography color="primary" style={styles.projectLessonTitle} variant="button">
              {lesson.title}
            </Typography>
            <Typography accessibilityElementsHidden color="primary" importantForAccessibility="no">→</Typography>
          </Pressable>
        ))}
      </View>
    </Card>
  );
}

export function LearnScreen() {
  const { width } = useWindowDimensions();
  const [category, setCategory] = useState<CategoryFilter>('all');
  const hasHydrated = useProgressStore((state) => state.hasHydrated);
  const storedProgress = useProgressStore((state) => state.lessons);

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

  const unfinishedLesson = useMemo(
    () => lessons.find((lesson) => {
      const progress = storedProgress.find((item) => item.lessonId === lesson.id);
      return getLessonStatus(progress) === 'in-progress';
    }),
    [storedProgress],
  );

  const todayLesson = useMemo(
    () => lessons.find((lesson) => {
      const progress = storedProgress.find((item) => item.lessonId === lesson.id);
      return lesson.id !== unfinishedLesson?.id && getLessonStatus(progress) !== 'completed';
    }) ?? lessons.find((lesson) => lesson.id !== unfinishedLesson?.id) ?? lessons[0],
    [storedProgress, unfinishedLesson],
  );

  const visibleLessons = useMemo(
    () => category === 'all'
      ? lessons
      : lessons.filter((lesson) => lesson.category === category),
    [category],
  );

  if (!hasHydrated) return <LoadingLearn />;

  return (
    <Screen
      contentContainerStyle={styles.screen}
      edges={['top', 'bottom']}
      scrollViewProps={{ contentInsetAdjustmentBehavior: 'automatic' }}
    >
      <View style={styles.headerCopy}>
        <Typography accessibilityRole="header" variant="h1">Öğren</Typography>
        <Typography color="textSecondary" style={styles.headerDescription} variant="bodyLarge">
          Projelerde verdiğin kararları kısa derslerle kalıcı bilgiye dönüştür.
        </Typography>
      </View>

      <LearningSummary progress={storedProgress} />

      {unfinishedLesson ? <ContinueLesson lesson={unfinishedLesson} /> : null}

      <TodayLesson
        lesson={todayLesson}
        progress={storedProgress.find((item) => item.lessonId === todayLesson.id)}
      />

      <View style={styles.section}>
        <SectionHeading
          description="Konuları çalışma alanına göre filtrele; tamamladığın dersler listede kalır."
          title="Konular"
        />
        <View accessibilityLabel="Ders kategorisi filtresi" accessibilityRole="tablist" style={styles.filterRow}>
          {categories.map((item) => {
            const selected = category === item.id;
            return (
              <Button
                accessibilityRole="tab"
                accessibilityState={{ selected }}
                key={item.id}
                onPress={() => setCategory(item.id)}
                size="small"
                style={styles.filterButton}
                variant={selected ? 'primary' : 'ghost'}
              >
                {item.label}
              </Button>
            );
          })}
        </View>
        {visibleLessons.length > 0 ? (
          <View style={styles.grid}>
            {visibleLessons.map((lesson) => (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                progress={storedProgress.find((item) => item.lessonId === lesson.id)}
                width={cardWidth}
              />
            ))}
          </View>
        ) : (
          <Card style={styles.emptyState}>
            <Typography accessibilityRole="header" variant="h4">Bu kategoride henüz ders yok</Typography>
            <Typography color="textSecondary">
              Yeni dersler gerçek proje deneyimlerinden üretildikçe burada görünecek.
            </Typography>
            <Button onPress={() => setCategory('all')} variant="secondary">Tüm konuları göster</Button>
          </Card>
        )}
      </View>

      <View style={styles.section}>
        <SectionHeading
          description="Her ders, geliştirilen bir projedeki gerçek karara ve deneyime bağlıdır."
          title="Projelerden Öğren"
        />
        <View style={styles.grid}>
          {projects.map((project) => (
            <ProjectLearningCard key={project.id} project={project} width={cardWidth} />
          ))}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { gap: spacing.xxl },
  headerCopy: { gap: spacing.xs },
  headerDescription: { lineHeight: spacing.xl, maxWidth: layout.readingWidth.min },
  bodyLine: { lineHeight: spacing.lg },
  summaryCard: { gap: spacing.md, padding: spacing.lg },
  summaryTop: { alignItems: 'center', flexDirection: 'row', gap: spacing.md, justifyContent: 'space-between' },
  summaryCopy: { flex: 1, gap: spacing.xxs },
  metricRow: { flexDirection: 'row', justifyContent: 'space-between' },
  section: { gap: spacing.md },
  sectionHeading: { gap: spacing.xs, maxWidth: layout.readingWidth.min },
  featureCard: { gap: spacing.lg, padding: spacing.xl },
  todayCard: { gap: spacing.lg, padding: spacing.lg },
  featureTop: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, justifyContent: 'space-between' },
  featureCopy: { gap: spacing.xs, maxWidth: layout.readingWidth.max },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  filterButton: { borderRadius: radius.pill },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  cardPressable: { borderRadius: radius.card },
  cardPressed: { backgroundColor: colors.surfaceRaised },
  lessonCard: { gap: spacing.lg, height: '100%' },
  cardTop: { alignItems: 'flex-start', flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, justifyContent: 'space-between' },
  cardCopy: { flex: 1, gap: spacing.xs },
  cardSummary: { lineHeight: spacing.lg },
  lessonMeta: { borderTopColor: colors.border, borderTopWidth: border.width, gap: spacing.md, paddingTop: spacing.md },
  metaItem: { gap: spacing.xxs },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between' },
  cardAction: { alignItems: 'center', flexDirection: 'row', gap: spacing.xs, justifyContent: 'flex-end', minHeight: sizing.touchTarget.minHeight },
  projectCard: { gap: spacing.md },
  projectMonogram: { alignItems: 'center', backgroundColor: colors.surfaceRaised, borderColor: colors.border, borderRadius: radius.md, borderWidth: border.width, height: sizing.button.large, justifyContent: 'center', width: sizing.button.large },
  projectLessonList: { borderTopColor: colors.border, borderTopWidth: border.width, paddingTop: spacing.xs },
  projectLessonLink: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm, justifyContent: 'space-between', minHeight: sizing.touchTarget.minHeight },
  projectLessonTitle: { flex: 1 },
  linkPressed: { backgroundColor: colors.surfaceRaised },
  emptyState: { alignItems: 'flex-start', gap: spacing.md, padding: spacing.xl },
  skeleton: { backgroundColor: colors.surfaceRaised, borderRadius: radius.md },
  loadingTitle: { height: spacing.xxl, width: '40%' },
  loadingDescription: { height: spacing.lg, width: '75%' },
  loadingSummaryTitle: { height: spacing.xl, width: '45%' },
  loadingSummaryValue: { height: spacing.xxl, width: spacing.max },
  loadingProgress: { height: spacing.xs, width: '100%' },
  loadingEyebrow: { height: spacing.md, width: '25%' },
  loadingFeatureTitle: { height: spacing.xxl, width: '60%' },
  loadingButton: { height: sizing.button.medium, width: spacing.max + spacing.max },
  loadingFilter: { height: sizing.button.small, width: spacing.max + spacing.xl },
  loadingCard: { gap: spacing.lg },
  loadingCardLine: { height: spacing.xl, width: '55%' },
  loadingCardCopy: { height: spacing.xxxxl, width: '100%' },
});
