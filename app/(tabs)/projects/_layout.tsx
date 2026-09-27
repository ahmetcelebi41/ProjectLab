import { Stack } from 'expo-router';
import { stackScreenOptions } from '@/components/shared/stackOptions';

export default function ProjectsLayout() {
  return <Stack screenOptions={stackScreenOptions}>
    <Stack.Screen name="index" options={{ title: 'Projeler' }} />
    <Stack.Screen name="[projectId]" options={{ headerShown: false }} />
  </Stack>;
}
