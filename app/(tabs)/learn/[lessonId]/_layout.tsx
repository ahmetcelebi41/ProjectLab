import { Stack } from 'expo-router';
import { stackScreenOptions } from '@/components/shared/stackOptions';

export default function LessonLayout() {
  return <Stack screenOptions={stackScreenOptions} />;
}
