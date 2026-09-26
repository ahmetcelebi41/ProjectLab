import { Stack } from 'expo-router';
import { stackScreenOptions } from '@/components/navigation/stackOptions';

export default function ProjectsLayout() {
  return <Stack screenOptions={stackScreenOptions}>
    <Stack.Screen name="index" options={{ title: 'Projeler' }} />
    <Stack.Screen name="[projectId]" options={{ title: 'Proje' }} />
  </Stack>;
}
