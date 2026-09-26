import { Stack } from 'expo-router';

export default function PortfolioLayout() {
  return <Stack screenOptions={{ headerShown: false }}>
    <Stack.Screen name="index" />
    <Stack.Screen name="projects/index" />
    <Stack.Screen name="projects/[projectId]" />
    <Stack.Screen name="about" />
  </Stack>;
}
