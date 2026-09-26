import type { LessonId } from './lesson';
import type { ProjectId } from './project';

export type QuizId = 'design-tokens-quiz' | 'api-contracts-quiz' | 'product-taxonomy-quiz';
export type QuizQuestionType = 'single-choice' | 'true-false';

export type AnswerOption = Readonly<{
  id: string;
  label: string;
}>;

export type QuizQuestion = Readonly<{
  id: string;
  type: QuizQuestionType;
  prompt: string;
  options: readonly AnswerOption[];
  correctOptionId: string;
  explanation: string;
}>;

export type Quiz = Readonly<{
  id: QuizId;
  projectId: ProjectId;
  lessonId: LessonId;
  title: string;
  summary: string;
  completionXp: number;
  questions: readonly QuizQuestion[];
}>;

