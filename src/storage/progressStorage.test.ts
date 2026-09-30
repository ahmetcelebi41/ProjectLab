import AsyncStorage from '@react-native-async-storage/async-storage';

import { lessonsById } from '@/data/lessons';
import { quizzesById } from '@/data/quizzes';
import {
  getCategoryProgress,
  getLearningStats,
  getQuizStats,
} from '@/features/progress/learningStats';
import { getLevelProgress } from '@/features/progress/level';
import { isLessonCompleted } from '@/features/progress/lessonProgress';
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

  it('keeps history-only legacy attempts separate from canonical completion as an edge case', async () => {
    const projects = [
      { projectId: 'elora', lastVisitedAt: '2026-09-26T08:00:00.000Z' },
      { projectId: 'nova', lastVisitedAt: '2026-09-26T09:00:00.000Z' },
      { projectId: 'moonphase', lastVisitedAt: '2026-09-26T10:00:00.000Z' },
    ] as const;
    const lessons = [
      { lessonId: 'design-tokens', completedAt },
      { lessonId: 'api-contracts', completedAt },
      { lessonId: 'product-taxonomy', completedAt },
    ] as const;
    const quizzes = [
      {
        quizId: 'design-tokens-quiz',
        currentQuestionIndex: 1,
        answers: [],
        bestCorrectAnswerCount: 0,
      },
      {
        quizId: 'api-contracts-quiz',
        currentQuestionIndex: 1,
        answers: [],
        bestCorrectAnswerCount: 0,
      },
      {
        quizId: 'product-taxonomy-quiz',
        currentQuestionIndex: 1,
        answers: [],
        bestCorrectAnswerCount: 0,
      },
    ] as const;
    const quizHistory = [
      {
        quizId: 'design-tokens-quiz',
        completedAt: '2026-09-26T11:00:00.000Z',
        correctAnswerCount: 2,
        questionCount: 3,
        wrongQuestionIds: ['design-token-question-3'],
      },
      {
        quizId: 'api-contracts-quiz',
        completedAt: '2026-09-26T12:00:00.000Z',
        correctAnswerCount: 2,
        questionCount: 3,
        wrongQuestionIds: ['api-contract-question-3'],
      },
      {
        quizId: 'product-taxonomy-quiz',
        completedAt: '2026-09-26T13:00:00.000Z',
        correctAnswerCount: 2,
        questionCount: 3,
        wrongQuestionIds: ['product-taxonomy-question-3'],
      },
    ] as const;
    const earnedAchievementIds = [
      'first-project',
      'project-explorer',
      'first-lesson',
      'lesson-collector',
      'first-quiz',
    ] as const;
    const v11State = createV2State({
      totalXp: 120,
      projects,
      lessons,
      quizzes,
      quizHistory,
      earnedAchievementIds,
    });
    await writePersistedState(v11State, PROGRESS_STORAGE_VERSION);

    await useProgressStore.persist.rehydrate();

    const hydrated = useProgressStore.getState();
    const learningStats = getLearningStats(hydrated);
    const quizStats = getQuizStats(hydrated);
    expect(hydrated.quizHistory).toEqual(quizHistory);
    expect(learningStats).toMatchObject({
      completedLessons: 3,
      lessonCompletionPercent: 100,
      completedQuizzes: 0,
      quizCompletionPercent: 0,
      xp: 120,
      level: 13,
    });
    expect(quizStats).toMatchObject({
      completedQuizCount: 0,
      totalAttempts: 3,
      fullAttempts: 3,
      retryAttempts: 0,
    });
    expect(hydrated.projects).toEqual(projects);
    expect(hydrated.lessons).toEqual(lessons);
    expect(hydrated.quizzes).toEqual(quizzes);
    expect(hydrated.earnedAchievementIds).toEqual(earnedAchievementIds);
  });

  it('preserves V1.0 quiz completions while V1.1 attempt history remains unavailable', async () => {
    const legacyState = {
      totalXp: 120,
      projects: [
        { projectId: 'elora', lastVisitedAt: '2026-09-26T08:00:00.000Z' },
        { projectId: 'nova', lastVisitedAt: '2026-09-26T09:00:00.000Z' },
        { projectId: 'moonphase', lastVisitedAt: '2026-09-26T10:00:00.000Z' },
      ],
      lessons: [
        { lessonId: 'design-tokens', completedAt },
        { lessonId: 'api-contracts', completedAt },
        { lessonId: 'product-taxonomy', completedAt },
      ],
      quizzes: [
        {
          quizId: 'design-tokens-quiz',
          currentQuestionIndex: 2,
          answers: [],
          bestCorrectAnswerCount: 2,
          completedAt: '2026-09-26T11:00:00.000Z',
        },
        {
          quizId: 'api-contracts-quiz',
          currentQuestionIndex: 2,
          answers: [],
          bestCorrectAnswerCount: 2,
          completedAt: '2026-09-26T12:00:00.000Z',
        },
        {
          quizId: 'product-taxonomy-quiz',
          currentQuestionIndex: 2,
          answers: [],
          bestCorrectAnswerCount: 2,
          completedAt: '2026-09-26T13:00:00.000Z',
        },
      ],
      earnedAchievementIds: [
        'first-project',
        'project-explorer',
        'first-lesson',
        'lesson-collector',
        'first-quiz',
      ],
    };
    await writePersistedState(legacyState, 2);

    await useProgressStore.persist.rehydrate();

    const hydrated = useProgressStore.getState();
    const learningStats = getLearningStats(hydrated);
    const quizStats = getQuizStats(hydrated);
    expect(hydrated.quizHistory).toEqual([]);
    expect(learningStats).toMatchObject({
      completedLessons: 3,
      lessonCompletionPercent: 100,
      completedQuizzes: 3,
      quizCompletionPercent: 100,
      xp: 120,
      level: 13,
    });
    expect(quizStats).toMatchObject({
      completedQuizCount: 3,
      totalAttempts: 0,
      fullAttempts: 0,
      retryAttempts: 0,
      historyStatus: 'incomplete-history',
    });
    expect(hydrated.projects).toEqual(legacyState.projects);
    expect(hydrated.lessons).toEqual(legacyState.lessons);
    expect(hydrated.earnedAchievementIds).toEqual(legacyState.earnedAchievementIds);
    expect(hydrated.quizzes.map(({ completedAt: quizCompletedAt, quizId }) => ({
      completedAt: quizCompletedAt,
      quizId,
    }))).toEqual(legacyState.quizzes.map(({ completedAt: quizCompletedAt, quizId }) => ({
      completedAt: quizCompletedAt,
      quizId,
    })));
  });

  it('keeps a hydrated completed lesson idempotent without changing XP or the lesson list', async () => {
    const legacyState = {
      totalXp: 137,
      projects: [],
      lessons: [
        { lessonId: 'design-tokens', completedAt },
        { lessonId: 'api-contracts', lastBlockId: 'request-shape' },
      ],
      quizzes: [],
      earnedAchievementIds: [],
    };
    await writePersistedState(legacyState);
    await useProgressStore.persist.rehydrate();

    const hydrated = useProgressStore.getState();
    const hydratedLessons = hydrated.lessons;
    expect(isLessonCompleted(hydrated.lessons, 'design-tokens')).toBe(true);

    hydrated.completeLesson('design-tokens', '2026-09-28T00:00:00.000Z');

    const afterRepeat = useProgressStore.getState();
    expect(afterRepeat.totalXp).toBe(137);
    expect(afterRepeat.lessons).toBe(hydratedLessons);
    expect(afterRepeat.lessons).toEqual(legacyState.lessons);
    expect(afterRepeat.lessons.filter((item) => item.completedAt)).toHaveLength(1);
    expect(lessonsById['design-tokens'].completionXp).toBeGreaterThan(0);
  });

  it('preserves hydrated V2 quiz history, selector values and retry XP safeguards', async () => {
    const quiz = quizzesById['design-tokens-quiz'];
    const fullAnswers = quiz.questions.map((question, index) => ({
      questionId: question.id,
      selectedOptionId: index < 2
        ? question.correctOptionId
        : question.options.find((option) => option.id !== question.correctOptionId)!.id,
    }));
    const retryAt = '2026-09-27T11:00:00.000Z';
    const lastActivity = {
      type: 'quiz',
      quizId: quiz.id,
      occurredAt: retryAt,
    } as const;
    const v2State = createV2State({
      totalXp: 180,
      projects: [{ projectId: 'nova', lastVisitedAt: '2026-09-27T09:00:00.000Z' }],
      lessons: [{ lessonId: 'design-tokens', completedAt }],
      quizzes: [{
        quizId: quiz.id,
        currentQuestionIndex: quiz.questions.length - 1,
        answers: fullAnswers,
        bestCorrectAnswerCount: 2,
        awardedXp: 10,
        completedAt,
      }],
      quizHistory: [{
        quizId: quiz.id,
        completedAt,
        correctAnswerCount: 2,
        questionCount: quiz.questions.length,
        wrongQuestionIds: [quiz.questions[2].id],
      }, {
        quizId: quiz.id,
        attemptType: 'retry',
        completedAt: retryAt,
        correctAnswerCount: 1,
        questionCount: 1,
        wrongQuestionIds: [],
      }],
      lastActivity,
    });
    await writePersistedState(v2State, PROGRESS_STORAGE_VERSION);
    await useProgressStore.persist.rehydrate();

    const hydrated = useProgressStore.getState();
    const persistedSnapshot = JSON.stringify((
      useProgressStore.persist.getOptions().partialize!(hydrated)
    ));
    expect(hydrated.totalXp).toBe(180);
    expect(hydrated.lastActivity).toEqual(lastActivity);
    expect(hydrated.quizHistory).toEqual(v2State.quizHistory);
    expect(hydrated.quizHistory[0].attemptType).toBeUndefined();
    expect(hydrated.quizHistory[1].attemptType).toBe('retry');

    const learningStats = getLearningStats(hydrated);
    const quizStats = getQuizStats(hydrated);
    getCategoryProgress(hydrated);
    expect(learningStats.xp).toBe(180);
    expect(learningStats.level).toBe(getLevelProgress(180).level);
    expect(learningStats.completedQuizzes).toBe(1);
    expect(quizStats).toMatchObject({
      fullAttempts: 1,
      retryAttempts: 1,
      completedQuizCount: 1,
    });
    expect(JSON.stringify(useProgressStore.persist.getOptions().partialize!(hydrated)))
      .toBe(persistedSnapshot);

    hydrated.saveQuizResult({
      quizId: quiz.id,
      currentQuestionIndex: quiz.questions.length - 1,
      answers: fullAnswers,
      bestCorrectAnswerCount: 2,
      completedAt,
    }, 'full');
    expect(useProgressStore.getState().quizHistory).toHaveLength(2);

    useProgressStore.getState().saveQuizResult({
      quizId: quiz.id,
      currentQuestionIndex: quiz.questions.length - 1,
      answers: [{
        questionId: quiz.questions[2].id,
        selectedOptionId: quiz.questions[2].correctOptionId,
      }],
      bestCorrectAnswerCount: 1,
      completedAt: '2026-09-27T12:00:00.000Z',
    }, 'retry');

    const afterRetry = useProgressStore.getState();
    expect(afterRetry.totalXp).toBe(180);
    expect(afterRetry.quizHistory).toHaveLength(3);
    expect(afterRetry.quizHistory[2].attemptType).toBe('retry');
    expect(getLearningStats(afterRetry).completedQuizzes).toBe(1);
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
      }, {
        quizId: 'design-tokens-quiz',
        attemptType: 'retry',
        completedAt: '2026-09-27T11:00:00.000Z',
        correctAnswerCount: 1,
        questionCount: 2,
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
