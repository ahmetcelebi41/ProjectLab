import { apiContractsQuiz, designTokensQuiz } from '@/data/quizzes';
import type { Quiz, QuizAnswer, QuizAttempt } from '@/types';

import {
  createQuizAttempt,
  getBestQuizAttempt,
  getBestQuizScore,
  getLastQuizAttempt,
  getLastQuizScore,
  getQuizAttemptScore,
  getQuizRetryQuestions,
  isSameQuizCompletionEvent,
} from './quizAttempts';

const firstCompletedAt = '2026-09-27T10:00:00.000Z';
const secondCompletedAt = '2026-09-27T11:00:00.000Z';

function answersFor(quiz: Quiz, correctCount: number): readonly QuizAnswer[] {
  return quiz.questions.map((question, index) => ({
    questionId: question.id,
    selectedOptionId: index < correctCount
      ? question.correctOptionId
      : question.options.find((option) => option.id !== question.correctOptionId)!.id,
  }));
}

function attemptFor(correctCount: number, completedAt: string): QuizAttempt {
  const attempt = createQuizAttempt(
    designTokensQuiz,
    answersFor(designTokensQuiz, correctCount),
    completedAt,
  );
  if (!attempt) throw new Error('Test attempt should be valid');
  return attempt;
}

describe('quiz attempt services', () => {
  it('creates an attempt with derived score counts and stable wrong question ids', () => {
    const attempt = attemptFor(1, firstCompletedAt);

    expect(attempt).toEqual({
      quizId: designTokensQuiz.id,
      completedAt: firstCompletedAt,
      correctAnswerCount: 1,
      questionCount: 3,
      wrongQuestionIds: ['semantic-name', 'safe-change'],
    });
    expect(getQuizAttemptScore(attempt)).toEqual({
      score: 33,
      correctCount: 1,
      wrongCount: 2,
    });
  });

  it('handles perfect and entirely wrong attempts', () => {
    const perfect = attemptFor(designTokensQuiz.questions.length, firstCompletedAt);
    const allWrong = attemptFor(0, secondCompletedAt);

    expect(getQuizAttemptScore(perfect)).toEqual({
      score: 100,
      correctCount: 3,
      wrongCount: 0,
    });
    expect(perfect.wrongQuestionIds).toEqual([]);
    expect(getQuizAttemptScore(allWrong)).toEqual({
      score: 0,
      correctCount: 0,
      wrongCount: 3,
    });
    expect(allWrong.wrongQuestionIds).toEqual(
      designTokensQuiz.questions.map((question) => question.id),
    );
  });

  it.each([
    [{ correctAnswerCount: -1, questionCount: 3 }, { score: 0, correctCount: 0, wrongCount: 3 }],
    [{ correctAnswerCount: 5, questionCount: 3 }, { score: 100, correctCount: 3, wrongCount: 0 }],
    [{ correctAnswerCount: 1, questionCount: 0 }, { score: 0, correctCount: 0, wrongCount: 0 }],
    [{ correctAnswerCount: Number.NaN, questionCount: 3 }, { score: 0, correctCount: 0, wrongCount: 3 }],
  ])('normalizes invalid attempt counts safely', (counts, expected) => {
    expect(getQuizAttemptScore({
      quizId: designTokensQuiz.id,
      completedAt: firstCompletedAt,
      wrongQuestionIds: [],
      ...counts,
    })).toEqual(expected);
  });

  it('derives last and best score from ordered history without lowering the best', () => {
    const first = attemptFor(2, firstCompletedAt);
    const second = attemptFor(1, secondCompletedAt);
    const otherQuizAttempt = createQuizAttempt(
      apiContractsQuiz,
      answersFor(apiContractsQuiz, 3),
      secondCompletedAt,
    );
    if (!otherQuizAttempt) throw new Error('Other quiz attempt should be valid');
    const history = [first, otherQuizAttempt, second];

    expect(getLastQuizAttempt(history, designTokensQuiz.id)).toBe(second);
    expect(getLastQuizScore(history, designTokensQuiz.id)).toMatchObject({
      score: 33,
    });
    expect(getBestQuizAttempt(history, designTokensQuiz.id)).toBe(first);
    expect(getBestQuizScore(history, designTokensQuiz.id)).toMatchObject({
      score: 67,
    });
    expect(getLastQuizScore([], designTokensQuiz.id)).toBeUndefined();
    expect(getBestQuizScore([], designTokensQuiz.id)).toBeUndefined();
  });

  it('keeps the first attempt when best scores are equal', () => {
    const first = attemptFor(2, firstCompletedAt);
    const second = attemptFor(2, secondCompletedAt);

    expect(getBestQuizAttempt([first, second], designTokensQuiz.id)).toBe(first);
  });

  it('builds retry questions only from a selected attempt and ignores unknown ids', () => {
    const selectedAttempt: QuizAttempt = {
      ...attemptFor(1, firstCompletedAt),
      wrongQuestionIds: ['safe-change', 'missing-question'],
    };

    expect(getQuizRetryQuestions(designTokensQuiz, selectedAttempt).map((question) => question.id))
      .toEqual(['safe-change']);
    expect(getQuizRetryQuestions(
      designTokensQuiz,
      getLastQuizAttempt([attemptFor(2, firstCompletedAt), selectedAttempt], designTokensQuiz.id),
    ).map((question) => question.id)).toEqual(['safe-change']);
    expect(getQuizRetryQuestions(designTokensQuiz, attemptFor(3, secondCompletedAt))).toEqual([]);
    expect(getQuizRetryQuestions(designTokensQuiz)).toEqual([]);
    expect(getQuizRetryQuestions(apiContractsQuiz, selectedAttempt)).toEqual([]);
  });

  it('rejects incomplete answers and identifies duplicate completion events', () => {
    expect(createQuizAttempt(
      designTokensQuiz,
      answersFor(designTokensQuiz, 2).slice(0, 2),
      firstCompletedAt,
    )).toBeUndefined();

    const first = attemptFor(2, firstCompletedAt);
    expect(isSameQuizCompletionEvent(first, { ...first })).toBe(true);
    expect(isSameQuizCompletionEvent(first, attemptFor(1, firstCompletedAt))).toBe(false);
    expect(isSameQuizCompletionEvent(first, attemptFor(2, secondCompletedAt))).toBe(false);
  });
});
