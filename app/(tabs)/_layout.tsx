import { Tabs } from 'expo-router';

import { colors } from '@/theme/tokens';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: false,
      sceneStyle: { backgroundColor: colors.background },
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.textMuted,
      tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
    }}>
      <Tabs.Screen name="home" options={{ title: 'Ana Sayfa' }} />
      <Tabs.Screen name="projects" options={{ title: 'Projeler' }} />
      <Tabs.Screen name="learn" options={{ title: 'Öğren' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profil' }} />
    </Tabs>
  );
}
