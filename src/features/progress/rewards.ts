import type { Quiz } from '@/types';

export function getQuizScoreBonusXp(correctAnswerCount: number, questionCount: number): number {
  if (questionCount <= 0) return 0;

  const percentage = (Math.max(0, correctAnswerCount) / questionCount) * 100;
  if (percentage >= 100) return 30;
  if (percentage >= 85) return 20;
  if (percentage >= 70) return 10;
  return 0;
}

export function getQuizAwardXp(quiz: Quiz, correctAnswerCount: number): number {
  return quiz.completionXp + getQuizScoreBonusXp(correctAnswerCount, quiz.questions.length);
}
