import Constants from 'expo-constants';
import { StyleSheet, View } from 'react-native';

import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { Typography } from '@/components/ui/Typography';
import { spacing } from '@/theme/tokens';

function SettingRow({ description, label, value }: {
  description: string;
  label: string;
  value: string;
}) {
  return (
    <View accessibilityLabel={`${label}: ${value}. ${description}`} style={styles.settingRow}>
      <View style={styles.settingCopy}>
        <Typography variant="h4">{label}</Typography>
        <Typography color="textSecondary" style={styles.bodyLine}>{description}</Typography>
      </View>
      <Badge variant="neutral">{value}</Badge>
    </View>
  );
}

export function SettingsScreen() {
  const version = Constants.expoConfig?.version ?? '1.0.0';

  return (
    <Screen
      contentContainerStyle={styles.screen}
      edges={['bottom']}
      scrollViewProps={{ contentInsetAdjustmentBehavior: 'automatic' }}
    >
      <View style={styles.heading}>
        <Typography color="primary" variant="caption">UYGULAMA TERCİHLERİ</Typography>
        <Typography accessibilityRole="header" variant="h1">Ayarlar</Typography>
        <Typography color="textSecondary" style={styles.bodyLine} variant="bodyLarge">
          ProjectLab’in mevcut görünümünü, veri saklama biçimini ve sürüm bilgisini incele.
        </Typography>
      </View>

      <Card style={styles.settingsCard}>
        <Typography accessibilityRole="header" variant="h3">Görünüm</Typography>
        <SettingRow
          description="ProjectLab V1, tasarım sistemiyle tanımlanan koyu temayı kullanır."
          label="Tema"
          value="Koyu"
        />
      </Card>

      <Card style={styles.settingsCard}>
        <Typography accessibilityRole="header" variant="h3">Gizlilik ve veri</Typography>
        <SettingRow
          description="Proje, ders, quiz, XP ve başarım ilerlemesi cihazdaki kalıcı depolamada tutulur."
          label="İlerleme verisi"
          value="Bu cihazda"
        />
      </Card>

      <Card style={styles.settingsCard}>
        <Typography accessibilityRole="header" variant="h3">Uygulama bilgileri</Typography>
        <SettingRow
          description="Gerçek projeler üzerinden öğrenme ve ilerleme deneyimi."
          label="ProjectLab"
          value={`Sürüm ${version}`}
        />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    gap: spacing.xxl,
  },
  heading: {
    gap: spacing.xs,
  },
  bodyLine: {
    lineHeight: spacing.lg,
  },
  settingsCard: {
    gap: spacing.lg,
  },
  settingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  settingCopy: {
    flex: 1,
    gap: spacing.xs,
  },
});
