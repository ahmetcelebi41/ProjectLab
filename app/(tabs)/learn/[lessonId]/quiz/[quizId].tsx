import { useLocalSearchParams } from 'expo-router';

import { QuizFlowScreen } from '@/features/quiz/QuizFlowScreen';

export default function QuizScreen() {
  const { lessonId, quizId } = useLocalSearchParams<{
    lessonId?: string | string[];
    quizId?: string | string[];
  }>();

  return (
    <QuizFlowScreen
      lessonId={Array.isArray(lessonId) ? lessonId[0] : lessonId}
      quizId={Array.isArray(quizId) ? quizId[0] : quizId}
    />
  );
}
