import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { achievements, lessonsById, projectsById, quizzes, quizzesById } from '@/data';
import { evaluateAchievements } from '@/features/achievements/evaluateAchievements';
import { isLessonCompleted } from '@/features/progress/lessonProgress';
import { getQuizAwardXp } from '@/features/progress/rewards';
import {
  createQuizAttempt,
  isSameQuizCompletionEvent,
} from '@/features/quiz/quizAttempts';
import {
  MAX_PERSISTED_ACTIVITY_EVENTS,
  migrateProgressState,
  normalizeActivityHistory,
  PROGRESS_STORAGE_KEY,
  PROGRESS_STORAGE_VERSION,
  progressStorage,
  type PersistedProgressState,
} from '@/storage/progressStorage';
import type {
  ActivityEvent,
  ActivityEventType,
  AchievementId,
  LastActivity,
  LessonId,
  LessonProgress,
  ProjectId,
  ProjectProgress,
  QuizProgress,
  QuizAttemptType,
  QuizId,
  UserProgress,
} from '@/types';
import { PROGRESS_SCHEMA_VERSION } from '@/types';

type LessonProgressUpdate = Readonly<Partial<Omit<LessonProgress, 'lessonId'>>>;
type ProjectProgressUpdate = Readonly<Partial<Omit<ProjectProgress, 'projectId'>>>;
type ProjectMilestoneCompletion = Readonly<{
  milestoneId: string;
  completedAt?: string;
}>;
type LastActivityTarget =
  | Readonly<{ type: 'lesson'; lessonId: LessonId }>
  | Readonly<{ type: 'quiz'; quizId: QuizId }>;

type ProgressActions = {
  addActivityEvent: (event: ActivityEvent) => void;
  updateLessonProgress: (lessonId: LessonId, update: LessonProgressUpdate) => void;
  completeLesson: (lessonId: LessonId, completedAt?: string) => void;
  setLastActivity: (activity: LastActivityTarget, updatedAt?: string) => void;
  saveQuizResult: (result: QuizProgress, attemptType?: QuizAttemptType) => void;
  updateProjectProgress: (
    projectId: ProjectId,
    update: ProjectProgressUpdate,
    completedMilestone?: ProjectMilestoneCompletion,
  ) => void;
  setTotalXp: (totalXp: number) => void;
  unlockAchievement: (achievementId: AchievementId) => void;
  resetProgress: () => void;
  setHasHydrated: (hasHydrated: boolean) => void;
};

export type ProgressStore = UserProgress & ProgressActions & { hasHydrated: boolean };

export const MAX_ACTIVITY_HISTORY_EVENTS = MAX_PERSISTED_ACTIVITY_EVENTS;

const initialProgress: UserProgress = {
  schemaVersion: PROGRESS_SCHEMA_VERSION,
  totalXp: 0,
  projects: [],
  lessons: [],
  quizzes: [],
  quizHistory: [],
  lastActivity: null,
  activityHistory: [],
  earnedAchievementIds: [],
};

function replaceById<T>(
  items: readonly T[],
  matches: (item: T) => boolean,
  nextItem: T,
): readonly T[] {
  const index = items.findIndex(matches);

  if (index === -1) return [...items, nextItem];

  return items.map((item, itemIndex) => (itemIndex === index ? nextItem : item));
}

function addActivityEventToHistory(
  activityHistory: readonly ActivityEvent[],
  event: ActivityEvent,
): readonly ActivityEvent[] {
  if (activityHistory.some((item) => item.id === event.id)) return activityHistory;

  return [event, ...activityHistory]
    .sort((left, right) => right.timestamp - left.timestamp)
    .slice(0, MAX_ACTIVITY_HISTORY_EVENTS);
}

function getNumericTimestamp(occurredAt: string): number {
  const timestamp = Date.parse(occurredAt);
  return Number.isFinite(timestamp) ? timestamp : Date.now();
}

function createActivityEvent(
  type: ActivityEventType,
  entityId: string,
  occurredAt: string,
  uniqueKey?: string,
  metadata?: ActivityEvent['metadata'],
): ActivityEvent {
  const encodedUniqueKey = uniqueKey ? encodeURIComponent(uniqueKey) : undefined;
  return {
    id: [type, entityId, encodedUniqueKey].filter(Boolean).join(':'),
    type,
    entityId,
    timestamp: getNumericTimestamp(occurredAt),
    ...(metadata ? { metadata } : {}),
  };
}

function getQuizAttemptEventKey(attempt: NonNullable<ReturnType<typeof createQuizAttempt>>): string {
  return JSON.stringify([
    attempt.completedAt,
    attempt.correctAnswerCount,
    attempt.questionCount,
    ...attempt.wrongQuestionIds,
  ]);
}

function getActivityTargetKey(activity: LastActivity | LastActivityTarget): string {
  return activity.type === 'lesson'
    ? `${activity.type}:${activity.lessonId}`
    : `${activity.type}:${activity.quizId}`;
}

export const useProgressStore = create<ProgressStore>()(
  persist(
    (set, get) => {
      const evaluateCurrentAchievements = () => {
        const state = get();
        if (!state.hasHydrated) return;

        const unlockedIds = evaluateAchievements(state, achievements, quizzes);
        unlockedIds.forEach((achievementId) => get().unlockAchievement(achievementId));
      };

      return {
        ...initialProgress,
        hasHydrated: false,

        addActivityEvent: (event) => {
          set((state) => {
            const activityHistory = addActivityEventToHistory(state.activityHistory, event);
            return activityHistory === state.activityHistory ? state : { activityHistory };
          });
        },

        updateLessonProgress: (lessonId, update) => {
          set((state) => {
            const current = state.lessons.find((item) => item.lessonId === lessonId);
            const next: LessonProgress = { ...current, ...update, lessonId };

            return {
              lessons: replaceById(state.lessons, (item) => item.lessonId === lessonId, next),
            };
          });
          evaluateCurrentAchievements();
        },

        completeLesson: (lessonId, completedAt = new Date().toISOString()) => {
          if (isLessonCompleted(get().lessons, lessonId)) return;

          set((state) => {
            const current = state.lessons.find((item) => item.lessonId === lessonId);
            const next: LessonProgress = { ...current, lessonId, completedAt };

            return {
              activityHistory: addActivityEventToHistory(
                state.activityHistory,
                createActivityEvent('lesson_completed', lessonId, completedAt),
              ),
              totalXp: state.totalXp + lessonsById[lessonId].completionXp,
              lessons: replaceById(state.lessons, (item) => item.lessonId === lessonId, next),
            };
          });
          evaluateCurrentAchievements();
        },

        setLastActivity: (activity, updatedAt = new Date().toISOString()) => {
          const current = get().lastActivity;
          if (
            current?.occurredAt === updatedAt
            && getActivityTargetKey(current) === getActivityTargetKey(activity)
          ) {
            return;
          }

          set({ lastActivity: { ...activity, occurredAt: updatedAt } });
        },

        saveQuizResult: (result, attemptType = 'full') => {
          set((state) => {
            const current = state.quizzes.find((item) => item.quizId === result.quizId);
            const quiz = quizzesById[result.quizId];
            const attempt = result.completedAt
              ? createQuizAttempt(quiz, result.answers, result.completedAt, attemptType)
              : undefined;
            const isFirstCompletion = attemptType === 'full'
              && !current?.completedAt
              && attempt !== undefined;
            const correctAnswerCount = attempt?.correctAnswerCount
              ?? result.bestCorrectAnswerCount;
            const awardedXp = current?.awardedXp
              ?? (isFirstCompletion ? getQuizAwardXp(quiz, correctAnswerCount) : undefined);
            const next: QuizProgress = {
              ...result,
              answers: [
                ...new Map(
                  result.answers.map((answer) => [answer.questionId, answer]),
                ).values(),
              ],
              bestCorrectAnswerCount: Math.max(
                current?.bestCorrectAnswerCount ?? 0,
                attemptType === 'full'
                  ? correctAnswerCount
                  : current?.bestCorrectAnswerCount ?? 0,
              ),
              awardedXp,
              completedAt: current?.completedAt ?? attempt?.completedAt,
            };
            const shouldSaveAttempt = attempt !== undefined
              && !state.quizHistory.some((savedAttempt) => (
                isSameQuizCompletionEvent(savedAttempt, attempt)
              ));
            const activityEvent = shouldSaveAttempt && (isFirstCompletion || attemptType === 'retry')
              ? createActivityEvent(
                isFirstCompletion ? 'quiz_completed' : 'quiz_retry',
                result.quizId,
                attempt.completedAt,
                getQuizAttemptEventKey(attempt),
                {
                  correctAnswerCount: attempt.correctAnswerCount,
                  questionCount: attempt.questionCount,
                },
              )
              : undefined;

            return {
              activityHistory: activityEvent
                ? addActivityEventToHistory(state.activityHistory, activityEvent)
                : state.activityHistory,
              totalXp: isFirstCompletion
                ? state.totalXp + (awardedXp ?? quiz.completionXp)
                : state.totalXp,
              quizHistory: shouldSaveAttempt
                ? [...state.quizHistory, attempt]
                : state.quizHistory,
              quizzes: replaceById(
                state.quizzes,
                (item) => item.quizId === result.quizId,
                next,
              ),
            };
          });
          evaluateCurrentAchievements();
        },

        updateProjectProgress: (projectId, update, completedMilestone) => {
          set((state) => {
            const current = state.projects.find((item) => item.projectId === projectId);
            const next: ProjectProgress = {
              ...current,
              ...update,
              projectId,
            };
            const milestoneId = completedMilestone?.milestoneId.trim();
            const isKnownMilestone = milestoneId
              ? projectsById[projectId].stages.some((stage) => stage.id === milestoneId)
              : false;
            const milestoneCompletedAt = completedMilestone?.completedAt
              ?? new Date().toISOString();
            const activityEvent = milestoneId && isKnownMilestone
              ? createActivityEvent(
                'project_progress',
                projectId,
                milestoneCompletedAt,
                milestoneId,
                { milestoneId },
              )
              : undefined;

            return {
              activityHistory: activityEvent
                ? addActivityEventToHistory(state.activityHistory, activityEvent)
                : state.activityHistory,
              projects: replaceById(
                state.projects,
                (item) => item.projectId === projectId,
                next,
              ),
            };
          });
          evaluateCurrentAchievements();
        },

        setTotalXp: (totalXp) => {
          set({ totalXp });
          evaluateCurrentAchievements();
        },

        unlockAchievement: (achievementId) => {
          set((state) => {
            if (state.earnedAchievementIds.includes(achievementId)) return state;

            return {
              earnedAchievementIds: [...state.earnedAchievementIds, achievementId],
            };
          });
        },

        resetProgress: () => set({ ...initialProgress, activityHistory: [] }),
        setHasHydrated: (hasHydrated) => {
          set({ hasHydrated });
          if (hasHydrated) evaluateCurrentAchievements();
        },
      };
    },
    {
      name: PROGRESS_STORAGE_KEY,
      version: PROGRESS_STORAGE_VERSION,
      storage: progressStorage,
      migrate: migrateProgressState,
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...migrateProgressState(persistedState, PROGRESS_STORAGE_VERSION),
      }),
      partialize: (state): PersistedProgressState => ({
        schemaVersion: state.schemaVersion,
        totalXp: state.totalXp,
        projects: state.projects,
        lessons: state.lessons,
        quizzes: state.quizzes,
        quizHistory: state.quizHistory,
        lastActivity: state.lastActivity,
        activityHistory: normalizeActivityHistory(state.activityHistory),
        earnedAchievementIds: state.earnedAchievementIds,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
