import AsyncStorage from '@react-native-async-storage/async-storage';
import { createJSONStorage } from 'zustand/middleware';

import { quizzesById } from '@/data/quizzes';
import type { UserProgress } from '@/types';

export const PROGRESS_STORAGE_KEY = '@projectlab/progress';
// Zustand's persistence envelope version; independent from UserProgress.schemaVersion.
export const PROGRESS_STORAGE_VERSION = 2;

export type PersistedProgressState = UserProgress;

export const progressStorage = createJSONStorage<PersistedProgressState>(() => AsyncStorage);

export function migrateProgressState(
  persistedState: unknown,
  persistedVersion: number,
): PersistedProgressState {
  if (persistedVersion < 2) {
    const state = persistedState as PersistedProgressState;
    const migratedQuizzes = state.quizzes.map((progress) => {
      if (!progress.completedAt || progress.awardedXp !== undefined) return progress;

      const quiz = quizzesById[progress.quizId];
      return { ...progress, awardedXp: quiz.completionXp };
    });
    const migratedProjects = state.projects.map(({ lastVisitedAt, projectId }) => ({
      projectId,
      ...(lastVisitedAt ? { lastVisitedAt } : {}),
    }));

    return {
      ...state,
      projects: migratedProjects,
      quizzes: migratedQuizzes,
    };
  }

  switch (persistedVersion) {
    // Add version-specific migrations here before increasing
    // PROGRESS_STORAGE_VERSION.
    default:
      return persistedState as PersistedProgressState;
  }
}
