import type { Achievement, AchievementId, Progress, Quiz } from '@/types';

function meetsAchievementRule(
  achievement: Achievement,
  progress: Progress,
  quizzes: readonly Quiz[],
): boolean {
  const { rule } = achievement;

  switch (rule.type) {
    case 'visited-projects':
      return progress.projects.filter((item) => Boolean(item.lastVisitedAt)).length >= rule.count;
    case 'completed-lessons':
      return progress.lessons.filter((item) => Boolean(item.completedAt)).length >= rule.count;
    case 'completed-quizzes':
      return progress.quizzes.filter((item) => Boolean(item.completedAt)).length >= rule.count;
    case 'perfect-quizzes': {
      const perfectQuizCount = progress.quizzes.filter((item) => {
        if (!item.completedAt) return false;
        const quiz = quizzes.find((candidate) => candidate.id === item.quizId);
        return Boolean(quiz && item.bestCorrectAnswerCount === quiz.questions.length);
      }).length;

      return perfectQuizCount >= rule.count;
    }
    default: {
      const exhaustiveCheck: never = rule;
      return exhaustiveCheck;
    }
  }
}

export function evaluateAchievements(
  progress: Progress,
  achievements: readonly Achievement[],
  quizzes: readonly Quiz[],
): readonly AchievementId[] {
  const earnedIds = new Set<AchievementId>(progress.earnedAchievementIds);

  return achievements
    .filter((achievement) => (
      !earnedIds.has(achievement.id)
      && meetsAchievementRule(achievement, progress, quizzes)
    ))
    .map((achievement) => achievement.id);
}
