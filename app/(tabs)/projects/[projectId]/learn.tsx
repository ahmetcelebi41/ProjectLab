import { useLocalSearchParams } from 'expo-router';

import { ProjectDetailScreen } from '@/features/projects/ProjectDetailScreen';

export default function ProjectLearnScreen() {
  const { projectId } = useLocalSearchParams<{ projectId?: string | string[] }>();
  const resolvedProjectId = Array.isArray(projectId) ? projectId[0] : projectId;

  return <ProjectDetailScreen projectId={resolvedProjectId} section="learn" />;
}
