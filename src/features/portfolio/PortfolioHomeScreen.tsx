import { router } from 'expo-router';
import { StyleSheet, useWindowDimensions, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Typography } from '@/components/ui/Typography';
import { projects } from '@/data/projects';
import { breakpoints, layout, spacing } from '@/theme/tokens';

import { getPortfolioGrid, PortfolioProjectCard, PortfolioSectionHeading } from './PortfolioComponents';
import { PortfolioShell } from './PortfolioShell';

const visibleProjects = projects.filter((project) => project.portfolioVisible);
const featuredProjects = visibleProjects.filter((project) => project.featured);
const technologies = [...new Set(visibleProjects.flatMap((project) => project.technologies))];

const workingPrinciples = [
  {
    title: 'Keşif ve planlama',
    description: 'Kullanıcı ihtiyaçlarını, ürün kapsamını ve temel akışları geliştirmeden önce netleştiriyorum.',
  },
  {
    title: 'Sistemli geliştirme',
    description: 'Ortak bileşenler, açık veri sözleşmeleri ve sürdürülebilir yapılarla ilerliyorum.',
  },
  {
    title: 'Test ve sonuç',
    description: 'Deneyimi farklı ekranlarda doğruluyor, kararları çalışan ve anlaşılır bir sonuca bağlıyorum.',
  },
] as const;

export function PortfolioHomeScreen() {
  const { width } = useWindowDimensions();
  const { itemWidth: featuredWidth } = getPortfolioGrid(width, featuredProjects.length);
  const { itemWidth: principleWidth } = getPortfolioGrid(width, workingPrinciples.length);

  return (
    <PortfolioShell activeRoute="home">
      <View style={styles.hero}>
        <View style={styles.heroCopy}>
          <Typography color="primary" variant="caption">PROJECTLAB GELİŞTİRİCİSİ</Typography>
          <Typography accessibilityRole="header" variant={width >= breakpoints.medium ? 'displayExpanded' : 'displayCompact'}>
            Gerçek projelerden çalışan ürün deneyimlerine.
          </Typography>
          <Typography color="textSecondary" style={styles.lead} variant="bodyLarge">
            ELORA, NOVA ve Moonphase üzerinden ürün düşüncesini, teknik kararları ve geliştirme sürecini bir araya getiriyorum.
          </Typography>
          <View style={styles.actionRow}>
            <Button onPress={() => router.push('/portfolio/projects')} size="large">Projeleri İncele</Button>
            <Button onPress={() => router.push('/portfolio/about')} size="large" variant="secondary">Hakkımda</Button>
          </View>
        </View>
        <Card raised style={styles.heroPanel}>
          <Typography color="textMuted" variant="caption">PORTFÖY ODAĞI</Typography>
          <Typography variant="h2">Ürün · Tasarım · Geliştirme</Typography>
          <Typography color="textSecondary" style={styles.bodyLine}>
            Kurumsal web deneyimlerinden yönetim panellerine ve mobil ürün keşfine uzanan gerçek proje çalışmaları.
          </Typography>
        </Card>
      </View>

      <View style={styles.section}>
        <PortfolioSectionHeading
          description="Seçili çalışmaların amacı, süreci ve ortaya çıkan sonuçları."
          eyebrow="Seçili çalışmalar"
          title="Öne Çıkan Projeler"
        />
        <View style={styles.grid}>
          {featuredProjects.map((project) => (
            <PortfolioProjectCard key={project.id} project={project} width={featuredWidth} />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <PortfolioSectionHeading
          description="Projelerde tekrar eden yaklaşım; ihtiyaçları anlamak, yapıyı kurmak ve sonucu doğrulamak."
          eyebrow="Yaklaşım"
          title="Nasıl Çalışıyorum"
        />
        <View style={styles.grid}>
          {workingPrinciples.map((principle) => (
            <Card key={principle.title} style={[styles.principleCard, { width: principleWidth }]}>
              <Typography accessibilityRole="header" variant="h4">{principle.title}</Typography>
              <Typography color="textSecondary" style={styles.bodyLine}>{principle.description}</Typography>
            </Card>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <PortfolioSectionHeading
          description="Portföydeki projelerde kullanılan temel teknoloji ve çalışma alanları."
          eyebrow="Araçlar ve alanlar"
          title="Yetkinlikler"
        />
        <Card style={styles.skillsCard}>
          {technologies.map((technology) => (
            <View key={technology} style={styles.skillItem}>
              <Typography variant="button">{technology}</Typography>
            </View>
          ))}
        </Card>
      </View>

      <View style={styles.section}>
        <PortfolioSectionHeading eyebrow="Kısa profil" title="Hakkımda" />
        <Card raised style={styles.aboutCard}>
          <View style={styles.aboutCopy}>
            <Typography variant="h3">ProjectLab Geliştiricisi</Typography>
            <Typography color="textSecondary" style={styles.bodyLine} variant="bodyLarge">
              Gerçek projeler üzerinden öğreniyor, üretiyor ve ürün geliştirme sürecini görünür kılıyor.
            </Typography>
          </View>
          <Button onPress={() => router.push('/portfolio/about')} variant="secondary">Profili İncele</Button>
        </Card>
      </View>

      <View style={styles.section}>
        <PortfolioSectionHeading
          description="Canlı demo ve kaynak kod bağlantıları mevcut olduğunda ilgili proje detayında sunulur."
          eyebrow="İletişim ve dış bağlantılar"
          title="Projeler Üzerinden Bağlantı Kur"
        />
        <Button onPress={() => router.push('/portfolio/projects')} size="large" variant="ghost">
          Tüm Projelere Git
        </Button>
      </View>
    </PortfolioShell>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'stretch', flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xxl },
  heroCopy: { flex: 2, gap: spacing.lg, minWidth: spacing.max * 4 },
  lead: { lineHeight: spacing.xl, maxWidth: layout.readingWidth.min },
  actionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  heroPanel: { flex: 1, gap: spacing.md, justifyContent: 'flex-end', minHeight: spacing.max * 4, minWidth: layout.readingWidth.min / 3, padding: spacing.xxl },
  bodyLine: { lineHeight: spacing.lg },
  section: { gap: spacing.xl },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  principleCard: { gap: spacing.sm, minHeight: spacing.max * 2, padding: spacing.lg },
  skillsCard: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, padding: spacing.xl },
  skillItem: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  aboutCard: { alignItems: 'flex-start', flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xl, justifyContent: 'space-between', padding: spacing.xl },
  aboutCopy: { flex: 1, gap: spacing.sm, minWidth: layout.readingWidth.min / 3 },
});
