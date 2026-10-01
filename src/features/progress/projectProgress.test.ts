import { projectsById } from '@/data/projects';

import { getActiveProjectStageId, getCompletedProjectStageIds } from './projectProgress';

describe('project progress helpers', () => {
  const project = projectsById.nova;

  it('journey durumunu yalnız statik proje aşamalarından türetir', () => {
    expect(getCompletedProjectStageIds(project)).toEqual([
      'planning',
      'architecture',
      'development',
      'release',
    ]);
    expect(getActiveProjectStageId(project)).toBe('release');
    expect(Math.round(
      (getCompletedProjectStageIds(project).length / project.stages.length) * 100,
    )).toBe(100);
  });
});
