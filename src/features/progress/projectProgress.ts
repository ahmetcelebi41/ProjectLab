import type { Project } from '@/types';

export function getCompletedProjectStageIds(project: Project): readonly string[] {
  return project.stages
    .filter((stage) => stage.status === 'completed')
    .map((stage) => stage.id);
}

export function getActiveProjectStageId(project: Project): string {
  return project.currentStageId;
}
