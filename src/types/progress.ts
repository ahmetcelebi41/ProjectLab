import type { AchievementId } from './achievement';
import type { LessonId } from './lesson';
import type { ProjectId } from './project';
import type { QuizId } from './quiz';

export type ContentProgressStatus = 'not-started' | 'in-progress' | 'completed';

export type ProjectProgress = Readonly<{
  projectId: ProjectId;
  lastVisitedAt?: string;
}>;

export type LessonProgress = Readonly<{
  lessonId: LessonId;
  lastBlockId?: string;
  completedAt?: string;
}>;

export type QuizAnswer = Readonly<{
  questionId: string;
  selectedOptionId: string;
}>;

export type QuizProgress = Readonly<{
  quizId: QuizId;
  currentQuestionIndex: number;
  answers: readonly QuizAnswer[];
  bestCorrectAnswerCount: number;
  awardedXp?: number;
  completedAt?: string;
}>;

export type Progress = Readonly<{
  totalXp: number;
  projects: readonly ProjectProgress[];
  lessons: readonly LessonProgress[];
  quizzes: readonly QuizProgress[];
  earnedAchievementIds: readonly AchievementId[];
}>;
