import { Stack } from 'expo-router';
import { stackScreenOptions } from '@/components/navigation/stackOptions';

export default function LessonLayout() {
  return <Stack screenOptions={stackScreenOptions} />;
}
