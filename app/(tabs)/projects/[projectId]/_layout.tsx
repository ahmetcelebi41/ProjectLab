import { Stack } from 'expo-router';
import { stackScreenOptions } from '@/components/navigation/stackOptions';

export default function ProjectDetailLayout() {
  return <Stack screenOptions={stackScreenOptions}>
    <Stack.Screen name="index" options={{ title: 'Genel Bakış' }} />
    <Stack.Screen name="journey" options={{ title: 'Yolculuk' }} />
    <Stack.Screen name="learn" options={{ title: 'Öğren' }} />
    <Stack.Screen name="quiz" options={{ title: 'Quiz' }} />
  </Stack>;
}
