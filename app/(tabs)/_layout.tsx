import { Ionicons } from '@expo/vector-icons';
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
      <Tabs.Screen name="home" options={{
        title: 'Ana Sayfa',
        tabBarIcon: ({ color, focused, size }) => (
          <Ionicons color={color} name={focused ? 'home' : 'home-outline'} size={size} />
        ),
      }} />
      <Tabs.Screen name="projects" options={{
        title: 'Projeler',
        tabBarIcon: ({ color, focused, size }) => (
          <Ionicons color={color} name={focused ? 'folder' : 'folder-outline'} size={size} />
        ),
      }} />
      <Tabs.Screen name="learn" options={{
        title: 'Öğren',
        tabBarIcon: ({ color, focused, size }) => (
          <Ionicons color={color} name={focused ? 'school' : 'school-outline'} size={size} />
        ),
      }} />
      <Tabs.Screen name="profile" options={{
        title: 'Profil',
        tabBarIcon: ({ color, focused, size }) => (
          <Ionicons color={color} name={focused ? 'person' : 'person-outline'} size={size} />
        ),
      }} />
    </Tabs>
  );
}
