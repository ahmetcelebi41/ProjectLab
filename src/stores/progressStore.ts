import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { achievements, lessonsById, quizzes, quizzesById } from '@/data';
import { evaluateAchievements } from '@/features/achievements/evaluateAchievements';
import {
  migrateProgressState,
  PROGRESS_STORAGE_KEY,
  PROGRESS_STORAGE_VERSION,
  progressStorage,
  type PersistedProgressState,
} from '@/storage/progressStorage';
import type {
  AchievementId,
  LessonId,
  LessonProgress,
  Progress,
  ProjectId,
  ProjectProgress,
  QuizProgress,
} from '@/types';

type LessonProgressUpdate = Readonly<Partial<Omit<LessonProgress, 'lessonId'>>>;
type ProjectProgressUpdate = Readonly<Partial<Omit<ProjectProgress, 'projectId'>>>;

type ProgressActions = {
  updateLessonProgress: (lessonId: LessonId, update: LessonProgressUpdate) => void;
  completeLesson: (lessonId: LessonId, completedAt?: string) => void;
  saveQuizResult: (result: QuizProgress) => void;
  updateProjectProgress: (projectId: ProjectId, update: ProjectProgressUpdate) => void;
  setTotalXp: (totalXp: number) => void;
  unlockAchievement: (achievementId: AchievementId) => void;
  resetProgress: () => void;
  setHasHydrated: (hasHydrated: boolean) => void;
};

export type ProgressStore = Progress &
  ProgressActions & {
    hasHydrated: boolean;
  };

const initialProgress: Progress = {
  totalXp: 0,
  projects: [],
  lessons: [],
  quizzes: [],
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
          set((state) => {
            const current = state.lessons.find((item) => item.lessonId === lessonId);
            if (current?.completedAt) return state;

            const next: LessonProgress = { ...current, lessonId, completedAt };

            return {
              totalXp: state.totalXp + lessonsById[lessonId].completionXp,
              lessons: replaceById(state.lessons, (item) => item.lessonId === lessonId, next),
            };
          });
          evaluateCurrentAchievements();
        },

        saveQuizResult: (result) => {
          set((state) => {
            const current = state.quizzes.find((item) => item.quizId === result.quizId);
            const isFirstCompletion = !current?.completedAt && Boolean(result.completedAt);
            const next: QuizProgress = {
              ...result,
              answers: [
                ...new Map(
                  result.answers.map((answer) => [answer.questionId, answer]),
                ).values(),
              ],
              bestCorrectAnswerCount: Math.max(
                current?.bestCorrectAnswerCount ?? 0,
                result.bestCorrectAnswerCount,
              ),
              completedAt: current?.completedAt ?? result.completedAt,
            };

            return {
              totalXp: isFirstCompletion
                ? state.totalXp + quizzesById[result.quizId].completionXp
                : state.totalXp,
              quizzes: replaceById(
                state.quizzes,
                (item) => item.quizId === result.quizId,
                next,
              ),
            };
          });
          evaluateCurrentAchievements();
        },

        updateProjectProgress: (projectId, update) => {
          set((state) => {
            const current = state.projects.find((item) => item.projectId === projectId);
            const next: ProjectProgress = {
              ...current,
              ...update,
              projectId,
              completedStageIds: update.completedStageIds
                ? [...new Set(update.completedStageIds)]
                : (current?.completedStageIds ?? []),
            };

            return {
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

        resetProgress: () => set(initialProgress),
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
      partialize: (state): PersistedProgressState => ({
        totalXp: state.totalXp,
        projects: state.projects,
        lessons: state.lessons,
        quizzes: state.quizzes,
        earnedAchievementIds: state.earnedAchievementIds,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
