import type { Href } from 'expo-router';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { Linking, StyleSheet, useWindowDimensions, View } from 'react-native';
import type { DimensionValue } from 'react-native';

import { Badge, type BadgeVariant } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Progress } from '@/components/ui/Progress';
import { Screen } from '@/components/ui/Screen';
import { Typography } from '@/components/ui/Typography';
import { getLessonsByProjectId } from '@/data/lessons';
import { getProjectById } from '@/data/projects';
import { getQuizzesByProjectId } from '@/data/quizzes';
import { getActiveProjectStageId, getCompletedProjectStageIds } from '@/features/progress/projectProgress';
import { useProgressStore } from '@/stores/progressStore';
import { border, breakpoints, colors, layout, radius, sizing, spacing } from '@/theme/tokens';
import type {
  Lesson,
  Project,
  ProjectStage,
  ProjectStageStatus,
  ProjectStatus,
  Quiz,
} from '@/types';

import {
  formatProjectStageDate,
  getOrderedProjectStages,
  getUniqueTechnologies,
  ProjectLearningList,
  ProjectMilestoneList,
  ProjectTechnologyList,
} from './ProjectDetailComponents';

export type ProjectDetailSection = 'overview' | 'journey' | 'learn' | 'quiz';

type Props = { projectId?: string; section?: ProjectDetailSection };

const projectStatuses: Record<ProjectStatus, { label: string; variant: BadgeVariant }> = {
  planned: { label: 'Planlandı', variant: 'neutral' },
  'in-progress': { label: 'Devam Ediyor', variant: 'warning' },
  completed: { label: 'Tamamlandı', variant: 'success' },
};

const stageStatuses: Record<ProjectStageStatus, { label: string; variant: BadgeVariant }> = {
  completed: { label: 'Tamamlandı', variant: 'success' },
  'in-progress': { label: 'Devam Ediyor', variant: 'warning' },
  'not-started': { label: 'Henüz Başlanmadı', variant: 'neutral' },
};

const typeLabels = {
  web: 'Web projesi',
  mobile: 'Mobil uygulama',
  dashboard: 'Yönetim paneli',
} as const;

function navigate(href: Href) {
  router.push(href);
}

function SectionHeading({ actionHref, actionLabel, description, title }: {
  actionHref?: Href;
  actionLabel?: string;
  description?: string;
  title: string;
}) {
  return (
    <View style={styles.sectionHeading}>
      <View style={styles.sectionHeadingCopy}>
        <Typography accessibilityRole="header" variant="h2">{title}</Typography>
        {description ? <Typography color="textSecondary">{description}</Typography> : null}
      </View>
      {actionHref && actionLabel ? (
        <Button onPress={() => navigate(actionHref)} size="small" variant="ghost">
          {actionLabel}
        </Button>
      ) : null}
    </View>
  );
}

function LoadingProjectDetail() {
  return (
    <Screen
      contentContainerStyle={styles.screen}
      edges={['top', 'bottom']}
      scrollViewProps={{
        accessibilityLabel: 'Proje detayı yükleniyor',
        accessibilityState: { busy: true },
      }}
    >
      <View style={styles.heroColumns}>
        <View style={[styles.heroColumn, styles.loadingGroup]}>
          <View style={[styles.skeleton, styles.loadingBadge]} />
          <View style={[styles.skeleton, styles.loadingTitle]} />
          <View style={[styles.skeleton, styles.loadingCopy]} />
          <View style={[styles.skeleton, styles.loadingCopyShort]} />
        </View>
        <View style={[styles.skeleton, styles.heroColumn, styles.loadingCover]} />
      </View>
      <Card style={styles.loadingGroup}>
        <View style={[styles.skeleton, styles.loadingSubtitle]} />
        <View style={[styles.skeleton, styles.loadingCopy]} />
        <View style={[styles.skeleton, styles.loadingProgress]} />
      </Card>
      <View style={styles.loadingGroup}>
        <View style={[styles.skeleton, styles.loadingSubtitle]} />
        <View style={[styles.skeleton, styles.loadingTimeline]} />
        <View style={[styles.skeleton, styles.loadingTimeline]} />
      </View>
    </Screen>
  );
}

function ProjectNotFound({ projectId }: Props) {
  return (
    <Screen contentContainerStyle={styles.centeredState} edges={['top', 'bottom']}>
      <Card accessibilityLiveRegion="polite" style={styles.errorCard}>
        <Badge variant="error">Proje bulunamadı</Badge>
        <View style={styles.cardCopy}>
          <Typography accessibilityRole="header" variant="h2">Bu proje mevcut değil</Typography>
          <Typography color="textSecondary" style={styles.bodyLine}>
            {projectId
              ? `“${projectId}” kimliğine sahip bir proje bulunamadı.`
              : 'Proje bağlantısında geçerli bir kimlik bulunmuyor.'}
          </Typography>
        </View>
        <Button onPress={() => router.replace('/projects')} size="large">Projelere Dön</Button>
      </Card>
    </Screen>
  );
}

function ProjectCover({ project }: { project: Project }) {
  return (
    <View
      accessibilityLabel={project.coverImage?.alt ?? `${project.title} proje kapağı`}
      accessibilityRole="image"
      style={styles.cover}
    >
      <Typography color="textMuted" variant="caption">{typeLabels[project.type].toUpperCase()}</Typography>
      <View style={styles.coverCopy}>
        <Typography color="primary" variant="displayCompact">{project.title}</Typography>
        <View style={styles.coverRule} />
        <Typography color="textSecondary">{project.purpose}</Typography>
      </View>
    </View>
  );
}

function ProjectHero({ isWide, project }: { isWide: boolean; project: Project }) {
  const status = projectStatuses[project.status];
  const liveLink = project.links?.live;
  const sourceLink = project.links?.source;

  return (
    <View style={[styles.heroColumns, isWide && styles.heroColumnsWide]}>
      <View style={styles.heroColumn}>
        <View style={styles.heroMeta}>
          <Badge variant={status.variant}>{status.label}</Badge>
          <Typography color="textMuted" variant="caption">{typeLabels[project.type]}</Typography>
        </View>
        <View style={styles.heroCopy}>
          <Typography accessibilityRole="header" variant={isWide ? 'displayExpanded' : 'displayCompact'}>
            {project.title}
          </Typography>
          <Typography color="textSecondary" style={styles.heroSummary} variant="bodyLarge">
            {project.summary}
          </Typography>
          <Typography style={styles.bodyLine}>{project.purpose}</Typography>
        </View>
        <ProjectTechnologyList technologies={project.technologies} />
        {liveLink || sourceLink ? (
          <View style={styles.actionRow}>
            {liveLink ? <Button accessibilityRole="link" onPress={() => Linking.openURL(liveLink.url)} variant="secondary">{liveLink.label}</Button> : null}
            {sourceLink ? <Button accessibilityRole="link" onPress={() => Linking.openURL(sourceLink.url)} variant="ghost">{sourceLink.label}</Button> : null}
          </View>
        ) : null}
      </View>
      <View style={styles.heroColumn}><ProjectCover project={project} /></View>
    </View>
  );
}

function ProjectNavigation({ activeSection, project }: {
  activeSection: ProjectDetailSection;
  project: Project;
}) {
  const items: readonly { id: ProjectDetailSection; label: string; href: Href }[] = [
    { id: 'overview', label: 'Genel Bakış', href: `/projects/${project.id}` as Href },
    { id: 'journey', label: 'Yolculuk', href: `/projects/${project.id}/journey` as Href },
    { id: 'learn', label: 'Öğren', href: `/projects/${project.id}/learn` as Href },
    { id: 'quiz', label: 'Quiz', href: `/projects/${project.id}/quiz` as Href },
  ];

  return (
    <View
      accessibilityLabel="Proje içi navigasyon"
      accessibilityRole="tablist"
      style={styles.navigationRow}
    >
      {items.map((item) => (
        <Button
          accessibilityLabel={`${project.title} ${item.label} bölümünü aç`}
          accessibilityRole="tab"
          accessibilityState={{ selected: item.id === activeSection }}
          key={item.id}
          onPress={item.id === activeSection ? undefined : () => navigate(item.href)}
          size="small"
          variant={item.id === activeSection ? 'primary' : 'ghost'}
        >
          {item.label}
        </Button>
      ))}
    </View>
  );
}

function ProgressSummary({ project }: { project: Project }) {
  const completedStageIds = getCompletedProjectStageIds(project);
  const activeStageId = getActiveProjectStageId(project);
  const activeStage = project.stages.find((stage) => stage.id === activeStageId);
  const completedStages = project.stages.filter((stage) => completedStageIds.includes(stage.id));
  const lastCompleted = [...completedStages].sort((left, right) => right.order - left.order)[0];
  const nextStage = project.stages.find((stage) => !completedStageIds.includes(stage.id));
  const progressValue = project.stages.length
    ? Math.round((completedStageIds.length / project.stages.length) * 100)
    : 0;

  return (
    <Card raised style={styles.progressCard}>
      <View style={styles.progressHeader}>
        <View style={styles.sectionHeadingCopy}>
          <Typography color="primary" variant="caption">İLERLEME & DEVAM ET</Typography>
          <Typography accessibilityRole="header" variant="h2">%{progressValue} tamamlandı</Typography>
        </View>
        <Typography color="textSecondary" variant="h4">{completedStageIds.length}/{project.stages.length}</Typography>
      </View>
      <Progress
        accessibilityLabel={`${project.title} proje ilerlemesi yüzde ${progressValue}`}
        color={progressValue === 100 ? 'success' : 'primary'}
        value={progressValue}
      />
      <View style={styles.progressFacts}>
        <View style={styles.progressFact}>
          <Typography color="textMuted" variant="caption">MEVCUT AŞAMA</Typography>
          <Typography variant="h4">{activeStage?.title ?? 'Aşama belirtilmedi'}</Typography>
        </View>
        <View style={styles.progressFact}>
          <Typography color="textMuted" variant="caption">SON TAMAMLANAN</Typography>
          <Typography>{lastCompleted?.title ?? 'Henüz tamamlanan aşama yok'}</Typography>
        </View>
        <View style={styles.progressFact}>
          <Typography color="textMuted" variant="caption">SIRADAKİ ADIM</Typography>
          <Typography>{nextStage?.title ?? 'Tüm aşamalar tamamlandı'}</Typography>
        </View>
      </View>
      <Button
        accessibilityLabel={`${project.title} yolculuğunu aç`}
        onPress={() => navigate(`/projects/${project.id}/journey` as Href)}
        size="large"
      >{progressValue === 100 ? 'Yolculuğu İncele' : 'Devam Et'}</Button>
    </Card>
  );
}

function getStageStatus(stage: ProjectStage, completedIds: readonly string[], activeId: string) {
  if (completedIds.includes(stage.id)) return 'completed';
  if (stage.id === activeId) return 'in-progress';
  return stage.status;
}

function StageDetails({ stage }: { stage: ProjectStage }) {
  const details = [
    { label: 'Problem', value: stage.problem },
    { label: 'Karar', value: stage.decision },
    { label: 'Çözüm', value: stage.solution },
    { label: 'Öğrenme', value: stage.learning },
  ].filter((item): item is { label: string; value: string } => Boolean(item.value));

  if (!details.length) return null;

  return (
    <View style={styles.stageDetails}>
      {details.map((detail) => (
        <View key={detail.label} style={styles.stageDetail}>
          <Typography color="primary" variant="caption">{detail.label.toUpperCase()}</Typography>
          <Typography color="textSecondary" style={styles.bodyLine}>{detail.value}</Typography>
        </View>
      ))}
    </View>
  );
}

function JourneyPreview({ project, showAllAction = true }: {
  project: Project;
  showAllAction?: boolean;
}) {
  const completedIds = getCompletedProjectStageIds(project);
  const activeId = getActiveProjectStageId(project);
  const orderedStages = getOrderedProjectStages(project.stages);

  return (
    <View style={styles.section}>
      <SectionHeading
        actionHref={showAllAction ? `/projects/${project.id}/journey` as Href : undefined}
        actionLabel={showAllAction ? 'Tüm Yolculuk' : undefined}
        description="Proje sürecinin fikirden sonuca kronolojik akışı."
        title="Proje Timeline’ı"
      />
      <View accessibilityLabel={`${project.title} proje aşamaları`} style={styles.timeline}>
        {orderedStages.map((stage, index) => {
          const status = getStageStatus(stage, completedIds, activeId);
          const detail = stageStatuses[status];
          const active = stage.id === activeId;
          const date = formatProjectStageDate(stage.date);

          return (
            <View key={stage.id} style={styles.timelineItem}>
              <View style={styles.timelineRail}>
                <View style={[styles.timelineMarker, status === 'completed' && styles.timelineMarkerCompleted]}>
                  <Typography color={status === 'completed' ? 'onPrimary' : 'textSecondary'} variant="caption">
                    {String(stage.order).padStart(2, '0')}
                  </Typography>
                </View>
                {index < orderedStages.length - 1 ? <View style={styles.timelineLine} /> : null}
              </View>
              <Card raised={active} style={[styles.stageCard, active && styles.activeStageCard]}>
                {date ? <Typography color="textMuted" variant="caption">{date}</Typography> : null}
                <View style={styles.stageHeader}>
                  <Typography accessibilityRole="header" style={styles.stageTitle} variant="h4">{stage.title}</Typography>
                  <Badge variant={detail.variant}>{detail.label}</Badge>
                </View>
                <Typography color="textSecondary" style={styles.bodyLine}>{stage.summary}</Typography>
                {active ? <StageDetails stage={stage} /> : null}
                {stage.lessonIds?.[0] ? (
                  <Button onPress={() => navigate(`/learn/${stage.lessonIds![0]}` as Href)} size="small" variant="ghost">
                    İlgili Dersi Aç
                  </Button>
                ) : null}
              </Card>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function MilestonesSection({ project }: { project: Project }) {
  if (!project.stages.length) return null;

  return (
    <View style={styles.section}>
      <SectionHeading
        description="Önemli proje aşamalarının güncel durumları."
        title="Kilometre Taşları"
      />
      <ProjectMilestoneList stages={project.stages} />
    </View>
  );
}

function ProjectLearningsSection({ project }: { project: Project }) {
  if (!project.learnings?.length) return null;

  return (
    <View style={styles.section}>
      <SectionHeading
        description="Proje sürecinden çıkan kısa ve uygulanabilir notlar."
        title="Bu Projede Ne Öğrendim?"
      />
      <ProjectLearningList learnings={project.learnings} />
    </View>
  );
}

function LearningCard({ lesson, width }: { lesson: Lesson; width: DimensionValue }) {
  const progress = useProgressStore((state) => state.lessons.find((item) => item.lessonId === lesson.id));
  const completed = Boolean(progress?.completedAt);
  const started = Boolean(progress?.lastBlockId);

  return (
    <Card style={[styles.learningCard, { width }]}>
      <View style={styles.cardMeta}>
        <Badge variant={completed ? 'success' : started ? 'warning' : 'neutral'}>
          {completed ? 'Tamamlandı' : started ? 'Devam Ediyor' : 'Başlanmadı'}
        </Badge>
        <Typography color="textMuted" variant="caption">{lesson.durationMinutes} dk · +{lesson.completionXp} XP</Typography>
      </View>
      <View style={styles.cardCopy}>
        <Typography accessibilityRole="header" variant="h4">{lesson.title}</Typography>
        <Typography color="textSecondary" style={styles.bodyLine}>{lesson.summary}</Typography>
      </View>
      <Button onPress={() => navigate(`/learn/${lesson.id}` as Href)} variant="secondary">
        {completed ? 'Tekrar İncele' : started ? 'Derse Devam Et' : 'Dersi Aç'}
      </Button>
    </Card>
  );
}

function QuizCard({ quiz, width }: { quiz: Quiz; width: DimensionValue }) {
  const progress = useProgressStore((state) => state.quizzes.find((item) => item.quizId === quiz.id));
  const completed = Boolean(progress?.completedAt);

  return (
    <Card style={[styles.learningCard, { width }]}>
      <View style={styles.cardMeta}>
        <Badge variant={completed ? 'success' : 'info'}>{completed ? 'Tamamlandı' : 'Mini Quiz'}</Badge>
        <Typography color="textMuted" variant="caption">{quiz.questions.length} soru · +{quiz.completionXp} XP</Typography>
      </View>
      <View style={styles.cardCopy}>
        <Typography accessibilityRole="header" variant="h4">{quiz.title}</Typography>
        <Typography color="textSecondary" style={styles.bodyLine}>{quiz.summary}</Typography>
      </View>
      <Button
        onPress={() => navigate(completed
          ? `/learn/${quiz.lessonId}/quiz/${quiz.id}/result` as Href
          : `/learn/${quiz.lessonId}/quiz/${quiz.id}` as Href)}
        variant="secondary"
      >
        {completed ? 'Sonucu İncele' : 'Quiz’e Git'}
      </Button>
    </Card>
  );
}

function LearningSection({ cardWidth, lessons, project, quizzes, showAllAction = true }: {
  cardWidth: DimensionValue;
  lessons: readonly Lesson[];
  project: Project;
  quizzes: readonly Quiz[];
  showAllAction?: boolean;
}) {
  return (
    <View style={styles.section}>
      <SectionHeading
        actionHref={showAllAction ? `/projects/${project.id}/learn` as Href : undefined}
        actionLabel={showAllAction ? 'Tümünü Gör' : undefined}
        description="Projede karşılaşılan teknik ve tasarımsal konular."
        title="İlgili Öğrenme İçerikleri"
      />
      {lessons.length || quizzes.length ? (
        <View style={styles.grid}>
          {lessons.map((lesson) => <LearningCard key={lesson.id} lesson={lesson} width={cardWidth} />)}
          {quizzes.map((quiz) => <QuizCard key={quiz.id} quiz={quiz} width={cardWidth} />)}
        </View>
      ) : (
        <Card style={styles.emptyCard}>
          <Typography accessibilityRole="header" variant="h4">İçerik hazırlanıyor</Typography>
          <Typography color="textSecondary">Bu projeye bağlı öğrenme veya quiz kaydı henüz yok.</Typography>
        </Card>
      )}
    </View>
  );
}

function QuizSection({ cardWidth, project, quizzes }: {
  cardWidth: DimensionValue;
  project: Project;
  quizzes: readonly Quiz[];
}) {
  return (
    <View style={styles.section}>
      <SectionHeading
        description={`${project.title} projesinden üretilen kısa bilgi testleri.`}
        title="Quizler"
      />
      {quizzes.length ? (
        <View style={styles.grid}>
          {quizzes.map((quiz) => <QuizCard key={quiz.id} quiz={quiz} width={cardWidth} />)}
        </View>
      ) : (
        <Card style={styles.emptyCard}>
          <Typography accessibilityRole="header" variant="h4">Henüz quiz yok</Typography>
          <Typography color="textSecondary">Bu projeye bağlı quiz hazır olduğunda burada görünecek.</Typography>
        </Card>
      )}
    </View>
  );
}

function Technologies({ project }: { project: Project }) {
  const technologies = getUniqueTechnologies(project.technologies);
  if (!technologies.length) return null;

  return (
    <View style={styles.section}>
      <SectionHeading title="Kullanılan Teknolojiler" />
      <Card>
        <ProjectTechnologyList technologies={technologies} />
      </Card>
    </View>
  );
}

function ProjectResult({ project }: { project: Project }) {
  const liveLink = project.links?.live;
  const sourceLink = project.links?.source;

  return (
    <View style={styles.section}>
      <SectionHeading title="Proje Sonucu" />
      <Card raised style={styles.resultCard}>
        <View style={styles.cardCopy}>
          <Typography color="primary" variant="caption">SONUÇ ÖZETİ</Typography>
          <Typography accessibilityRole="header" variant="h3">Ortaya çıkan deneyim</Typography>
          <Typography color="textSecondary" style={styles.resultSummary} variant="bodyLarge">{project.result.summary}</Typography>
        </View>
        <View accessibilityLabel="Projenin temel özellikleri" style={styles.highlightList}>
          {project.result.highlights.map((highlight) => (
            <View key={highlight} style={styles.highlightItem}>
              <View accessibilityElementsHidden importantForAccessibility="no" style={styles.highlightMarker} />
              <Typography style={styles.highlightText}>{highlight}</Typography>
            </View>
          ))}
        </View>
        {liveLink || sourceLink ? (
          <View style={styles.actionRow}>
            {liveLink ? <Button accessibilityRole="link" onPress={() => Linking.openURL(liveLink.url)}>{liveLink.label}</Button> : null}
            {sourceLink ? <Button accessibilityRole="link" onPress={() => Linking.openURL(sourceLink.url)} variant="secondary">{sourceLink.label}</Button> : null}
          </View>
        ) : null}
      </Card>
    </View>
  );
}

export function ProjectDetailScreen({ projectId, section = 'overview' }: Props) {
  const { width } = useWindowDimensions();
  const project = projectId ? getProjectById(projectId) : undefined;
  const hasHydrated = useProgressStore((state) => state.hasHydrated);
  const updateProjectProgress = useProgressStore((state) => state.updateProjectProgress);

  useEffect(() => {
    if (!hasHydrated || !project) return;
    updateProjectProgress(project.id, { lastVisitedAt: new Date().toISOString() });
  }, [hasHydrated, project, updateProjectProgress]);

  if (!project) return <ProjectNotFound projectId={projectId} />;
  if (!hasHydrated) return <LoadingProjectDetail />;

  const horizontalPadding = width >= breakpoints.medium
    ? layout.horizontalPadding.wide.min
    : layout.horizontalPadding.mobile;
  const contentWidth = Math.min(width - horizontalPadding * layout.columns.wide.min, layout.contentMaxWidth);
  const isWide = width >= breakpoints.medium;
  const cardWidth: DimensionValue = isWide
    ? (contentWidth - spacing.md) / layout.columns.wide.min
    : '100%';
  return (
    <Screen
      contentContainerStyle={styles.screen}
      edges={['top', 'bottom']}
      scrollViewProps={{ contentInsetAdjustmentBehavior: 'automatic' }}
    >
      <ProjectHero isWide={isWide} project={project} />
      <ProjectNavigation activeSection={section} project={project} />
      {section === 'overview' ? (
        <>
          <ProgressSummary project={project} />
          <JourneyPreview project={project} />
          <MilestonesSection project={project} />
          <ProjectLearningsSection project={project} />
          <LearningSection
            cardWidth={cardWidth}
            lessons={getLessonsByProjectId(project.id)}
            project={project}
            quizzes={getQuizzesByProjectId(project.id)}
          />
          <Technologies project={project} />
          <ProjectResult project={project} />
        </>
      ) : null}
      {section === 'journey' ? (
        <>
          <JourneyPreview project={project} showAllAction={false} />
          <MilestonesSection project={project} />
        </>
      ) : null}
      {section === 'learn' ? (
        <>
          <ProjectLearningsSection project={project} />
          <LearningSection
            cardWidth={cardWidth}
            lessons={getLessonsByProjectId(project.id)}
            project={project}
            quizzes={[]}
            showAllAction={false}
          />
        </>
      ) : null}
      {section === 'quiz' ? (
        <QuizSection
          cardWidth={cardWidth}
          project={project}
          quizzes={getQuizzesByProjectId(project.id)}
        />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { gap: spacing.xxxxl },
  heroColumns: { gap: spacing.xl },
  heroColumnsWide: { alignItems: 'stretch', flexDirection: 'row' },
  heroColumn: { flex: 1, gap: spacing.lg },
  heroMeta: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  heroCopy: { gap: spacing.sm },
  heroSummary: { lineHeight: spacing.xl, maxWidth: layout.readingWidth.min },
  bodyLine: { lineHeight: spacing.lg },
  actionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  cover: {
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: border.width,
    flex: 1,
    gap: spacing.xl,
    justifyContent: 'space-between',
    minHeight: spacing.max * layout.columns.wide.max,
    overflow: 'hidden',
    padding: spacing.xl,
  },
  coverCopy: { gap: spacing.md },
  coverRule: { backgroundColor: colors.primary, borderRadius: radius.pill, height: spacing.xxs, width: spacing.max },
  navigationRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  progressCard: { gap: spacing.xl, padding: spacing.xl },
  progressHeader: { alignItems: 'flex-end', flexDirection: 'row', gap: spacing.md, justifyContent: 'space-between' },
  sectionHeadingCopy: { flex: 1, gap: spacing.xxs },
  progressFacts: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  progressFact: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: border.width,
    flex: 1,
    gap: spacing.xs,
    minWidth: breakpoints.compact / layout.columns.wide.min,
    padding: spacing.md,
  },
  section: { gap: spacing.lg },
  sectionHeading: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  timeline: { gap: spacing.xs },
  timelineItem: { alignItems: 'stretch', flexDirection: 'row', gap: spacing.md },
  timelineRail: { alignItems: 'center', width: sizing.button.small },
  timelineMarker: {
    alignItems: 'center',
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.border,
    borderRadius: radius.pill,
    borderWidth: border.width,
    height: sizing.button.small,
    justifyContent: 'center',
    width: sizing.button.small,
  },
  timelineMarkerCompleted: { backgroundColor: colors.success, borderColor: colors.success },
  timelineLine: { backgroundColor: colors.border, flex: 1, width: border.width },
  stageCard: { flex: 1, gap: spacing.md, marginBottom: spacing.md },
  activeStageCard: { borderColor: colors.primary },
  stageHeader: { alignItems: 'flex-start', flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, justifyContent: 'space-between' },
  stageTitle: { flex: 1, minWidth: breakpoints.compact / layout.columns.wide.min },
  stageDetails: { borderTopColor: colors.border, borderTopWidth: border.width, gap: spacing.md, paddingTop: spacing.md },
  stageDetail: { gap: spacing.xxs },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  learningCard: { gap: spacing.lg },
  cardMeta: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, justifyContent: 'space-between' },
  cardCopy: { gap: spacing.xs },
  emptyCard: { gap: spacing.sm },
  resultCard: { gap: spacing.xl, padding: spacing.xl },
  resultSummary: { lineHeight: spacing.xl, maxWidth: layout.readingWidth.max },
  highlightList: { gap: spacing.sm },
  highlightItem: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm },
  highlightMarker: { backgroundColor: colors.success, borderRadius: radius.pill, height: spacing.xs, width: spacing.xs },
  highlightText: { flex: 1 },
  centeredState: { justifyContent: 'center' },
  errorCard: { alignSelf: 'center', gap: spacing.xl, maxWidth: layout.readingWidth.min, padding: spacing.xl, width: '100%' },
  loadingGroup: { gap: spacing.md },
  skeleton: { backgroundColor: colors.surfaceRaised, borderRadius: radius.md },
  loadingBadge: { height: spacing.xl, width: spacing.max + spacing.xxxxl },
  loadingTitle: { height: spacing.xxxxl, width: '55%' },
  loadingCopy: { height: spacing.lg, width: '100%' },
  loadingCopyShort: { height: spacing.lg, width: '70%' },
  loadingCover: { minHeight: spacing.max * layout.columns.wide.max },
  loadingSubtitle: { height: spacing.xxl, width: '40%' },
  loadingProgress: { height: spacing.xs, width: '100%' },
  loadingTimeline: { height: spacing.max * layout.columns.wide.min, width: '100%' },
});
