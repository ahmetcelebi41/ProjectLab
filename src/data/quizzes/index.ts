import type { ProjectId, Quiz, QuizId } from '@/types';

import { apiContractsQuiz } from './apiContractsQuiz';
import { designTokensQuiz } from './designTokensQuiz';
import { productTaxonomyQuiz } from './productTaxonomyQuiz';

export { apiContractsQuiz } from './apiContractsQuiz';
export { designTokensQuiz } from './designTokensQuiz';
export { productTaxonomyQuiz } from './productTaxonomyQuiz';

export const quizzes = [
  designTokensQuiz,
  apiContractsQuiz,
  productTaxonomyQuiz,
] as const satisfies readonly Quiz[];

export const quizzesById = {
  'design-tokens-quiz': designTokensQuiz,
  'api-contracts-quiz': apiContractsQuiz,
  'product-taxonomy-quiz': productTaxonomyQuiz,
} as const satisfies Readonly<Record<QuizId, Quiz>>;

export function getQuizById(id: string): Quiz | undefined {
  return quizzes.find((quiz) => quiz.id === id);
}

export function getQuizzesByProjectId(projectId: ProjectId): readonly Quiz[] {
  return quizzes.filter((quiz) => quiz.projectId === projectId);
}
