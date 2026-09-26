import { Stack } from 'expo-router';
import { stackScreenOptions } from '@/components/navigation/stackOptions';

export default function HomeLayout() {
  return <Stack screenOptions={stackScreenOptions} />;
}
