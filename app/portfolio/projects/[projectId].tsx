import { useLocalSearchParams } from 'expo-router';
import { RouteScreen } from '@/components/navigation/RouteScreen';

export default function PortfolioProjectScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  return <RouteScreen eyebrow="Portföy Projesi" title={projectId.toUpperCase()} description="Problem, çözüm, teknolojiler, süreç, sonuç ve öğrenilenler." />;
}
