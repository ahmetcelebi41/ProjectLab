import { useLocalSearchParams } from 'expo-router';
import { RouteScreen } from '@/components/shared/RouteScreen';

export default function LessonDetailScreen() {
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  return <RouteScreen eyebrow="Konu Detayı" title={lessonId} description="Teknik açıklama, gerçek projedeki kullanım ve küçük örnek bu ekranda yer alır." links={[{ label: 'Quiz’e geç', href: `/learn/${lessonId}/quiz/token-basics` }]} />;
}
