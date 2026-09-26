import { useLocalSearchParams } from 'expo-router';
import { RouteScreen } from '@/components/shared/RouteScreen';

export default function QuizScreen() {
  const { lessonId, quizId } = useLocalSearchParams<{ lessonId: string; quizId: string }>();
  return <RouteScreen eyebrow={lessonId} title={`Quiz: ${quizId}`} description="3–5 soruluk mini quiz akışının route giriş noktası." links={[{ label: 'Örnek sonucu gör', href: `/learn/${lessonId}/quiz/${quizId}/result` }]} />;
}
