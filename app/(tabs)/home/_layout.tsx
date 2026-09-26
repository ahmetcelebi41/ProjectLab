import { Stack } from 'expo-router';
import { stackScreenOptions } from '@/components/shared/stackOptions';

export default function HomeLayout() {
  return (
    <Stack screenOptions={stackScreenOptions}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}
