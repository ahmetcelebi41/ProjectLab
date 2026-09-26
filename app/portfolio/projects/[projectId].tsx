import { useLocalSearchParams } from 'expo-router';
import { PortfolioProjectDetailScreen } from '@/features/portfolio/PortfolioProjectDetailScreen';

export default function PortfolioProjectRoute() {
  const { projectId } = useLocalSearchParams<{ projectId?: string | string[] }>();
  const normalizedProjectId = Array.isArray(projectId) ? projectId[0] : projectId;
  return <PortfolioProjectDetailScreen projectId={normalizedProjectId} />;
}
