import { useLocalSearchParams } from 'expo-router';
import { RouteScreen } from '@/components/shared/RouteScreen';

export default function ProjectJourneyScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  return <RouteScreen eyebrow={projectId} title="Yolculuk" description="Fikirden yayına proje aşamaları ve checkpoint’ler." />;
}
