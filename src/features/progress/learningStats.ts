import { lessons, projects, quizzes } from '@/data';
import { getLevelProgress } from '@/features/progress/level';
import { isSameQuizCompletionEvent } from '@/features/quiz/quizAttempts';
import type {
  ActivityEvent,
  ActivityEventType,
  LastActivity,
  Lesson,
  LessonCategory,
  LessonId,
  LessonProgress,
  Project,
  ProjectId,
  ProjectProgress,
  Quiz,
  QuizAttempt,
  QuizId,
  QuizProgress,
  UserProgress,
} from '@/types';

export type LatestActivity =
  | Readonly<{ type: 'lesson'; lessonId: LessonId; occurredAt: string }>
  | Readonly<{ type: 'quiz'; quizId: QuizId; occurredAt: string }>
  | Readonly<{ type: 'project'; projectId: ProjectId; occurredAt: string }>;

export type LearningStats = Readonly<{
  completedLessons: number;
  totalLessons: number;
  lessonCompletionPercent: number;
  /** @deprecated Use lessonCompletionPercent. */
  lessonCompletionRate: number;
  completedQuizzes: number;
  totalQuizzes: number;
  quizCompletionPercent: number;
  /** @deprecated Use quizCompletionPercent. */
  quizCompletionRate: number;
  totalQuizAttempts: number;
  fullAttempts: number;
  retryAttempts: number;
  xp: number;
  level: number;
  lastActivity: LatestActivity | null;
}>;

export type V12LearningCategory = 'ui-ux' | 'frontend' | 'backend' | 'devops';

export const V12_LEARNING_CATEGORIES = [
  { id: 'ui-ux', label: 'UI/UX' },
  { id: 'frontend', label: 'Frontend' },
  { id: 'backend', label: 'Backend' },
  { id: 'devops', label: 'DevOps' },
] as const satisfies readonly Readonly<{ id: V12LearningCategory; label: string }>[];

export const LESSON_CATEGORY_TO_V12_CATEGORY = {
  'ui-ux': 'ui-ux',
  frontend: 'frontend',
  'backend-api': 'backend',
  database: 'backend',
  'git-github': 'devops',
  'deploy-cloud': 'devops',
  // Product taxonomy and information architecture are treated as UX learning.
  'project-planning': 'ui-ux',
} as const satisfies Readonly<Record<LessonCategory, V12LearningCategory>>;

export type CategoryProgress = Readonly<{
  id: V12LearningCategory;
  name: string;
  /** @deprecated Use id. */
  category: V12LearningCategory;
  /** @deprecated Use name. */
  label: string;
  completedLessons: number;
  totalLessons: number;
  completionPercent: number;
  /** @deprecated Use completionPercent. */
  completionRate: number;
}>;

export type QuizHistoryStatus = 'no-data' | 'complete' | 'incomplete-history';

export type QuizStats = Readonly<{
  totalAttempts: number;
  /** @deprecated Use totalAttempts. */
  quizAttempts: number;
  fullAttempts: number;
  retryAttempts: number;
  completedQuizCount: number;
  totalCorrect: number;
  totalQuestions: number;
  quizAccuracy: number | null;
  firstAttemptCorrect: number;
  firstAttemptQuestions: number;
  firstAttemptAccuracy: number | null;
  retryCorrect: number;
  retryQuestions: number;
  retryAccuracy: number | null;
  historyStatus: QuizHistoryStatus;
  hasSufficientData: boolean;
  incompleteQuizIds: readonly QuizId[];
}>;

export type ProjectStats = Readonly<{
  totalProjects: number;
  completedProjects: number;
  inProgressProjects: number;
  completedStages: number;
  totalStages: number;
  projectProgressPercent: number;
}>;

export type ActivityTypeCounts = Readonly<Record<ActivityEventType, number>>;

export type ActivityStats = Readonly<{
  totalActivities: number;
  last7DaysActivityCount: number;
  eventTypeCounts: ActivityTypeCounts;
  last7DaysEventTypeCounts: ActivityTypeCounts;
}>;

type LearningStatsSource = Pick<
  UserProgress,
  'lastActivity' | 'lessons' | 'projects' | 'quizHistory' | 'quizzes' | 'totalXp'
>;

type CategoryProgressSource = Pick<UserProgress, 'lessons'>;
type QuizStatsSource = Pick<UserProgress, 'quizzes' | 'quizHistory'>;
type ActivityStatsSource = Readonly<{ activityHistory?: readonly ActivityEvent[] }>;

type LearningStatsContent = Readonly<{
  lessons: readonly Lesson[];
  projects: readonly Project[];
  quizzes: readonly Quiz[];
}>;

const defaultContent: LearningStatsContent = { lessons, projects, quizzes };

const ACTIVITY_EVENT_TYPES = [
  'lesson_completed',
  'quiz_completed',
  'quiz_retry',
  'project_progress',
] as const satisfies readonly ActivityEventType[];

function percentage(completed: number, total: number): number {
  return total > 0 ? Math.round((completed / total) * 100) : 0;
}

function accuracy(correct: number, total: number): number | null {
  return total > 0 ? Math.round((correct / total) * 100) : null;
}

function validTimestamp(value: unknown): number | undefined {
  if (typeof value !== 'string') return undefined;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : undefined;
}

function isCompleted(value: unknown): boolean {
  return typeof value === 'string' && value.length > 0;
}

function uniqueIds<T extends string>(values: readonly T[]): ReadonlySet<T> {
  return new Set(values);
}

function emptyActivityTypeCounts(): Record<ActivityEventType, number> {
  return {
    lesson_completed: 0,
    quiz_completed: 0,
    quiz_retry: 0,
    project_progress: 0,
  };
}

function uniqueProjects(projectCatalog: readonly Project[]): readonly Project[] {
  return [...new Map(projectCatalog.map((project) => [project.id, project])).values()];
}

function getLatestActivity(
  lastActivity: LastActivity | null,
  projectProgress: readonly ProjectProgress[],
  content: LearningStatsContent,
): LatestActivity | null {
  const lessonIds = uniqueIds(content.lessons.map((lesson) => lesson.id));
  const quizIds = uniqueIds(content.quizzes.map((quiz) => quiz.id));
  const projectIds = uniqueIds(content.projects.map((project) => project.id));
  const candidates: Array<Readonly<{ activity: LatestActivity; timestamp: number }>> = [];
  const contentTimestamp = validTimestamp(lastActivity?.occurredAt);

  if (lastActivity?.type === 'lesson'
    && lessonIds.has(lastActivity.lessonId)
    && contentTimestamp !== undefined) {
    candidates.push({ activity: lastActivity, timestamp: contentTimestamp });
  }

  if (lastActivity?.type === 'quiz'
    && quizIds.has(lastActivity.quizId)
    && contentTimestamp !== undefined) {
    candidates.push({ activity: lastActivity, timestamp: contentTimestamp });
  }

  projectProgress.forEach((item) => {
    const timestamp = validTimestamp(item.lastVisitedAt);
    if (!projectIds.has(item.projectId) || timestamp === undefined) return;
    candidates.push({
      activity: { type: 'project', projectId: item.projectId, occurredAt: item.lastVisitedAt! },
      timestamp,
    });
  });

  return candidates.reduce<Readonly<{ activity: LatestActivity; timestamp: number }> | undefined>(
    (latest, candidate) => !latest || candidate.timestamp > latest.timestamp ? candidate : latest,
    undefined,
  )?.activity ?? null;
}

function getCompletedLessonIds(
  progress: readonly LessonProgress[],
  lessonCatalog: readonly Lesson[],
): ReadonlySet<LessonId> {
  const knownLessonIds = uniqueIds(lessonCatalog.map((lesson) => lesson.id));
  return new Set(
    progress
      .filter((item) => knownLessonIds.has(item.lessonId) && isCompleted(item.completedAt))
      .map((item) => item.lessonId),
  );
}

function getCompletedQuizIds(
  progress: readonly QuizProgress[],
  quizCatalog: readonly Quiz[],
): ReadonlySet<QuizId> {
  const knownQuizIds = uniqueIds(quizCatalog.map((quiz) => quiz.id));
  return new Set(
    progress
      .filter((item) => knownQuizIds.has(item.quizId) && isCompleted(item.completedAt))
      .map((item) => item.quizId),
  );
}

export function getLearningStats(
  progress: LearningStatsSource,
  content: LearningStatsContent = defaultContent,
): LearningStats {
  const totalLessons = uniqueIds(content.lessons.map((lesson) => lesson.id)).size;
  const totalQuizzes = uniqueIds(content.quizzes.map((quiz) => quiz.id)).size;
  const completedLessons = getCompletedLessonIds(progress.lessons, content.lessons).size;
  const completedQuizzes = getCompletedQuizIds(
    progress.quizzes,
    content.quizzes,
  ).size;
  const quizStats = getQuizStats(progress, content.quizzes);
  const xp = Number.isFinite(progress.totalXp) ? Math.max(0, progress.totalXp) : 0;
  const lessonCompletionPercent = percentage(completedLessons, totalLessons);
  const quizCompletionPercent = percentage(completedQuizzes, totalQuizzes);

  return {
    completedLessons,
    totalLessons,
    lessonCompletionPercent,
    lessonCompletionRate: lessonCompletionPercent,
    completedQuizzes,
    totalQuizzes,
    quizCompletionPercent,
    quizCompletionRate: quizCompletionPercent,
    totalQuizAttempts: quizStats.totalAttempts,
    fullAttempts: quizStats.fullAttempts,
    retryAttempts: quizStats.retryAttempts,
    xp,
    level: getLevelProgress(xp).level,
    lastActivity: getLatestActivity(progress.lastActivity, progress.projects, content),
  };
}

export function getCategoryProgress(
  progress: CategoryProgressSource,
  lessonCatalog: readonly Lesson[] = lessons,
): readonly CategoryProgress[] {
  const uniqueLessons = [...new Map(
    lessonCatalog.map((lesson) => [lesson.id, lesson]),
  ).values()];
  const completedLessonIds = getCompletedLessonIds(progress.lessons, uniqueLessons);

  return V12_LEARNING_CATEGORIES.map(({ id, label }) => {
    const categoryLessons = uniqueLessons.filter((lesson) => (
      LESSON_CATEGORY_TO_V12_CATEGORY[lesson.category] === id
    ));
    const completedLessons = categoryLessons.filter((lesson) => (
      completedLessonIds.has(lesson.id)
    )).length;
    const completionPercent = percentage(completedLessons, categoryLessons.length);

    return {
      id,
      name: label,
      category: id,
      label,
      completedLessons,
      totalLessons: categoryLessons.length,
      completionPercent,
      completionRate: completionPercent,
    };
  });
}

export function getProjectStats(
  projectCatalog: readonly Project[] = projects,
): ProjectStats {
  const uniqueCatalog = uniqueProjects(projectCatalog);
  const stages = uniqueCatalog.flatMap((project) => (
    [...new Map(project.stages.map((stage) => [stage.id, stage])).values()]
  ));
  const completedStages = stages.filter((stage) => stage.status === 'completed').length;

  return {
    totalProjects: uniqueCatalog.length,
    completedProjects: uniqueCatalog.filter((project) => project.status === 'completed').length,
    inProgressProjects: uniqueCatalog.filter((project) => project.status === 'in-progress').length,
    completedStages,
    totalStages: stages.length,
    projectProgressPercent: percentage(completedStages, stages.length),
  };
}

function isActivityEventType(value: unknown): value is ActivityEventType {
  return ACTIVITY_EVENT_TYPES.some((type) => type === value);
}

function validActivityEvents(source: ActivityStatsSource): readonly ActivityEvent[] {
  if (!Array.isArray(source.activityHistory)) return [];

  return source.activityHistory.filter((event) => (
    typeof event === 'object'
    && event !== null
    && isActivityEventType(event.type)
    && Number.isFinite(event.timestamp)
  ));
}

function countActivityTypes(events: readonly ActivityEvent[]): ActivityTypeCounts {
  return events.reduce((counts, event) => {
    counts[event.type] += 1;
    return counts;
  }, emptyActivityTypeCounts());
}

function getLocalSevenDayStart(now: number): number {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - 6);
  return start.getTime();
}

export function getActivityStats(
  source: ActivityStatsSource = {},
  now: number = Date.now(),
): ActivityStats {
  const events = validActivityEvents(source);
  const validNow = Number.isFinite(now) ? now : 0;
  const sevenDayStart = getLocalSevenDayStart(validNow);
  const last7DaysEvents = events.filter((event) => (
    event.timestamp >= sevenDayStart && event.timestamp <= validNow
  ));

  return {
    totalActivities: events.length,
    last7DaysActivityCount: last7DaysEvents.length,
    eventTypeCounts: countActivityTypes(events),
    last7DaysEventTypeCounts: countActivityTypes(last7DaysEvents),
  };
}

export function getOverallProgress(
  progress: Pick<UserProgress, 'lessons' | 'quizzes'>,
  content: LearningStatsContent = defaultContent,
): number {
  const uniqueLessonCatalog = [...new Map(
    content.lessons.map((lesson) => [lesson.id, lesson]),
  ).values()];
  const uniqueQuizCatalog = [...new Map(
    content.quizzes.map((quiz) => [quiz.id, quiz]),
  ).values()];
  const projectStats = getProjectStats(content.projects);
  const completedUnits = getCompletedLessonIds(progress.lessons, uniqueLessonCatalog).size
    + getCompletedQuizIds(progress.quizzes, uniqueQuizCatalog).size
    + projectStats.completedStages;
  const totalUnits = uniqueLessonCatalog.length
    + uniqueQuizCatalog.length
    + projectStats.totalStages;

  return percentage(completedUnits, totalUnits);
}

function isValidAttempt(attempt: QuizAttempt, knownQuizIds: ReadonlySet<QuizId>): boolean {
  return knownQuizIds.has(attempt.quizId)
    && (attempt.attemptType === undefined
      || attempt.attemptType === 'full'
      || attempt.attemptType === 'retry')
    && validTimestamp(attempt.completedAt) !== undefined
    && Number.isInteger(attempt.questionCount)
    && attempt.questionCount > 0
    && Number.isInteger(attempt.correctAnswerCount)
    && attempt.correctAnswerCount >= 0
    && attempt.correctAnswerCount <= attempt.questionCount
    && Array.isArray(attempt.wrongQuestionIds)
    && attempt.wrongQuestionIds.every((id) => typeof id === 'string');
}

function uniqueValidAttempts(
  history: readonly QuizAttempt[],
  quizCatalog: readonly Quiz[],
): readonly QuizAttempt[] {
  const knownQuizIds = uniqueIds(quizCatalog.map((quiz) => quiz.id));
  return history.reduce<QuizAttempt[]>((unique, attempt) => {
    if (!isValidAttempt(attempt, knownQuizIds)) return unique;
    if (unique.some((saved) => isSameQuizCompletionEvent(saved, attempt))) return unique;
    unique.push(attempt);
    return unique;
  }, []);
}

function sumAttempts(attempts: readonly QuizAttempt[]): Readonly<{ correct: number; questions: number }> {
  return attempts.reduce(
    (total, attempt) => ({
      correct: total.correct + attempt.correctAnswerCount,
      questions: total.questions + attempt.questionCount,
    }),
    { correct: 0, questions: 0 },
  );
}

export function getQuizStats(
  progress: QuizStatsSource,
  quizCatalog: readonly Quiz[] = quizzes,
): QuizStats {
  const attempts = uniqueValidAttempts(progress.quizHistory, quizCatalog);
  const full = attempts.filter((attempt) => attempt.attemptType !== 'retry');
  const retry = attempts.filter((attempt) => attempt.attemptType === 'retry');
  const firstFullByQuiz = new Map<QuizId, QuizAttempt>();

  [...full]
    .sort((left, right) => Date.parse(left.completedAt) - Date.parse(right.completedAt))
    .forEach((attempt) => {
      if (!firstFullByQuiz.has(attempt.quizId)) firstFullByQuiz.set(attempt.quizId, attempt);
    });

  const totalScore = sumAttempts(attempts);
  const firstScore = sumAttempts([...firstFullByQuiz.values()]);
  const retryScore = sumAttempts(retry);
  const fullQuizIds = uniqueIds(full.map((attempt) => attempt.quizId));
  const completedQuizIds = getCompletedQuizIds(progress.quizzes, quizCatalog);
  const completedOrRetriedQuizIds = new Set<QuizId>(completedQuizIds);
  retry.forEach((attempt) => completedOrRetriedQuizIds.add(attempt.quizId));
  const incompleteQuizIds = [...completedOrRetriedQuizIds]
    .filter((quizId) => !fullQuizIds.has(quizId));
  const historyStatus: QuizHistoryStatus = incompleteQuizIds.length > 0
    ? 'incomplete-history'
    : attempts.length > 0
      ? 'complete'
      : 'no-data';

  return {
    totalAttempts: attempts.length,
    quizAttempts: attempts.length,
    fullAttempts: full.length,
    retryAttempts: retry.length,
    completedQuizCount: completedQuizIds.size,
    totalCorrect: totalScore.correct,
    totalQuestions: totalScore.questions,
    quizAccuracy: accuracy(totalScore.correct, totalScore.questions),
    firstAttemptCorrect: firstScore.correct,
    firstAttemptQuestions: firstScore.questions,
    firstAttemptAccuracy: accuracy(firstScore.correct, firstScore.questions),
    retryCorrect: retryScore.correct,
    retryQuestions: retryScore.questions,
    retryAccuracy: accuracy(retryScore.correct, retryScore.questions),
    historyStatus,
    hasSufficientData: historyStatus === 'complete',
    incompleteQuizIds,
  };
}
