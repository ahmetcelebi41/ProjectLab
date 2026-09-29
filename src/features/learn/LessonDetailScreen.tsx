import type { Href } from 'expo-router';
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Clipboard,
  ScrollView,
  StyleSheet,
  View,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Progress } from '@/components/ui/Progress';
import { Screen } from '@/components/ui/Screen';
import { Typography } from '@/components/ui/Typography';
import { getLessonById } from '@/data/lessons';
import { getProjectById } from '@/data/projects';
import { getQuizById } from '@/data/quizzes';
import {
  getCategoryProgress,
  LESSON_CATEGORY_TO_V12_CATEGORY,
} from '@/features/progress/learningStats';
import { isLessonCompleted } from '@/features/progress/lessonProgress';
import { useProgressStore } from '@/stores/progressStore';
import { border, colors, layout, radius, spacing, typography } from '@/theme/tokens';
import type { Lesson, LessonCategory, LessonContentBlock } from '@/types';

type Props = { lessonId?: string };
type BlockPosition = { bottom: number; index: number };

function nextActivityTimestamp(previousTimestamp?: string): string {
  const previousTime = previousTimestamp ? Date.parse(previousTimestamp) : Number.NaN;
  const currentTime = Date.now();

  return new Date(
    Number.isFinite(previousTime) ? Math.max(currentTime, previousTime + 1) : currentTime,
  ).toISOString();
}

const categoryLabels: Record<LessonCategory, string> = {
  'ui-ux': 'UI/UX',
  frontend: 'Frontend',
  'backend-api': 'Backend & API',
  database: 'Veritabanı',
  'git-github': 'Git & GitHub',
  'deploy-cloud': 'Deploy & Cloud',
  'project-planning': 'Proje Planlama',
};

function LoadingLesson() {
  return (
    <Screen
      contentContainerStyle={[styles.readingColumn, styles.screen]}
      edges={['top', 'bottom']}
      scrollViewProps={{
        accessibilityLabel: 'Ders yükleniyor',
        accessibilityState: { busy: true },
      }}
    >
      <View style={styles.metaRow}>
        <View style={[styles.skeleton, styles.loadingBadge]} />
        <View style={[styles.skeleton, styles.loadingMeta]} />
      </View>
      <View style={styles.heroCopy}>
        <View style={[styles.skeleton, styles.loadingTitle]} />
        <View style={[styles.skeleton, styles.loadingLine]} />
        <View style={[styles.skeleton, styles.loadingLineShort]} />
      </View>
      <Card style={styles.loadingCard}>
        <View style={[styles.skeleton, styles.loadingSubtitle]} />
        <View style={[styles.skeleton, styles.loadingLine]} />
      </Card>
      <View style={styles.loadingGroup}>
        <View style={[styles.skeleton, styles.loadingSubtitle]} />
        <View style={[styles.skeleton, styles.loadingParagraph]} />
        <View style={[styles.skeleton, styles.loadingParagraph]} />
      </View>
    </Screen>
  );
}

function LessonNotFound({ lessonId }: Props) {
  return (
    <Screen contentContainerStyle={styles.centeredState} edges={['top', 'bottom']}>
      <Card accessibilityLiveRegion="polite" style={styles.errorCard}>
        <Badge variant="error">Ders bulunamadı</Badge>
        <View style={styles.sectionCopy}>
          <Typography accessibilityRole="header" variant="h2">Bu ders mevcut değil</Typography>
          <Typography color="textSecondary" style={styles.bodyLine}>
            {lessonId
              ? `“${lessonId}” kimliğine sahip bir ders bulunamadı.`
              : 'Ders bağlantısında geçerli bir kimlik bulunmuyor.'}
          </Typography>
        </View>
        <Button onPress={() => router.replace('/learn')} size="large">Öğren’e Dön</Button>
      </Card>
    </Screen>
  );
}

function ContentBlock({ block }: { block: LessonContentBlock }) {
  const [copied, setCopied] = useState(false);

  switch (block.type) {
    case 'heading':
      return <Typography accessibilityRole="header" variant="h2">{block.text}</Typography>;
    case 'paragraph':
      return <Typography color="textSecondary" style={styles.readingText} variant="bodyLarge">{block.text}</Typography>;
    case 'list':
      return (
        <View accessibilityRole="list" style={styles.list}>
          {block.items.map((item) => (
            <View key={item} style={styles.listItem}>
              <View accessibilityElementsHidden importantForAccessibility="no" style={styles.listMarker} />
              <Typography color="textSecondary" style={[styles.readingText, styles.listText]} variant="bodyLarge">
                {item}
              </Typography>
            </View>
          ))}
        </View>
      );
    case 'code':
      return (
        <Card raised style={styles.codeCard}>
          <View style={styles.codeHeader}>
            <View style={styles.codeMeta}>
              <Badge variant="info">{block.language.toUpperCase()}</Badge>
              {block.caption ? <Typography color="textSecondary" variant="small">{block.caption}</Typography> : null}
            </View>
            <Button
              accessibilityLabel={`${block.caption ?? 'Kod'} içeriğini kopyala`}
              onPress={() => {
                Clipboard.setString(block.code);
                setCopied(true);
              }}
              size="small"
              variant="ghost"
            >
              {copied ? 'Kopyalandı' : 'Kopyala'}
            </Button>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator>
            <Typography selectable style={styles.codeText}>{block.code}</Typography>
          </ScrollView>
        </Card>
      );
    case 'callout':
      return (
        <Card
          accessibilityLabel={block.emphasis === 'important' ? 'Kritik nokta' : 'Bilgi'}
          style={[styles.callout, block.emphasis === 'important' ? styles.calloutImportant : styles.calloutInfo]}
        >
          <Badge variant={block.emphasis === 'important' ? 'warning' : 'info'}>
            {block.emphasis === 'important' ? 'Kritik nokta' : 'Bilgi'}
          </Badge>
          <Typography style={styles.readingText}>{block.text}</Typography>
        </Card>
      );
    default: {
      const exhaustiveCheck: never = block;
      return exhaustiveCheck;
    }
  }
}

function LessonHeader({ lesson }: { lesson: Lesson }) {
  const projectNames = lesson.projectIds
    .map((projectId) => getProjectById(projectId)?.title)
    .filter((title): title is string => Boolean(title))
    .join(', ');

  return (
    <View style={styles.hero}>
      <View style={styles.metaRow}>
        <Badge variant="primary">{categoryLabels[lesson.category]}</Badge>
        <Typography color="textMuted" variant="caption">
          {lesson.durationMinutes} dk · +{lesson.completionXp} XP
        </Typography>
      </View>
      <View style={styles.heroCopy}>
        {projectNames ? <Typography color="primary" variant="caption">{projectNames.toUpperCase()}</Typography> : null}
        <Typography accessibilityRole="header" variant="h1">{lesson.title}</Typography>
        <Typography color="textSecondary" style={styles.heroSummary} variant="bodyLarge">{lesson.summary}</Typography>
      </View>
      <View accessibilityLabel="Ders etiketleri" style={styles.tagRow}>
        {lesson.tags.map((tag) => <Badge key={tag}>{tag}</Badge>)}
      </View>
    </View>
  );
}

function LessonActions({ completed, lesson }: { completed: boolean; lesson: Lesson }) {
  const quiz = lesson.quizId ? getQuizById(lesson.quizId) : undefined;

  const handleComplete = () => {
    if (completed) return;

    const progressStore = useProgressStore.getState();
    if (isLessonCompleted(progressStore.lessons, lesson.id)) return;

    const occurredAt = nextActivityTimestamp(progressStore.lastActivity?.occurredAt);
    progressStore.completeLesson(lesson.id, occurredAt);
    progressStore.setLastActivity({ type: 'lesson', lessonId: lesson.id }, occurredAt);
  };

  return (
    <Card accessibilityLiveRegion="polite" raised style={styles.actionCard}>
      <View style={styles.sectionCopy}>
        <Typography color={completed ? 'success' : 'primary'} variant="caption">
          {completed ? 'DERS TAMAMLANDI' : 'DERSİ BİTİR'}
        </Typography>
        <Typography accessibilityRole="header" variant="h3">
          {completed ? 'Harika, bu dersi tamamladın.' : 'Hazırsan ilerlemeni kaydet.'}
        </Typography>
        <Typography color="textSecondary" style={styles.bodyLine}>
          {completed
            ? `Bu ders tamamlandı. Dersi istediğin zaman yeniden okuyabilirsin; tekrar okuma XP kazandırmaz.`
            : `Tamamladığında ${lesson.completionXp} XP kazanırsın.`}
        </Typography>
      </View>
      <View style={styles.actionRow}>
        {!completed ? (
          <Button
            accessibilityLabel={`${lesson.title} dersini tamamla`}
            onPress={handleComplete}
            size="large"
            style={styles.actionButton}
          >
            Dersi Tamamla
          </Button>
        ) : null}
        {quiz ? (
          <Button
            accessibilityLabel={`${quiz.title} quizini aç`}
            onPress={() => router.push(`/learn/${lesson.id}/quiz/${quiz.id}` as Href)}
            size="large"
            style={styles.actionButton}
            variant={completed ? 'primary' : 'secondary'}
          >
            {completed ? 'Quize Geç' : 'Bilgini Test Et'}
          </Button>
        ) : (
          <Button onPress={() => router.push('/learn')} size="large" style={styles.actionButton} variant="secondary">
            Öğren’e Dön
          </Button>
        )}
      </View>
    </Card>
  );
}

export function LessonDetailScreen({ lessonId }: Props) {
  const lesson = lessonId ? getLessonById(lessonId) : undefined;
  const hasHydrated = useProgressStore((state) => state.hasHydrated);
  const lessonProgressItems = useProgressStore((state) => state.lessons);
  const lessonProgress = lesson
    ? lessonProgressItems.find((item) => item.lessonId === lesson.id)
    : undefined;
  const updateLessonProgress = useProgressStore((state) => state.updateLessonProgress);
  const blockPositions = useRef(new Map<string, BlockPosition>());
  const contentTop = useRef(0);
  const furthestIndex = useRef(-1);
  const activityLessonId = useRef<string | null>(null);

  const currentBlockIndex = useMemo(() => {
    if (!lesson || !lessonProgress?.lastBlockId) return -1;
    return lesson.content.findIndex((block) => block.id === lessonProgress.lastBlockId);
  }, [lesson, lessonProgress?.lastBlockId]);
  const categoryProgress = useMemo(() => {
    if (!lesson) return undefined;
    const categoryId = LESSON_CATEGORY_TO_V12_CATEGORY[lesson.category];
    return getCategoryProgress({ lessons: lessonProgressItems })
      .find((category) => category.id === categoryId);
  }, [lesson, lessonProgressItems]);

  useEffect(() => {
    blockPositions.current.clear();
    contentTop.current = 0;
  }, [lessonId]);

  useEffect(() => {
    furthestIndex.current = currentBlockIndex;
  }, [currentBlockIndex, lessonId]);

  useEffect(() => {
    if (!hasHydrated || !lesson || activityLessonId.current === lesson.id) return;

    activityLessonId.current = lesson.id;
    useProgressStore.getState().setLastActivity({ type: 'lesson', lessonId: lesson.id });
  }, [hasHydrated, lesson]);

  useEffect(() => {
    if (!hasHydrated || !lesson || lessonProgress?.completedAt || lessonProgress?.lastBlockId || !lesson.content[0]) return;
    updateLessonProgress(lesson.id, { lastBlockId: lesson.content[0].id });
  }, [hasHydrated, lesson, lessonProgress?.completedAt, lessonProgress?.lastBlockId, updateLessonProgress]);

  const saveVisibleBlock = useCallback((visibleBottom: number) => {
    if (!lesson || !hasHydrated || lessonProgress?.completedAt) return;

    let next: BlockPosition | undefined;
    for (const position of blockPositions.current.values()) {
      if (contentTop.current + position.bottom <= visibleBottom && (!next || position.index > next.index)) {
        next = position;
      }
    }

    if (!next || next.index <= furthestIndex.current) return;
    furthestIndex.current = next.index;
    updateLessonProgress(lesson.id, { lastBlockId: lesson.content[next.index]?.id });
  }, [hasHydrated, lesson, lessonProgress?.completedAt, updateLessonProgress]);

  if (!lesson) return <LessonNotFound lessonId={lessonId} />;
  if (!hasHydrated) return <LoadingLesson />;

  const completed = isLessonCompleted(lessonProgress ? [lessonProgress] : [], lesson.id);
  const readBlockCount = completed ? lesson.content.length : Math.max(0, currentBlockIndex + 1);
  const progressValue = lesson.content.length
    ? Math.round((readBlockCount / lesson.content.length) * 100)
    : 0;
  const primaryProject = getProjectById(lesson.projectIds[0]);

  const handleBlockLayout = (block: LessonContentBlock, index: number, event: LayoutChangeEvent) => {
    const { height, y } = event.nativeEvent.layout;
    blockPositions.current.set(block.id, { bottom: y + height, index });
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, layoutMeasurement } = event.nativeEvent;
    saveVisibleBlock(contentOffset.y + layoutMeasurement.height);
  };

  return (
    <Screen
      contentContainerStyle={[styles.readingColumn, styles.screen]}
      edges={['top', 'bottom']}
      scrollViewProps={{
        contentInsetAdjustmentBehavior: 'automatic',
        onScroll: handleScroll,
        scrollEventThrottle: spacing.md,
      }}
    >
      <LessonHeader lesson={lesson} />

      <Card style={styles.progressCard}>
        <View style={styles.progressHeader}>
          <View style={styles.sectionCopy}>
            <Typography accessibilityRole="header" variant="h4">Ders ilerlemen</Typography>
            <Typography color="textMuted" variant="small">
              {completed ? 'Tamamlandı' : `${readBlockCount}/${lesson.content.length} içerik bloğu okundu`}
            </Typography>
          </View>
          <Typography color={completed ? 'success' : 'primary'} variant="h3">%{progressValue}</Typography>
        </View>
        <Progress
          accessibilityLabel={`${lesson.title} ders ilerlemesi yüzde ${progressValue}`}
          color={completed ? 'success' : 'primary'}
          value={progressValue}
        />
        {categoryProgress ? (
          <View style={styles.categoryProgress}>
            <Typography color="textSecondary" variant="small">
              {categoryProgress.name} kategori ilerlemesi
            </Typography>
            <Typography
              accessibilityLabel={`${categoryProgress.name} kategorisinde ${categoryProgress.totalLessons} dersten ${categoryProgress.completedLessons} tamamlandı, yüzde ${categoryProgress.completionPercent}`}
              color="textMuted"
              variant="small"
            >
              {categoryProgress.completedLessons}/{categoryProgress.totalLessons} ders · %{categoryProgress.completionPercent}
            </Typography>
          </View>
        ) : null}
      </Card>

      <Card raised style={styles.objectiveCard}>
        <Typography color="primary" variant="caption">ÖĞRENME HEDEFİ</Typography>
        <Typography style={styles.readingText} variant="bodyLarge">{lesson.objective}</Typography>
      </Card>

      <View
        accessibilityLabel="Ders içeriği"
        onLayout={(event) => { contentTop.current = event.nativeEvent.layout.y; }}
        style={styles.content}
      >
        {lesson.content.map((block, index) => (
          <View key={block.id} onLayout={(event) => handleBlockLayout(block, index, event)}>
            <ContentBlock block={block} />
          </View>
        ))}
      </View>

      {primaryProject ? (
        <Card style={styles.projectCard}>
          <View style={styles.sectionCopy}>
            <Typography color="primary" variant="caption">PROJE BAĞLANTISI</Typography>
            <Typography accessibilityRole="header" variant="h3">{primaryProject.title}</Typography>
            <Typography color="textSecondary" style={styles.bodyLine}>{primaryProject.summary}</Typography>
          </View>
          <Button
            accessibilityLabel={`${primaryProject.title} proje detayını aç`}
            onPress={() => router.push(`/projects/${primaryProject.id}` as Href)}
            variant="ghost"
          >
            Projeyi Aç
          </Button>
        </Card>
      ) : null}

      <View style={styles.takeawaySection}>
        <View style={styles.sectionCopy}>
          <Typography color="primary" variant="caption">KISA ÖZET</Typography>
          <Typography accessibilityRole="header" variant="h2">Aklında kalsın</Typography>
        </View>
        <Card style={styles.takeawayCard}>
          {lesson.takeaways.map((takeaway, index) => (
            <View key={takeaway} style={styles.takeawayItem}>
              <View style={styles.takeawayNumber}>
                <Typography color="primary" variant="caption">{String(index + 1).padStart(2, '0')}</Typography>
              </View>
              <Typography style={[styles.readingText, styles.takeawayText]}>{takeaway}</Typography>
            </View>
          ))}
        </Card>
      </View>

      <LessonActions completed={completed} lesson={lesson} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { gap: spacing.xxl },
  readingColumn: { maxWidth: layout.readingWidth.min },
  hero: { gap: spacing.xl },
  heroCopy: { gap: spacing.sm },
  heroSummary: { lineHeight: spacing.xl },
  metaRow: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, justifyContent: 'space-between' },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  progressCard: { gap: spacing.md, padding: spacing.lg },
  progressHeader: { alignItems: 'center', flexDirection: 'row', gap: spacing.md, justifyContent: 'space-between' },
  categoryProgress: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, justifyContent: 'space-between' },
  sectionCopy: { flex: 1, gap: spacing.xs },
  objectiveCard: { borderColor: colors.primary, gap: spacing.sm, padding: spacing.lg },
  content: { gap: spacing.xl },
  readingText: { lineHeight: spacing.xl },
  bodyLine: { lineHeight: spacing.lg },
  list: { gap: spacing.sm },
  listItem: { alignItems: 'flex-start', flexDirection: 'row', gap: spacing.sm },
  listMarker: { backgroundColor: colors.primary, borderRadius: radius.pill, height: spacing.xs, marginTop: spacing.xs, width: spacing.xs },
  listText: { flex: 1 },
  codeCard: { gap: spacing.md, padding: spacing.md },
  codeHeader: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, justifyContent: 'space-between' },
  codeMeta: { alignItems: 'center', flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  codeText: { color: colors.text, fontFamily: typography.fontFamily.monospace, lineHeight: spacing.xl, paddingBottom: spacing.xs, paddingRight: spacing.xl },
  callout: { gap: spacing.md, padding: spacing.lg },
  calloutImportant: { borderColor: colors.warning },
  calloutInfo: { borderColor: colors.info },
  projectCard: { alignItems: 'stretch', gap: spacing.lg, padding: spacing.lg },
  takeawaySection: { gap: spacing.md },
  takeawayCard: { gap: spacing.md, padding: spacing.lg },
  takeawayItem: { alignItems: 'flex-start', flexDirection: 'row', gap: spacing.md },
  takeawayNumber: { alignItems: 'center', backgroundColor: colors.surfaceRaised, borderColor: colors.border, borderRadius: radius.pill, borderWidth: border.width, justifyContent: 'center', minHeight: spacing.xxl, minWidth: spacing.xxl },
  takeawayText: { flex: 1 },
  actionCard: { gap: spacing.xl, padding: spacing.xl },
  actionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  actionButton: { flexGrow: 1 },
  centeredState: { justifyContent: 'center' },
  errorCard: { alignSelf: 'center', gap: spacing.xl, maxWidth: layout.readingWidth.min, padding: spacing.xl, width: '100%' },
  skeleton: { backgroundColor: colors.surfaceRaised, borderRadius: radius.md },
  loadingGroup: { gap: spacing.md },
  loadingCard: { gap: spacing.md, padding: spacing.lg },
  loadingBadge: { height: spacing.xl, width: spacing.max + spacing.xxl },
  loadingMeta: { height: spacing.md, width: spacing.max * 2 },
  loadingTitle: { height: spacing.xxxxl, width: '80%' },
  loadingLine: { height: spacing.lg, width: '100%' },
  loadingLineShort: { height: spacing.lg, width: '70%' },
  loadingSubtitle: { height: spacing.xxl, width: '45%' },
  loadingParagraph: { height: spacing.max, width: '100%' },
});
