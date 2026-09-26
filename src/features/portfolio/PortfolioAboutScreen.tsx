import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { Typography } from '@/components/ui/Typography';
import { projects } from '@/data/projects';
import { colors, layout, radius, spacing } from '@/theme/tokens';

import { PortfolioSectionHeading } from './PortfolioComponents';
import { PortfolioShell } from './PortfolioShell';

const visibleProjects = projects.filter((project) => project.portfolioVisible);
const technologies = [...new Set(visibleProjects.flatMap((project) => project.technologies))];

export function PortfolioAboutScreen() {
  return (
    <PortfolioShell activeRoute="about">
      <PortfolioSectionHeading
        description="Gerçek projeler üzerinden ürün, tasarım ve geliştirme kararlarını bir araya getiren kısa profil."
        eyebrow="Profil"
        title="Hakkımda"
      />

      <Card raised style={styles.profileCard}>
        <View aria-hidden style={styles.monogram}>
          <Typography color="onPrimary" variant="h2">PL</Typography>
        </View>
        <View style={styles.profileCopy}>
          <Typography accessibilityRole="header" variant="h2">ProjectLab Geliştiricisi</Typography>
          <Typography color="textSecondary" style={styles.lead} variant="bodyLarge">
            Gerçek projeler üzerinden öğreniyor, üretiyor ve ürün geliştirme sürecini görünür kılıyor.
          </Typography>
        </View>
      </Card>

      <View style={styles.section}>
        <PortfolioSectionHeading eyebrow="Süreç" title="Çalışma Yaklaşımı" />
        <View style={styles.twoColumn}>
          <Card style={styles.approachCard}>
            <Typography accessibilityRole="header" variant="h4">Kullanıcı ve ürün odağı</Typography>
            <Typography color="textSecondary" style={styles.bodyLine}>
              İçerik hiyerarşisini, kullanım akışlarını ve kullanıcı dilini ürün kararlarının başlangıç noktası olarak ele alıyorum.
            </Typography>
          </Card>
          <Card style={styles.approachCard}>
            <Typography accessibilityRole="header" variant="h4">Sürdürülebilir teknik yapı</Typography>
            <Typography color="textSecondary" style={styles.bodyLine}>
              Ortak bileşenler, design tokenlar ve açık veri sözleşmeleriyle farklı ekranlarda tutarlı deneyimler kuruyorum.
            </Typography>
          </Card>
        </View>
      </View>

      <View style={styles.section}>
        <PortfolioSectionHeading eyebrow="Teknolojiler" title="Ana Yetkinlikler" />
        <Card style={styles.skillsCard}>
          {technologies.map((technology) => (
            <View key={technology} style={styles.skillItem}>
              <Typography variant="button">{technology}</Typography>
            </View>
          ))}
        </Card>
      </View>

      <View style={styles.section}>
        <PortfolioSectionHeading eyebrow="Bağlantılar" title="İletişim ve Dış Bağlantılar" />
        <Card style={styles.emptyState}>
          <Typography color="textSecondary" style={styles.bodyLine}>
            Henüz iletişim veya dış bağlantı bilgisi eklenmedi. Canlı demo ve kaynak kod bağlantıları mevcut olduğunda proje detaylarında gösterilir.
          </Typography>
        </Card>
      </View>
    </PortfolioShell>
  );
}

const styles = StyleSheet.create({
  profileCard: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xl, padding: spacing.xxl },
  monogram: { alignItems: 'center', backgroundColor: colors.primaryActive, borderRadius: radius.md, height: spacing.max, justifyContent: 'center', width: spacing.max },
  profileCopy: { flex: 1, gap: spacing.sm, minWidth: layout.readingWidth.min / 3 },
  lead: { lineHeight: spacing.xl, maxWidth: layout.readingWidth.max },
  section: { gap: spacing.xl },
  twoColumn: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  approachCard: { flex: 1, gap: spacing.sm, minWidth: layout.readingWidth.min / 3, padding: spacing.lg },
  bodyLine: { lineHeight: spacing.lg },
  skillsCard: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, padding: spacing.xl },
  skillItem: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  emptyState: { maxWidth: layout.readingWidth.max, padding: spacing.xl },
});
