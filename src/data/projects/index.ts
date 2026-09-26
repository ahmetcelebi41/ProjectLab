import type { Project, ProjectId } from '@/types';

import { eloraProject } from './elora';
import { moonphaseProject } from './moonphase';
import { novaProject } from './nova';

export { eloraProject } from './elora';
export { moonphaseProject } from './moonphase';
export { novaProject } from './nova';

export const projects = [eloraProject, novaProject, moonphaseProject] as const satisfies readonly Project[];

export const projectsById = {
  elora: eloraProject,
  nova: novaProject,
  moonphase: moonphaseProject,
} as const satisfies Readonly<Record<ProjectId, Project>>;

export function getProjectById(id: string): Project | undefined {
  return projects.find((project) => project.id === id);
}
