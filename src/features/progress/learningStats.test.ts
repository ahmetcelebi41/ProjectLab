import { lessons, quizzes } from '@/data';
import type { Lesson, QuizAttempt, UserProgress } from '@/types';
import { PROGRESS_SCHEMA_VERSION } from '@/types';

import {
  getCategoryProgress,
  getLearningStats,
  getQuizStats,
  LESSON_CATEGORY_TO_V12_CATEGORY,
} from './learningStats';

const firstCompletedAt = '2026-09-27T10:00:00.000Z';
const retryCompletedAt = '2026-09-27T11:00:00.000Z';

function progress(overrides: Partial<UserProgress> = {}): UserProgress {
  return {
    schemaVersion: PROGRESS_SCHEMA_VERSION,
    totalXp: 0,
    projects: [],
    lessons: [],
    quizzes: [],
    quizHistory: [],
    lastActivity: null,
    activityHistory: [],
    earnedAchievementIds: [],
    ...overrides,
  };
}

function attempt(overrides: Partial<QuizAttempt> = {}): QuizAttempt {
  return {
    quizId: 'design-tokens-quiz',
    attemptType: 'full',
    completedAt: firstCompletedAt,
    correctAnswerCount: 2,
    questionCount: 3,
    wrongQuestionIds: ['design-token-question-3'],
    ...overrides,
  };
}

describe('getLearningStats', () => {
  it('derives V1.2 completion, attempt, XP, level and latest activity fields', () => {
    const result = getLearningStats(progress({
      totalXp: 20,
      lessons: [
        { lessonId: 'design-tokens', completedAt: firstCompletedAt },
        { lessonId: 'design-tokens', completedAt: firstCompletedAt },
        { lessonId: 'api-contracts' },
      ],
      quizzes: [{
        quizId: 'design-tokens-quiz',
        currentQuestionIndex: 2,
        answers: [],
        bestCorrectAnswerCount: 2,
        completedAt: firstCompletedAt,
      }, {
        quizId: 'design-tokens-quiz',
        currentQuestionIndex: 2,
        answers: [],
        bestCorrectAnswerCount: 2,
        completedAt: retryCompletedAt,
      }],
      quizHistory: [attempt()],
      lastActivity: {
        type: 'lesson',
        lessonId: 'design-tokens',
        occurredAt: firstCompletedAt,
      },
      projects: [{ projectId: 'nova', lastVisitedAt: retryCompletedAt }],
    }));

    expect(result).toEqual({
      completedLessons: 1,
      totalLessons: 3,
      lessonCompletionPercent: 33,
      lessonCompletionRate: 33,
      completedQuizzes: 1,
      totalQuizzes: 3,
      quizCompletionPercent: 33,
      quizCompletionRate: 33,
      totalQuizAttempts: 1,
      fullAttempts: 1,
      retryAttempts: 0,
      xp: 20,
      level: 3,
      lastActivity: {
        type: 'project',
        projectId: 'nova',
        occurredAt: retryCompletedAt,
      },
    });
  });

  it('ignores invalid activity dates and safely normalizes XP', () => {
    expect(getLearningStats(progress({
      totalXp: Number.NaN,
      lastActivity: {
        type: 'quiz',
        quizId: 'design-tokens-quiz',
        occurredAt: 'invalid',
      },
      projects: [
        { projectId: 'nova', lastVisitedAt: 'also-invalid' },
        { projectId: 'elora', lastVisitedAt: firstCompletedAt },
      ],
    }))).toMatchObject({
      xp: 0,
      level: 1,
      lastActivity: {
        type: 'project',
        projectId: 'elora',
        occurredAt: firstCompletedAt,
      },
    });

    expect(getLearningStats(progress({
      lastActivity: {
        type: 'lesson',
        lessonId: 'design-tokens',
        occurredAt: 'invalid',
      },
    })).lastActivity).toBeNull();
  });

  it('returns safe zero completion rates for empty content', () => {
    expect(getLearningStats(progress(), { lessons: [], projects: [], quizzes: [] })).toEqual({
      completedLessons: 0,
      totalLessons: 0,
      lessonCompletionPercent: 0,
      lessonCompletionRate: 0,
      completedQuizzes: 0,
      totalQuizzes: 0,
      quizCompletionPercent: 0,
      quizCompletionRate: 0,
      totalQuizAttempts: 0,
      fullAttempts: 0,
      retryAttempts: 0,
      xp: 0,
      level: 1,
      lastActivity: null,
    });
  });

  it('uses only canonical quiz progress for completion while preserving attempt totals', () => {
    const result = getLearningStats(progress({
      quizzes: [{
        quizId: 'api-contracts-quiz',
        currentQuestionIndex: 2,
        answers: [],
        bestCorrectAnswerCount: 2,
        completedAt: firstCompletedAt,
      }],
      quizHistory: [
        attempt({
          quizId: 'design-tokens-quiz',
          attemptType: 'retry',
          completedAt: retryCompletedAt,
        }),
        attempt({
          quizId: 'product-taxonomy-quiz',
          completedAt: '2026-09-27T12:00:00.000Z',
        }),
      ],
    }));

    expect(result).toMatchObject({
      completedQuizzes: 1,
      quizCompletionPercent: 33,
      quizCompletionRate: 33,
      totalQuizAttempts: 2,
      fullAttempts: 1,
      retryAttempts: 1,
    });
  });

  it('keeps XP and level calculation independent from selector-derived attempt stats', () => {
    const withoutHistory = getLearningStats(progress({ totalXp: 20 }));
    const withHistory = getLearningStats(progress({
      totalXp: 20,
      quizHistory: [attempt(), attempt({
        attemptType: 'retry',
        completedAt: retryCompletedAt,
      })],
    }));

    expect(withHistory).toMatchObject({ xp: 20, level: 3 });
    expect({ xp: withHistory.xp, level: withHistory.level }).toEqual({
      xp: withoutHistory.xp,
      level: withoutHistory.level,
    });
  });
});

describe('getCategoryProgress', () => {
  it('uses the explicit V1.2 mapping and counts duplicate lesson ids once', () => {
    expect(LESSON_CATEGORY_TO_V12_CATEGORY).toEqual({
      'ui-ux': 'ui-ux',
      frontend: 'frontend',
      'backend-api': 'backend',
      database: 'backend',
      'git-github': 'devops',
      'deploy-cloud': 'devops',
      'project-planning': 'ui-ux',
    });

    const duplicateCatalog = [
      ...lessons,
      lessons[0],
      { ...lessons[0], id: lessons[0].id },
    ] as readonly Lesson[];
    const result = getCategoryProgress(progress({
      lessons: [
        { lessonId: 'design-tokens', completedAt: firstCompletedAt },
        { lessonId: 'design-tokens', completedAt: retryCompletedAt },
        { lessonId: 'api-contracts', completedAt: firstCompletedAt },
      ],
    }), duplicateCatalog);

    expect(result).toEqual([
      {
        id: 'ui-ux',
        name: 'UI/UX',
        category: 'ui-ux',
        label: 'UI/UX',
        completedLessons: 1,
        totalLessons: 2,
        completionPercent: 50,
        completionRate: 50,
      },
      {
        id: 'frontend',
        name: 'Frontend',
        category: 'frontend',
        label: 'Frontend',
        completedLessons: 0,
        totalLessons: 0,
        completionPercent: 0,
        completionRate: 0,
      },
      {
        id: 'backend',
        name: 'Backend',
        category: 'backend',
        label: 'Backend',
        completedLessons: 1,
        totalLessons: 1,
        completionPercent: 100,
        completionRate: 100,
      },
      {
        id: 'devops',
        name: 'DevOps',
        category: 'devops',
        label: 'DevOps',
        completedLessons: 0,
        totalLessons: 0,
        completionPercent: 0,
        completionRate: 0,
      },
    ]);
  });

  it('returns every category id/name with safe zero totals for an empty catalog', () => {
    expect(getCategoryProgress(progress(), [])).toEqual([
      {
        id: 'ui-ux',
        name: 'UI/UX',
        category: 'ui-ux',
        label: 'UI/UX',
        completedLessons: 0,
        totalLessons: 0,
        completionPercent: 0,
        completionRate: 0,
      },
      {
        id: 'frontend',
        name: 'Frontend',
        category: 'frontend',
        label: 'Frontend',
        completedLessons: 0,
        totalLessons: 0,
        completionPercent: 0,
        completionRate: 0,
      },
      {
        id: 'backend',
        name: 'Backend',
        category: 'backend',
        label: 'Backend',
        completedLessons: 0,
        totalLessons: 0,
        completionPercent: 0,
        completionRate: 0,
      },
      {
        id: 'devops',
        name: 'DevOps',
        category: 'devops',
        label: 'DevOps',
        completedLessons: 0,
        totalLessons: 0,
        completionPercent: 0,
        completionRate: 0,
      },
    ]);
  });
});

describe('getQuizStats', () => {
  it('aggregates full, missing-type and retry attempts with weighted accuracy', () => {
    const result = getQuizStats(progress({
      quizHistory: [
        attempt({ attemptType: undefined, correctAnswerCount: 2 }),
        attempt({
          completedAt: retryCompletedAt,
          attemptType: 'retry',
          correctAnswerCount: 1,
          questionCount: 2,
          wrongQuestionIds: ['design-token-question-2'],
        }),
        attempt({
          completedAt: '2026-09-27T12:00:00.000Z',
          correctAnswerCount: 3,
          wrongQuestionIds: [],
        }),
      ],
    }));

    expect(result).toEqual({
      totalAttempts: 3,
      quizAttempts: 3,
      fullAttempts: 2,
      retryAttempts: 1,
      completedQuizCount: 0,
      totalCorrect: 6,
      totalQuestions: 8,
      quizAccuracy: 75,
      firstAttemptCorrect: 2,
      firstAttemptQuestions: 3,
      firstAttemptAccuracy: 67,
      retryCorrect: 1,
      retryQuestions: 2,
      retryAccuracy: 50,
      historyStatus: 'complete',
      hasSufficientData: true,
      incompleteQuizIds: [],
    });
  });

  it('keeps history-only full attempts separate from canonical completion', () => {
    const result = getQuizStats(progress({
      quizHistory: [
        attempt(),
        attempt({
          completedAt: retryCompletedAt,
          correctAnswerCount: 3,
          wrongQuestionIds: [],
        }),
        attempt({
          quizId: 'api-contracts-quiz',
          attemptType: undefined,
          completedAt: '2026-09-27T12:00:00.000Z',
        }),
        attempt({
          quizId: 'product-taxonomy-quiz',
          attemptType: 'retry',
          completedAt: '2026-09-27T13:00:00.000Z',
        }),
      ],
    }));

    expect(result).toMatchObject({
      totalAttempts: 4,
      fullAttempts: 3,
      retryAttempts: 1,
      completedQuizCount: 0,
      historyStatus: 'incomplete-history',
      incompleteQuizIds: ['product-taxonomy-quiz'],
    });
  });

  it('separates first full-attempt accuracy from retry accuracy', () => {
    const result = getQuizStats(progress({
      quizHistory: [
        attempt({ correctAnswerCount: 1, questionCount: 2 }),
        attempt({
          completedAt: retryCompletedAt,
          correctAnswerCount: 2,
          questionCount: 2,
          wrongQuestionIds: [],
        }),
        attempt({
          attemptType: 'retry',
          completedAt: '2026-09-27T12:00:00.000Z',
          correctAnswerCount: 3,
          questionCount: 4,
        }),
      ],
    }));

    expect(result).toMatchObject({
      totalAttempts: 3,
      fullAttempts: 2,
      retryAttempts: 1,
      firstAttemptCorrect: 1,
      firstAttemptQuestions: 2,
      firstAttemptAccuracy: 50,
      retryCorrect: 3,
      retryQuestions: 4,
      retryAccuracy: 75,
    });
  });

  it('deduplicates attempts with the existing completion fingerprint', () => {
    const original = attempt();
    const sameEvent = { ...original, wrongQuestionIds: [...original.wrongQuestionIds] };
    const differentScore = { ...original, correctAnswerCount: 1 };

    expect(getQuizStats(progress({
      quizHistory: [original, sameEvent, differentScore],
    })).quizAttempts).toBe(2);
  });

  it('represents completed quizzes without full history as incomplete legacy data', () => {
    const result = getQuizStats(progress({
      quizzes: [{
        quizId: 'design-tokens-quiz',
        currentQuestionIndex: 2,
        answers: [],
        bestCorrectAnswerCount: 3,
        completedAt: firstCompletedAt,
      }],
      quizHistory: [attempt({
        attemptType: 'retry',
        completedAt: retryCompletedAt,
        correctAnswerCount: 1,
        questionCount: 1,
        wrongQuestionIds: [],
      })],
    }));

    expect(result).toMatchObject({
      quizAttempts: 1,
      fullAttempts: 0,
      retryAttempts: 1,
      firstAttemptAccuracy: null,
      historyStatus: 'incomplete-history',
      hasSufficientData: false,
      incompleteQuizIds: ['design-tokens-quiz'],
    });
  });

  it('treats retry-only history as incomplete even when aggregate progress is missing', () => {
    expect(getQuizStats(progress({
      quizHistory: [attempt({
        attemptType: 'retry',
        questionCount: 1,
        correctAnswerCount: 1,
        wrongQuestionIds: [],
      })],
    }))).toMatchObject({
      historyStatus: 'incomplete-history',
      hasSufficientData: false,
      incompleteQuizIds: ['design-tokens-quiz'],
    });
  });

  it('distinguishes zero data and excludes invalid attempts', () => {
    const invalidAttempts = [
      attempt({ completedAt: 'invalid' }),
      attempt({ questionCount: 0, correctAnswerCount: 0 }),
      attempt({ questionCount: 2, correctAnswerCount: 3 }),
    ];
    const result = getQuizStats(progress({ quizHistory: invalidAttempts }));

    expect(result).toEqual({
      totalAttempts: 0,
      quizAttempts: 0,
      fullAttempts: 0,
      retryAttempts: 0,
      completedQuizCount: 0,
      totalCorrect: 0,
      totalQuestions: 0,
      quizAccuracy: null,
      firstAttemptCorrect: 0,
      firstAttemptQuestions: 0,
      firstAttemptAccuracy: null,
      retryCorrect: 0,
      retryQuestions: 0,
      retryAccuracy: null,
      historyStatus: 'no-data',
      hasSufficientData: false,
      incompleteQuizIds: [],
    });
  });
});

describe('selector regressions', () => {
  it('does not mutate persisted/store-shaped state or content inputs', () => {
    const source = progress({
      totalXp: 20,
      projects: [{ projectId: 'nova', lastVisitedAt: retryCompletedAt }],
      lessons: [{ lessonId: 'design-tokens', completedAt: firstCompletedAt }],
      quizzes: [{
        quizId: 'design-tokens-quiz',
        currentQuestionIndex: 2,
        answers: [],
        bestCorrectAnswerCount: 2,
        completedAt: firstCompletedAt,
      }],
      quizHistory: [attempt()],
      lastActivity: {
        type: 'lesson',
        lessonId: 'design-tokens',
        occurredAt: firstCompletedAt,
      },
    });
    const sourceSnapshot = JSON.stringify(source);
    const lessonsSnapshot = JSON.stringify(lessons);
    const quizzesSnapshot = JSON.stringify(quizzes);

    getLearningStats(source);
    getCategoryProgress(source);
    getQuizStats(source);

    expect(JSON.stringify(source)).toBe(sourceSnapshot);
    expect(JSON.stringify(lessons)).toBe(lessonsSnapshot);
    expect(JSON.stringify(quizzes)).toBe(quizzesSnapshot);
  });

  it('returns deterministic values for repeated calls with the same state', () => {
    const source = progress({
      totalXp: 20,
      lessons: [{ lessonId: 'design-tokens', completedAt: firstCompletedAt }],
      quizHistory: [attempt()],
    });

    expect(getLearningStats(source)).toEqual(getLearningStats(source));
    expect(getCategoryProgress(source)).toEqual(getCategoryProgress(source));
    expect(getQuizStats(source)).toEqual(getQuizStats(source));
  });
});
