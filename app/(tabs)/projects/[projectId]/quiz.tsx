import { useLocalSearchParams } from 'expo-router';
import { RouteScreen } from '@/components/shared/RouteScreen';

export default function ProjectQuizScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  return <RouteScreen eyebrow={projectId} title="Quiz" description="Projeden üretilen kısa bilgi testleri." links={[{ label: 'Örnek quizi başlat', href: '/learn/design-tokens/quiz/token-basics' }]} />;
}
