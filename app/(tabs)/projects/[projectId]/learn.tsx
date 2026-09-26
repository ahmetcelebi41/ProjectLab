import { useLocalSearchParams } from 'expo-router';
import { RouteScreen } from '@/components/shared/RouteScreen';

export default function ProjectLearnScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  return <RouteScreen eyebrow={projectId} title="Öğren" description="Bu projeden üretilen teknik ve tasarımsal öğrenme içerikleri." links={[{ label: 'Design Token konusu', href: '/learn/design-tokens' }]} />;
}
