import type { LessonProgress, QuizAttempt } from '@/types';

import { getProfileLearningStats } from './profileStats';

const fullAttempt: QuizAttempt = {
  quizId: 'design-tokens-quiz',
  attemptType: 'full',
  completedAt: '2026-09-27T10:00:00.000Z',
  correctAnswerCount: 3,
  questionCount: 4,
  wrongQuestionIds: ['question-4'],
};

describe('getProfileLearningStats', () => {
  it('returns a safe empty summary for a new user', () => {
    expect(getProfileLearningStats([], [])).toEqual({
      completedLessonCount: 0,
      fullQuizAttemptCount: 0,
      bestFullQuizScore: undefined,
    });
  });

  it('counts each completed lesson once', () => {
    const progress = [
      { lessonId: 'design-tokens', completedAt: '2026-09-27T10:00:00.000Z' },
      { lessonId: 'design-tokens', completedAt: '2026-09-27T11:00:00.000Z' },
      { lessonId: 'api-contracts' },
    ] as unknown as readonly LessonProgress[];

    expect(getProfileLearningStats(progress, []).completedLessonCount).toBe(1);
  });

  it('keeps retry attempts out of full attempt count and best score', () => {
    const retryAttempt: QuizAttempt = {
      ...fullAttempt,
      attemptType: 'retry',
      completedAt: '2026-09-27T11:00:00.000Z',
      correctAnswerCount: 1,
      questionCount: 1,
      wrongQuestionIds: [],
    };

    expect(getProfileLearningStats([], [fullAttempt, retryAttempt])).toEqual({
      completedLessonCount: 0,
      fullQuizAttemptCount: 1,
      bestFullQuizScore: 75,
    });
  });

  it('handles invalid scores without NaN or Infinity', () => {
    const invalidAttempt = {
      ...fullAttempt,
      correctAnswerCount: Number.POSITIVE_INFINITY,
      questionCount: 0,
    };

    expect(getProfileLearningStats([], [invalidAttempt])).toEqual({
      completedLessonCount: 0,
      fullQuizAttemptCount: 1,
      bestFullQuizScore: undefined,
    });
  });
});
