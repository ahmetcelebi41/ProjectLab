import { useLocalSearchParams } from 'expo-router';

import { ProjectDetailScreen } from '@/features/projects/ProjectDetailScreen';

export default function ProjectOverviewScreen() {
  const { projectId } = useLocalSearchParams<{ projectId?: string | string[] }>();

  return <ProjectDetailScreen projectId={Array.isArray(projectId) ? projectId[0] : projectId} />;
}
