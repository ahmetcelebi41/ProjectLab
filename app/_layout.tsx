import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { stackScreenOptions } from '@/components/shared/stackOptions';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={stackScreenOptions}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="portfolio" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" options={{ title: 'Sayfa bulunamadı' }} />
      </Stack>
    </>
  );
}
