import AsyncStorage from '@react-native-async-storage/async-storage';

import { quizzesById } from '@/data/quizzes';
import { useProgressStore } from '@/stores/progressStore';
import { PROGRESS_SCHEMA_VERSION, type UserProgress } from '@/types';

import {
  isUserProgress,
  migrateProgressState,
  PROGRESS_STORAGE_KEY,
  PROGRESS_STORAGE_VERSION,
} from './progressStorage';

const completedAt = '2026-09-26T00:00:00.000Z';

function createV2State(overrides: Partial<UserProgress> = {}): UserProgress {
  return {
    schemaVersion: PROGRESS_SCHEMA_VERSION,
    totalXp: 0,
    projects: [],
    lessons: [],
    quizzes: [],
    quizHistory: [],
    lastActivity: null,
    earnedAchievementIds: [],
    ...overrides,
  };
}

async function writePersistedState(state: unknown, version = 2): Promise<void> {
  await AsyncStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify({ state, version }));
}

async function readPersistedEnvelope(): Promise<{ state: unknown; version: number } | null> {
  const raw = await AsyncStorage.getItem(PROGRESS_STORAGE_KEY);
  return raw === null ? null : JSON.parse(raw) as { state: unknown; version: number };
}

function resetStoreState(): void {
  useProgressStore.setState({
    ...createV2State(),
    hasHydrated: false,
  });
}

describe('progress storage migration', () => {
  beforeEach(async () => {
    resetStoreState();
    await AsyncStorage.clear();
    jest.clearAllMocks();
  });

  it('uses schema version 2 without changing the existing storage key', () => {
    expect(PROGRESS_SCHEMA_VERSION).toBe(2);
    expect(PROGRESS_STORAGE_KEY).toBe('@projectlab/progress');
    expect(PROGRESS_STORAGE_VERSION).toBe(3);
  });

  it('migrates a real schema-less V1 envelope and persists V2 only after rehydrate succeeds', async () => {
    const legacyState = {
      totalXp: 137,
      projects: [{
        projectId: 'nova',
        lastVisitedAt: completedAt,
        completedStageIds: ['development'],
        activeStageId: 'release',
      }],
      lessons: [{
        lessonId: 'design-tokens',
        lastBlockId: 'token-taxonomy',
        completedAt,
      }],
      quizzes: [],
      earnedAchievementIds: [],
    };
    await writePersistedState(legacyState);

    await useProgressStore.persist.rehydrate();

    const state = useProgressStore.getState();
    expect(state.schemaVersion).toBe(2);
    expect(state.totalXp).toBe(137);
    expect(state.projects).toEqual([{ projectId: 'nova', lastVisitedAt: completedAt }]);
    expect(state.lessons).toEqual([{
      lessonId: 'design-tokens',
      lastBlockId: 'token-taxonomy',
      completedAt,
    }]);
    expect(state.quizHistory).toEqual([]);
    expect(state.lastActivity).toBeNull();

    const persisted = await readPersistedEnvelope();
    expect(persisted?.version).toBe(PROGRESS_STORAGE_VERSION);
    expect(isUserProgress(persisted?.state)).toBe(true);
    expect((persisted?.state as UserProgress).totalXp).toBe(137);
  });

  it('keeps totalXp and completed quiz protection while adding missing V2 fields', () => {
    const quiz = quizzesById['design-tokens-quiz'];
    const legacyState = {
      totalXp: 243,
      projects: [],
      lessons: [],
      quizzes: [{
        quizId: quiz.id,
        currentQuestionIndex: quiz.questions.length - 1,
        answers: [],
        bestCorrectAnswerCount: quiz.questions.length,
        completedAt,
      }],
      earnedAchievementIds: [],
    };

    const migrated = migrateProgressState(legacyState, 2);

    expect(migrated).toMatchObject({
      schemaVersion: 2,
      totalXp: 243,
      quizHistory: [],
      lastActivity: null,
    });
    expect(migrated.quizzes[0].awardedXp).toBe(quiz.completionXp);
    expect(isUserProgress(migrated)).toBe(true);
  });

  it('normalizes malformed and partial legacy fields without crashing or discarding valid lesson data', async () => {
    await writePersistedState({
      totalXp: 71,
      projects: 'invalid',
      lessons: [
        { lessonId: 'api-contracts', lastBlockId: 'request-shape', completedAt: 42 },
        { lessonId: 'unknown-lesson', completedAt },
        null,
      ],
      quizzes: [{ quizId: 'api-contracts-quiz', completedAt }],
      earnedAchievementIds: ['first-project', 'unknown-achievement', 4],
    });

    await expect(useProgressStore.persist.rehydrate()).resolves.toBeUndefined();

    const state = useProgressStore.getState();
    expect(state.totalXp).toBe(71);
    expect(state.projects).toEqual([]);
    expect(state.lessons).toEqual([{
      lessonId: 'api-contracts',
      lastBlockId: 'request-shape',
    }]);
    expect(state.quizzes).toEqual([{
      quizId: 'api-contracts-quiz',
      currentQuestionIndex: 0,
      answers: [],
      bestCorrectAnswerCount: 0,
      awardedXp: quizzesById['api-contracts-quiz'].completionXp,
      completedAt,
    }]);
    expect(state.earnedAchievementIds).toContain('first-project');
    expect(isUserProgress((await readPersistedEnvelope())?.state)).toBe(true);
  });

  it('uses safe defaults for empty storage', async () => {
    await useProgressStore.persist.rehydrate();

    expect(useProgressStore.getState()).toMatchObject({
      schemaVersion: 2,
      totalXp: 0,
      projects: [],
      lessons: [],
      quizzes: [],
      quizHistory: [],
      lastActivity: null,
      earnedAchievementIds: [],
    });
  });

  it('returns an already valid schema version 2 state without transforming it', () => {
    const v2State = createV2State({
      totalXp: 99,
      quizHistory: [{
        quizId: 'design-tokens-quiz',
        completedAt,
        correctAnswerCount: 2,
        questionCount: 3,
        wrongQuestionIds: ['question-3'],
      }],
      lastActivity: {
        type: 'quiz',
        quizId: 'design-tokens-quiz',
        occurredAt: completedAt,
      },
    });

    expect(migrateProgressState(v2State, 2)).toBe(v2State);
  });

  it('preserves an unknown future schema instead of silently downgrading it', async () => {
    const futureState = {
      ...createV2State({ totalXp: 500 }),
      schemaVersion: 3,
      futureOnlyField: { keep: true },
    };
    const futureRaw = JSON.stringify({
      state: futureState,
      version: PROGRESS_STORAGE_VERSION,
    });
    await AsyncStorage.setItem(PROGRESS_STORAGE_KEY, futureRaw);

    expect(() => migrateProgressState(futureState, PROGRESS_STORAGE_VERSION)).toThrow(
      'Unsupported progress schema version: 3',
    );
    await expect(useProgressStore.persist.rehydrate()).resolves.toBeUndefined();

    expect(await AsyncStorage.getItem(PROGRESS_STORAGE_KEY)).toBe(futureRaw);
    expect(useProgressStore.getState()).toMatchObject({
      schemaVersion: 2,
      totalXp: 0,
      hasHydrated: false,
    });
  });

  it('does not invoke migration again after the first successful persisted upgrade', async () => {
    const originalMigrate = useProgressStore.persist.getOptions().migrate;
    if (!originalMigrate) throw new Error('Progress migrate must be configured');
    const migrateSpy = jest.fn(originalMigrate);
    useProgressStore.persist.setOptions({ migrate: migrateSpy });

    try {
      await writePersistedState({
        totalXp: 44,
        projects: [],
        lessons: [],
        quizzes: [],
        earnedAchievementIds: [],
      });

      await useProgressStore.persist.rehydrate();
      expect(migrateSpy).toHaveBeenCalledTimes(1);
      expect((await readPersistedEnvelope())?.version).toBe(PROGRESS_STORAGE_VERSION);

      await useProgressStore.persist.rehydrate();
      expect(migrateSpy).toHaveBeenCalledTimes(1);
      expect(useProgressStore.getState().totalXp).toBe(44);
    } finally {
      useProgressStore.persist.setOptions({ migrate: originalMigrate });
    }
  });

  it('leaves malformed raw storage untouched when JSON parsing fails', async () => {
    const malformedRaw = '{not-valid-json';
    await AsyncStorage.setItem(PROGRESS_STORAGE_KEY, malformedRaw);

    await expect(useProgressStore.persist.rehydrate()).resolves.toBeUndefined();

    expect(await AsyncStorage.getItem(PROGRESS_STORAGE_KEY)).toBe(malformedRaw);
    expect(useProgressStore.getState()).toMatchObject({
      schemaVersion: 2,
      totalXp: 0,
      lessons: [],
      quizHistory: [],
      lastActivity: null,
    });
  });
});
