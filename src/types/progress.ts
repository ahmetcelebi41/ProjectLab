import type { AchievementId } from './achievement';
import type { LessonId } from './lesson';
import type { ProjectId } from './project';
import type { QuizId } from './quiz';

export const PROGRESS_SCHEMA_VERSION = 2 as const;

export type ProgressSchemaVersion = typeof PROGRESS_SCHEMA_VERSION;

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

export type QuizAttempt = Readonly<{
  quizId: QuizId;
  completedAt: string;
  correctAnswerCount: number;
  questionCount: number;
  wrongQuestionIds: readonly string[];
}>;

export type LastActivity =
  | Readonly<{
    type: 'lesson';
    lessonId: LessonId;
    occurredAt: string;
  }>
  | Readonly<{
    type: 'quiz';
    quizId: QuizId;
    occurredAt: string;
  }>;

export type Progress = Readonly<{
  totalXp: number;
  projects: readonly ProjectProgress[];
  lessons: readonly LessonProgress[];
  quizzes: readonly QuizProgress[];
  earnedAchievementIds: readonly AchievementId[];
}>;

export type UserProgress = Progress & Readonly<{
  schemaVersion: ProgressSchemaVersion;
  quizHistory: readonly QuizAttempt[];
  lastActivity: LastActivity | null;
}>;
