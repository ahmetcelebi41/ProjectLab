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
  it('derives completion, XP, level and the latest project/content activity', () => {
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
      totalLessons: lessons.length,
      lessonCompletionRate: 33,
      completedQuizzes: 1,
      totalQuizzes: quizzes.length,
      quizCompletionRate: 33,
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
      lessonCompletionRate: 0,
      completedQuizzes: 0,
      totalQuizzes: 0,
      quizCompletionRate: 0,
      xp: 0,
      level: 1,
      lastActivity: null,
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
      { category: 'ui-ux', label: 'UI/UX', completedLessons: 1, totalLessons: 2, completionRate: 50 },
      { category: 'frontend', label: 'Frontend', completedLessons: 0, totalLessons: 0, completionRate: 0 },
      { category: 'backend', label: 'Backend', completedLessons: 1, totalLessons: 1, completionRate: 100 },
      { category: 'devops', label: 'DevOps', completedLessons: 0, totalLessons: 0, completionRate: 0 },
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
      quizAttempts: 3,
      fullAttempts: 2,
      retryAttempts: 1,
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
      quizAttempts: 0,
      fullAttempts: 0,
      retryAttempts: 0,
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
