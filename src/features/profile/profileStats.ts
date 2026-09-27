import { getQuizAttemptScore, isFullQuizAttempt } from '@/features/quiz/quizAttempts';
import type { LessonProgress, QuizAttempt } from '@/types';

export type ProfileLearningStats = Readonly<{
  completedLessonCount: number;
  fullQuizAttemptCount: number;
  bestFullQuizScore?: number;
}>;

export function getProfileLearningStats(
  lessonProgress: readonly LessonProgress[],
  quizHistory: readonly QuizAttempt[],
): ProfileLearningStats {
  const completedLessonIds = new Set(
    lessonProgress
      .filter((item) => Boolean(item.completedAt))
      .map((item) => item.lessonId),
  );
  const fullAttempts = quizHistory.filter(isFullQuizAttempt);
  const scoredFullAttempts = fullAttempts.filter((attempt) => (
    Number.isInteger(attempt.questionCount) && attempt.questionCount > 0
  ));

  return {
    completedLessonCount: completedLessonIds.size,
    fullQuizAttemptCount: fullAttempts.length,
    bestFullQuizScore: scoredFullAttempts.length > 0
      ? Math.max(...scoredFullAttempts.map((attempt) => getQuizAttemptScore(attempt).score))
      : undefined,
  };
}
