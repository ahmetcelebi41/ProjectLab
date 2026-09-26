import { Stack } from 'expo-router';
import { stackScreenOptions } from '@/components/navigation/stackOptions';

export default function PortfolioLayout() {
  return <Stack screenOptions={stackScreenOptions}>
    <Stack.Screen name="index" options={{ title: 'Portföy' }} />
    <Stack.Screen name="projects/index" options={{ title: 'Projeler' }} />
    <Stack.Screen name="projects/[projectId]" options={{ title: 'Proje' }} />
    <Stack.Screen name="about" options={{ title: 'Hakkımda' }} />
  </Stack>;
}
