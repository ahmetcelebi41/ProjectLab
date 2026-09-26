import { Stack } from 'expo-router';
import { stackScreenOptions } from '@/components/shared/stackOptions';

export default function HomeLayout() {
  return <Stack screenOptions={stackScreenOptions} />;
}
