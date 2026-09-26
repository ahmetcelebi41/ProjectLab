import type { Achievement, AchievementId } from './achievement';
import type { Lesson, LessonId } from './lesson';
import type { Project, ProjectId } from './project';
import type { Quiz, QuizId } from './quiz';

export type ContentRegistry = Readonly<{
  projects: Readonly<Record<ProjectId, Project>>;
  lessons: Readonly<Record<LessonId, Lesson>>;
  quizzes: Readonly<Record<QuizId, Quiz>>;
  achievements: Readonly<Record<AchievementId, Achievement>>;
}>;

