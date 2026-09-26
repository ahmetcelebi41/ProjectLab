import { projectsById } from '@/data/projects';

import { getActiveProjectStageId, getCompletedProjectStageIds } from './projectProgress';

describe('project progress helpers', () => {
  const project = projectsById.nova;

  it('journey durumunu yalnız statik proje aşamalarından türetir', () => {
    expect(getCompletedProjectStageIds(project)).toEqual(['planning', 'architecture']);
    expect(getActiveProjectStageId(project)).toBe('development');
  });
});
