import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { Typography } from '@/components/ui/Typography';
import { useProgressStore } from '@/stores/progressStore';
import { colors, radius, spacing } from '@/theme/tokens';

import { ActivityList } from './ActivityList';

function LoadingActivityHistory() {
  return (
    <Screen
      contentContainerStyle={styles.screen}
      edges={['top', 'bottom']}
      scrollViewProps={{
        accessibilityLabel: 'Aktiviteler yükleniyor',
        accessibilityState: { busy: true },
      }}
    >
      <View style={[styles.skeleton, styles.loadingTitle]} />
      {[1, 2, 3].map((item) => <View key={item} style={[styles.skeleton, styles.loadingRow]} />)}
    </Screen>
  );
}

export function ActivityHistoryScreen() {
  const hasHydrated = useProgressStore((state) => state.hasHydrated);
  const activityHistory = useProgressStore((state) => state.activityHistory);

  if (!hasHydrated) return <LoadingActivityHistory />;

  return (
    <Screen
      contentContainerStyle={styles.screen}
      edges={['top', 'bottom']}
      scrollViewProps={{ contentInsetAdjustmentBehavior: 'automatic' }}
    >
      <View style={styles.header}>
        <Typography color="primary" variant="caption">İLERLEME GEÇMİŞİ</Typography>
        <Typography accessibilityRole="header" variant="h1">Aktiviteler</Typography>
        <Typography color="textSecondary" style={styles.bodyLine} variant="bodyLarge">
          Tamamladığın dersler, quiz denemelerin ve proje ilerlemelerin burada görünür.
        </Typography>
      </View>
      <ActivityList
        emptyMessage="İlk dersini veya quizini tamamladığında ya da bir projede ilerlediğinde kayıtların burada görünecek."
        events={activityHistory}
        grouped
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { gap: spacing.xxl },
  header: { gap: spacing.xs },
  bodyLine: { lineHeight: spacing.lg },
  skeleton: { backgroundColor: colors.surfaceRaised, borderRadius: radius.md },
  loadingTitle: { height: spacing.xxxxl, width: '60%' },
  loadingRow: { height: 112, width: '100%' },
});
