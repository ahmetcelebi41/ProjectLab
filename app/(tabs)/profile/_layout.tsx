import { Stack } from 'expo-router';
import { stackScreenOptions } from '@/components/navigation/stackOptions';

export default function ProfileLayout() {
  return <Stack screenOptions={stackScreenOptions}>
    <Stack.Screen name="index" options={{ title: 'Profil' }} />
    <Stack.Screen name="progress" options={{ title: 'İlerlemem' }} />
    <Stack.Screen name="achievements" options={{ title: 'Başarımlar' }} />
    <Stack.Screen name="settings" options={{ title: 'Ayarlar' }} />
  </Stack>;
}
