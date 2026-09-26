import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import type { ScrollViewProps, StyleProp, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Edge } from 'react-native-safe-area-context';

import { breakpoints, colors, layout, spacing } from '@/theme/tokens';

export type ScreenProps = {
  children: ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
  edges?: Edge[];
  scroll?: boolean;
  scrollViewProps?: Omit<ScrollViewProps, 'children' | 'contentContainerStyle'>;
};

export function Screen({
  children,
  contentContainerStyle,
  edges = ['bottom'],
  scroll = true,
  scrollViewProps,
}: ScreenProps) {
  const { width } = useWindowDimensions();
  const horizontalPadding = width >= breakpoints.medium
    ? layout.horizontalPadding.wide.min
    : layout.horizontalPadding.mobile;
  const contentStyle = [styles.content, { paddingHorizontal: horizontalPadding }, contentContainerStyle];

  return (
    <SafeAreaView edges={edges} style={styles.safeArea}>
      {scroll ? (
        <ScrollView {...scrollViewProps} contentContainerStyle={styles.scrollContent}>
          <View style={contentStyle}>{children}</View>
        </ScrollView>
      ) : (
        <View style={contentStyle}>{children}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.background,
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    alignSelf: 'center',
    flex: 1,
    maxWidth: layout.contentMaxWidth,
    paddingVertical: spacing.xl,
    width: '100%',
  },
});
