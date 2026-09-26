import { Stack } from 'expo-router';
import { stackScreenOptions } from '@/components/shared/stackOptions';

export default function LessonLayout() {
  return <Stack screenOptions={stackScreenOptions}>
    <Stack.Screen name="index" options={{ title: 'Konu' }} />
    <Stack.Screen name="quiz/[quizId]" options={{ title: 'Quiz' }} />
    <Stack.Screen name="quiz/[quizId]/result" options={{ title: 'Quiz Sonucu' }} />
  </Stack>;
}
