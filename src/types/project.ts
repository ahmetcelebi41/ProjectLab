import type { LessonId } from './lesson';
import type { QuizId } from './quiz';

export type ProjectId = 'elora' | 'nova' | 'moonphase';
export type ProjectType = 'web' | 'mobile' | 'dashboard';
export type ProjectStatus = 'planned' | 'in-progress' | 'completed';
export type ProjectStageStatus = 'not-started' | 'in-progress' | 'completed';

export type ProjectLink = Readonly<{
  label: string;
  url: string;
}>;

export type ProjectImage = Readonly<{
  assetId: string;
  alt: string;
}>;

export type ProjectStage = Readonly<{
  id: string;
  order: number;
  date?: string;
  title: string;
  summary: string;
  status: ProjectStageStatus;
  problem?: string;
  decision?: string;
  solution?: string;
  learning?: string;
  lessonIds?: readonly LessonId[];
}>;

export type Project = Readonly<{
  id: ProjectId;
  title: string;
  type: ProjectType;
  status: ProjectStatus;
  summary: string;
  purpose: string;
  technologies: readonly string[];
  learnings?: readonly string[];
  featured: boolean;
  portfolioVisible: boolean;
  updatedAt: string;
  currentStageId: string;
  stages: readonly ProjectStage[];
  lessonIds: readonly LessonId[];
  quizIds: readonly QuizId[];
  result: Readonly<{
    summary: string;
    highlights: readonly string[];
  }>;
  coverImage?: ProjectImage;
  gallery?: readonly ProjectImage[];
  links?: Readonly<{
    live?: ProjectLink;
    source?: ProjectLink;
  }>;
}>;

