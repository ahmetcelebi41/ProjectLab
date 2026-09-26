import type { Lesson, LessonId, ProjectId } from '@/types';

import { apiContractsLesson } from './apiContracts';
import { designTokensLesson } from './designTokens';
import { productTaxonomyLesson } from './productTaxonomy';

export { apiContractsLesson } from './apiContracts';
export { designTokensLesson } from './designTokens';
export { productTaxonomyLesson } from './productTaxonomy';

export const lessons = [
  designTokensLesson,
  apiContractsLesson,
  productTaxonomyLesson,
] as const satisfies readonly Lesson[];

export const lessonsById = {
  'design-tokens': designTokensLesson,
  'api-contracts': apiContractsLesson,
  'product-taxonomy': productTaxonomyLesson,
} as const satisfies Readonly<Record<LessonId, Lesson>>;

export function getLessonById(id: string): Lesson | undefined {
  return lessons.find((lesson) => lesson.id === id);
}

export function getLessonsByProjectId(projectId: ProjectId): readonly Lesson[] {
  return lessons.filter((lesson) =>
    (lesson.projectIds as readonly ProjectId[]).includes(projectId),
  );
}
