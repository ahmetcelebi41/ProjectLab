import { useLocalSearchParams } from 'expo-router';

import { LessonDetailScreen } from '@/features/learn/LessonDetailScreen';

export default function LessonRoute() {
  const { lessonId } = useLocalSearchParams<{ lessonId?: string | string[] }>();
  const resolvedLessonId = Array.isArray(lessonId) ? lessonId[0] : lessonId;

  return <LessonDetailScreen lessonId={resolvedLessonId} />;
}
