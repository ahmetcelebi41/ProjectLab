import { Stack } from 'expo-router';
import { stackScreenOptions } from '@/components/shared/stackOptions';

export default function LearnLayout() {
  return <Stack screenOptions={stackScreenOptions}>
    <Stack.Screen name="index" options={{ title: 'Öğren' }} />
    <Stack.Screen name="[lessonId]" options={{ headerShown: false }} />
  </Stack>;
}
