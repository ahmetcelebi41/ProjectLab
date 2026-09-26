import { useLocalSearchParams } from 'expo-router';

import { QuizResultScreen as QuizResult } from '@/features/quiz/QuizResultScreen';

export default function QuizResultScreen() {
  const { lessonId, quizId } = useLocalSearchParams<{
    lessonId?: string | string[];
    quizId?: string | string[];
  }>();

  return (
    <QuizResult
      lessonId={Array.isArray(lessonId) ? lessonId[0] : lessonId}
      quizId={Array.isArray(quizId) ? quizId[0] : quizId}
    />
  );
}
