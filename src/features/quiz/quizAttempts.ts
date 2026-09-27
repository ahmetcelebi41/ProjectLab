import type { Quiz, QuizAnswer, QuizAttempt, QuizId, QuizQuestion } from '@/types';

import { getValidQuizAnswers } from './quizUtils';

export type QuizAttemptScore = Readonly<{
  score: number;
  correctCount: number;
  wrongCount: number;
}>;

export function createQuizAttempt(
  quiz: Quiz,
  answers: readonly QuizAnswer[],
  completedAt: string,
): QuizAttempt | undefined {
  if (!completedAt) return undefined;

  const validAnswers = getValidQuizAnswers(quiz, answers);
  if (validAnswers.length !== quiz.questions.length) return undefined;

  const answersByQuestionId = new Map(
    validAnswers.map((answer) => [answer.questionId, answer.selectedOptionId]),
  );
  const wrongQuestionIds = [...new Set(
    quiz.questions
      .filter((question) => answersByQuestionId.get(question.id) !== question.correctOptionId)
      .map((question) => question.id),
  )];

  return {
    quizId: quiz.id,
    completedAt,
    correctAnswerCount: quiz.questions.length - wrongQuestionIds.length,
    questionCount: quiz.questions.length,
    wrongQuestionIds,
  };
}

export function getQuizAttemptScore(attempt: QuizAttempt): QuizAttemptScore {
  const questionCount = Number.isInteger(attempt.questionCount) && attempt.questionCount > 0
    ? attempt.questionCount
    : 0;
  const validCorrectCount = Number.isInteger(attempt.correctAnswerCount)
    ? attempt.correctAnswerCount
    : 0;
  const correctCount = Math.min(questionCount, Math.max(0, validCorrectCount));

  return {
    score: questionCount === 0 ? 0 : Math.round((correctCount / questionCount) * 100),
    correctCount,
    wrongCount: questionCount - correctCount,
  };
}

export function getLastQuizAttempt(
  history: readonly QuizAttempt[],
  quizId: QuizId,
): QuizAttempt | undefined {
  for (let index = history.length - 1; index >= 0; index -= 1) {
    if (history[index].quizId === quizId) return history[index];
  }
  return undefined;
}

export function getBestQuizAttempt(
  history: readonly QuizAttempt[],
  quizId: QuizId,
): QuizAttempt | undefined {
  return history.reduce<QuizAttempt | undefined>((best, attempt) => {
    if (attempt.quizId !== quizId) return best;
    if (!best || getQuizAttemptScore(attempt).score > getQuizAttemptScore(best).score) {
      return attempt;
    }
    return best;
  }, undefined);
}

export function getLastQuizScore(
  history: readonly QuizAttempt[],
  quizId: QuizId,
): QuizAttemptScore | undefined {
  const attempt = getLastQuizAttempt(history, quizId);
  return attempt ? getQuizAttemptScore(attempt) : undefined;
}

export function getBestQuizScore(
  history: readonly QuizAttempt[],
  quizId: QuizId,
): QuizAttemptScore | undefined {
  const attempt = getBestQuizAttempt(history, quizId);
  return attempt ? getQuizAttemptScore(attempt) : undefined;
}

export function getQuizRetryQuestions(
  quiz: Quiz,
  attempt?: QuizAttempt,
): readonly QuizQuestion[] {
  if (!attempt || attempt.quizId !== quiz.id) return [];

  const wrongQuestionIds = new Set(attempt.wrongQuestionIds);
  return quiz.questions.filter((question) => wrongQuestionIds.has(question.id));
}

export function isSameQuizCompletionEvent(
  left: QuizAttempt,
  right: QuizAttempt,
): boolean {
  return left.quizId === right.quizId
    && left.completedAt === right.completedAt
    && left.correctAnswerCount === right.correctAnswerCount
    && left.questionCount === right.questionCount
    && left.wrongQuestionIds.length === right.wrongQuestionIds.length
    && left.wrongQuestionIds.every((id, index) => id === right.wrongQuestionIds[index]);
}
