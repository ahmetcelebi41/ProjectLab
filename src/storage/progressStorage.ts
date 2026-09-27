import AsyncStorage from '@react-native-async-storage/async-storage';
import { createJSONStorage } from 'zustand/middleware';

import { achievementsById, lessonsById, projectsById, quizzesById } from '@/data';
import {
  PROGRESS_SCHEMA_VERSION,
  type AchievementId,
  type LastActivity,
  type LessonId,
  type LessonProgress,
  type ProjectId,
  type ProjectProgress,
  type QuizAnswer,
  type QuizAttempt,
  type QuizId,
  type QuizProgress,
  type UserProgress,
} from '@/types';

export const PROGRESS_STORAGE_KEY = '@projectlab/progress';

// Zustand envelope version. V1.0 already used 2, so 3 is required to make
// Zustand invoke the V1 -> UserProgress schemaVersion 2 migration.
export const PROGRESS_STORAGE_VERSION = 3;

export type PersistedProgressState = UserProgress;

const emptyProgress: UserProgress = {
  schemaVersion: PROGRESS_SCHEMA_VERSION,
  totalXp: 0,
  projects: [],
  lessons: [],
  quizzes: [],
  quizHistory: [],
  lastActivity: null,
  earnedAchievementIds: [],
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasOwn(record: object, key: PropertyKey): boolean {
  return Object.prototype.hasOwnProperty.call(record, key);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isNonNegativeInteger(value: unknown): value is number {
  return isFiniteNumber(value) && Number.isInteger(value) && value >= 0;
}

function isProjectId(value: unknown): value is ProjectId {
  return typeof value === 'string' && hasOwn(projectsById, value);
}

function isLessonId(value: unknown): value is LessonId {
  return typeof value === 'string' && hasOwn(lessonsById, value);
}

function isQuizId(value: unknown): value is QuizId {
  return typeof value === 'string' && hasOwn(quizzesById, value);
}

function isAchievementId(value: unknown): value is AchievementId {
  return typeof value === 'string' && hasOwn(achievementsById, value);
}

function isOptionalString(value: unknown): boolean {
  return value === undefined || typeof value === 'string';
}

function isProjectProgress(value: unknown): value is ProjectProgress {
  return isRecord(value)
    && isProjectId(value.projectId)
    && isOptionalString(value.lastVisitedAt);
}

function isLessonProgress(value: unknown): value is LessonProgress {
  return isRecord(value)
    && isLessonId(value.lessonId)
    && isOptionalString(value.lastBlockId)
    && isOptionalString(value.completedAt);
}

function isQuizAnswer(value: unknown): value is QuizAnswer {
  return isRecord(value)
    && typeof value.questionId === 'string'
    && typeof value.selectedOptionId === 'string';
}

function isQuizProgress(value: unknown): value is QuizProgress {
  return isRecord(value)
    && isQuizId(value.quizId)
    && isNonNegativeInteger(value.currentQuestionIndex)
    && Array.isArray(value.answers)
    && value.answers.every(isQuizAnswer)
    && isNonNegativeInteger(value.bestCorrectAnswerCount)
    && (value.awardedXp === undefined
      || (isFiniteNumber(value.awardedXp) && value.awardedXp >= 0))
    && isOptionalString(value.completedAt);
}

function isQuizAttempt(value: unknown): value is QuizAttempt {
  return isRecord(value)
    && isQuizId(value.quizId)
    && (value.attemptType === undefined
      || value.attemptType === 'full'
      || value.attemptType === 'retry')
    && typeof value.completedAt === 'string'
    && isNonNegativeInteger(value.correctAnswerCount)
    && isNonNegativeInteger(value.questionCount)
    && Array.isArray(value.wrongQuestionIds)
    && value.wrongQuestionIds.every((id) => typeof id === 'string');
}

function isLastActivity(value: unknown): value is LastActivity {
  if (!isRecord(value) || typeof value.occurredAt !== 'string') return false;
  return (value.type === 'lesson' && isLessonId(value.lessonId))
    || (value.type === 'quiz' && isQuizId(value.quizId));
}

export function isUserProgress(value: unknown): value is UserProgress {
  return isRecord(value)
    && value.schemaVersion === PROGRESS_SCHEMA_VERSION
    && isFiniteNumber(value.totalXp)
    && Array.isArray(value.projects)
    && value.projects.every(isProjectProgress)
    && Array.isArray(value.lessons)
    && value.lessons.every(isLessonProgress)
    && Array.isArray(value.quizzes)
    && value.quizzes.every(isQuizProgress)
    && Array.isArray(value.quizHistory)
    && value.quizHistory.every(isQuizAttempt)
    && (value.lastActivity === null || isLastActivity(value.lastActivity))
    && Array.isArray(value.earnedAchievementIds)
    && value.earnedAchievementIds.every(isAchievementId);
}

function assertSupportedSchema(value: unknown): void {
  if (
    isRecord(value)
    && typeof value.schemaVersion === 'number'
    && value.schemaVersion > PROGRESS_SCHEMA_VERSION
  ) {
    throw new Error(`Unsupported progress schema version: ${value.schemaVersion}`);
  }
}

function progressStorageReviver(key: string, value: unknown): unknown {
  if (key === '' && isRecord(value)) {
    assertSupportedSchema(isRecord(value.state) ? value.state : value);
  }
  return value;
}

export const progressStorage = createJSONStorage<PersistedProgressState>(
  () => AsyncStorage,
  { reviver: progressStorageReviver },
);

function optionalString(record: Record<string, unknown>, key: string): string | undefined {
  return typeof record[key] === 'string' ? record[key] : undefined;
}

function normalizeProjects(value: unknown): readonly ProjectProgress[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!isRecord(item) || !isProjectId(item.projectId)) return [];
    const lastVisitedAt = optionalString(item, 'lastVisitedAt');
    return [{
      projectId: item.projectId,
      ...(lastVisitedAt !== undefined ? { lastVisitedAt } : {}),
    }];
  });
}

function normalizeLessons(value: unknown): readonly LessonProgress[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!isRecord(item) || !isLessonId(item.lessonId)) return [];
    const lastBlockId = optionalString(item, 'lastBlockId');
    const completedAt = optionalString(item, 'completedAt');
    return [{
      lessonId: item.lessonId,
      ...(lastBlockId !== undefined ? { lastBlockId } : {}),
      ...(completedAt !== undefined ? { completedAt } : {}),
    }];
  });
}

function normalizeQuizzes(value: unknown): readonly QuizProgress[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!isRecord(item) || !isQuizId(item.quizId)) return [];

    const completedAt = optionalString(item, 'completedAt');
    const persistedAwardedXp = isFiniteNumber(item.awardedXp) && item.awardedXp >= 0
      ? item.awardedXp
      : undefined;
    const awardedXp = persistedAwardedXp
      ?? (completedAt !== undefined ? quizzesById[item.quizId].completionXp : undefined);

    return [{
      quizId: item.quizId,
      currentQuestionIndex: isNonNegativeInteger(item.currentQuestionIndex)
        ? item.currentQuestionIndex
        : 0,
      answers: Array.isArray(item.answers) ? item.answers.filter(isQuizAnswer) : [],
      bestCorrectAnswerCount: isNonNegativeInteger(item.bestCorrectAnswerCount)
        ? item.bestCorrectAnswerCount
        : 0,
      ...(awardedXp !== undefined ? { awardedXp } : {}),
      ...(completedAt !== undefined ? { completedAt } : {}),
    }];
  });
}

export function migrateProgressState(
  persistedState: unknown,
  _persistedVersion: number,
): PersistedProgressState {
  if (isUserProgress(persistedState)) return persistedState;
  assertSupportedSchema(persistedState);

  const legacy = isRecord(persistedState) ? persistedState : {};
  const isPartialV2 = legacy.schemaVersion === PROGRESS_SCHEMA_VERSION;
  const migrated: UserProgress = {
    ...emptyProgress,
    totalXp: isFiniteNumber(legacy.totalXp) ? legacy.totalXp : emptyProgress.totalXp,
    projects: normalizeProjects(legacy.projects),
    lessons: normalizeLessons(legacy.lessons),
    quizzes: normalizeQuizzes(legacy.quizzes),
    earnedAchievementIds: Array.isArray(legacy.earnedAchievementIds)
      ? legacy.earnedAchievementIds.filter(isAchievementId)
      : [],
    quizHistory: isPartialV2 && Array.isArray(legacy.quizHistory)
      ? legacy.quizHistory.filter(isQuizAttempt)
      : [],
    lastActivity: isPartialV2 && isLastActivity(legacy.lastActivity)
      ? legacy.lastActivity
      : null,
  };

  return isUserProgress(migrated) ? migrated : emptyProgress;
}
