import type { ContentRegistry } from '@/types';

import { achievements, achievementsById } from './achievements';
import { lessons, lessonsById } from './lessons';
import { projects, projectsById } from './projects';
import { quizzes, quizzesById } from './quizzes';

export { achievements, achievementsById, getAchievementById } from './achievements';
export {
  assertContentIntegrity,
  validateContentIntegrity,
  type ContentCollections,
  type ContentIntegrityIssue,
} from './contentIntegrity';
export { getLessonById, getLessonsByProjectId, lessons, lessonsById } from './lessons';
export { getProjectById, projects, projectsById } from './projects';
export { getQuizById, getQuizzesByProjectId, quizzes, quizzesById } from './quizzes';

export const contentRegistry = {
  projects: projectsById,
  lessons: lessonsById,
  quizzes: quizzesById,
  achievements: achievementsById,
} as const satisfies ContentRegistry;

export const contentCollections = {
  projects,
  lessons,
  quizzes,
  achievements,
} as const;
