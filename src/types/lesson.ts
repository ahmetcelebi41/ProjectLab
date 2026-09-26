import type { ProjectId } from './project';
import type { QuizId } from './quiz';

export type LessonId = 'design-tokens' | 'api-contracts' | 'product-taxonomy';

export type LessonCategory =
  | 'ui-ux'
  | 'frontend'
  | 'backend-api'
  | 'database'
  | 'git-github'
  | 'deploy-cloud'
  | 'project-planning';

export type LessonContentBlock =
  | Readonly<{ id: string; type: 'heading'; text: string }>
  | Readonly<{ id: string; type: 'paragraph'; text: string }>
  | Readonly<{ id: string; type: 'list'; items: readonly string[] }>
  | Readonly<{ id: string; type: 'code'; code: string; language: string; caption?: string }>
  | Readonly<{ id: string; type: 'callout'; emphasis: 'info' | 'important'; text: string }>;

export type Lesson = Readonly<{
  id: LessonId;
  projectIds: readonly ProjectId[];
  title: string;
  summary: string;
  objective: string;
  category: LessonCategory;
  tags: readonly string[];
  durationMinutes: number;
  completionXp: number;
  content: readonly LessonContentBlock[];
  takeaways: readonly string[];
  quizId?: QuizId;
}>;

