import { router } from 'expo-router';
import { Linking, StyleSheet, useWindowDimensions, View } from 'react-native';

import { Badge, type BadgeVariant } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Typography } from '@/components/ui/Typography';
import { getProjectById, projects } from '@/data/projects';
import { border, colors, layout, radius, sizing, spacing } from '@/theme/tokens';
import type { Project, ProjectStageStatus, ProjectType } from '@/types';

import { getPortfolioGrid, PortfolioProjectCard, PortfolioSectionHeading, ProjectVisual } from './PortfolioComponents';
import { PortfolioShell } from './PortfolioShell';

const stageStatusDetails: Record<ProjectStageStatus, { label: string; variant: BadgeVariant }> = {
  'not-started': { label: 'Planlandı', variant: 'neutral' },
  'in-progress': { label: 'Devam Ediyor', variant: 'warning' },
  completed: { label: 'Tamamlandı', variant: 'success' },
};

const typeLabels: Record<ProjectType, string> = {
  web: 'Web Projesi',
  mobile: 'Mobil Uygulama',
  dashboard: 'Yönetim Paneli',
};

function ProjectNotFound({ projectId }: { projectId?: string }) {
  return (
    <PortfolioShell activeRoute="projects">
      <Card accessibilityLiveRegion="polite" style={styles.errorState}>
        <Badge variant="error">Proje bulunamadı</Badge>
        <View style={styles.errorCopy}>
          <Typography accessibilityRole="header" variant="h2">Bu proje portföyde yer almıyor</Typography>
          <Typography color="textSecondary" style={styles.bodyLine}>
            {projectId
              ? `“${projectId}” kimliğine sahip yayınlanmış bir proje bulunamadı.`
              : 'Proje bağlantısında geçerli bir kimlik bulunmuyor.'}
          </Typography>
        </View>
        <Button onPress={() => router.replace('/portfolio/projects')} size="large">
          Projelere Dön
        </Button>
      </Card>
    </PortfolioShell>
  );
}

function ProjectHero({ project }: { project: Project }) {
  const detail = project.status === 'completed' ? 'Tamamlandı' : project.status === 'in-progress' ? 'Geliştiriliyor' : 'Planlandı';
  const variant = project.status === 'completed' ? 'success' : project.status === 'in-progress' ? 'warning' : 'neutral';

  return (
    <View style={styles.hero}>
      <View style={styles.heroCopy}>
        <View style={styles.metaRow}>
          <Badge variant={variant}>{detail}</Badge>
          <Typography color="textMuted" variant="caption">{typeLabels[project.type].toUpperCase()}</Typography>
        </View>
        <Typography accessibilityRole="header" variant="displayCompact">{project.title}</Typography>
        <Typography color="textSecondary" style={styles.lead} variant="bodyLarge">{project.summary}</Typography>
        <View style={styles.technologyRow}>
          {project.technologies.map((technology) => <Badge key={technology}>{technology}</Badge>)}
        </View>
        {project.links ? (
          <View style={styles.actionRow}>
            {project.links.live ? (
              <Button accessibilityRole="link" onPress={() => Linking.openURL(project.links!.live!.url)} size="large">{project.links.live.label}</Button>
            ) : null}
            {project.links.source ? (
              <Button accessibilityRole="link" onPress={() => Linking.openURL(project.links!.source!.url)} size="large" variant="secondary">
                {project.links.source.label}
              </Button>
            ) : null}
          </View>
        ) : null}
      </View>
      <View style={styles.heroVisual}><ProjectVisual project={project} /></View>
    </View>
  );
}

function PurposeSection({ project }: { project: Project }) {
  const problems = project.stages.flatMap((stage) => stage.problem ? [stage.problem] : []);
  return (
    <View style={styles.section}>
      <PortfolioSectionHeading eyebrow="Bağlam" title="Problem / Amaç" />
      <Card style={styles.readingCard}>
        <Typography color="primary" variant="caption">PROJE AMACI</Typography>
        <Typography style={styles.bodyLine} variant="bodyLarge">{project.purpose}</Typography>
        {problems.map((problem) => (
          <View key={problem} style={styles.detailBlock}>
            <Typography color="textMuted" variant="caption">ELE ALINAN PROBLEM</Typography>
            <Typography color="textSecondary" style={styles.bodyLine}>{problem}</Typography>
          </View>
        ))}
      </Card>
    </View>
  );
}

function ContributionSection({ project }: { project: Project }) {
  return (
    <View style={styles.section}>
      <PortfolioSectionHeading
        description="Proje verisinde yer alan ana çalışma alanları ve gerçekleştirilen adımlar."
        eyebrow="Katkı"
        title="Ben Ne Yaptım?"
      />
      <Card style={styles.contributionList}>
        {project.stages.map((stage) => (
          <View key={stage.id} style={styles.contributionItem}>
            <View aria-hidden style={styles.bullet} />
            <View style={styles.contributionCopy}>
              <Typography accessibilityRole="header" variant="h4">{stage.title}</Typography>
              <Typography color="textSecondary" style={styles.bodyLine}>{stage.summary}</Typography>
            </View>
          </View>
        ))}
      </Card>
    </View>
  );
}

function ProcessSection({ project }: { project: Project }) {
  return (
    <View style={styles.section}>
      <PortfolioSectionHeading eyebrow="Süreç" title="Geliştirme Süreci" />
      <View style={styles.timeline}>
        {project.stages.map((stage) => {
          const status = stageStatusDetails[stage.status];
          return (
            <Card key={stage.id} style={styles.timelineCard}>
              <View style={styles.timelineHeader}>
                <Typography accessibilityRole="header" variant="h4">{stage.title}</Typography>
                <Badge variant={status.variant}>{status.label}</Badge>
              </View>
              <Typography color="textSecondary" style={styles.bodyLine}>{stage.summary}</Typography>
              {stage.decision ? <Typography style={styles.bodyLine}>Karar: {stage.decision}</Typography> : null}
              {stage.solution ? <Typography style={styles.bodyLine}>Çözüm: {stage.solution}</Typography> : null}
              {stage.learning ? <Typography style={styles.bodyLine}>Öğrenilen: {stage.learning}</Typography> : null}
            </Card>
          );
        })}
      </View>
    </View>
  );
}

function ResultSection({ project }: { project: Project }) {
  return (
    <View style={styles.section}>
      <PortfolioSectionHeading eyebrow="Çıktı" title="Çözüm ve Sonuç" />
      <Card raised style={styles.resultCard}>
        <Typography style={styles.lead} variant="bodyLarge">{project.result.summary}</Typography>
        <View style={styles.resultGrid}>
          {project.result.highlights.map((highlight) => (
            <View key={highlight} style={styles.resultItem}>
              <View aria-hidden style={styles.resultMark} />
              <Typography>{highlight}</Typography>
            </View>
          ))}
        </View>
      </Card>
    </View>
  );
}

function GallerySection({ project }: { project: Project }) {
  return (
    <View style={styles.section}>
      <PortfolioSectionHeading eyebrow="Görseller" title="Galeri" />
      {project.gallery && project.gallery.length > 0 ? (
        <View style={styles.galleryGrid}>
          {project.gallery.map((image) => (
            <Card accessibilityLabel={image.alt} accessibilityRole="image" key={image.assetId} style={styles.galleryItem}>
              <Typography color="textSecondary">{image.alt}</Typography>
            </Card>
          ))}
        </View>
      ) : (
        <Card style={styles.emptyState}>
          <Typography accessibilityRole="header" variant="h4">Henüz galeri görseli yok</Typography>
          <Typography color="textSecondary">Bu proje için görseller eklendiğinde burada sunulacak.</Typography>
        </Card>
      )}
    </View>
  );
}

export function PortfolioProjectDetailScreen({ projectId }: { projectId?: string }) {
  const { width } = useWindowDimensions();
  const project = projectId ? getProjectById(projectId) : undefined;
  if (!project || !project.portfolioVisible) return <ProjectNotFound projectId={projectId} />;

  const otherProjects = projects.filter((item) => item.portfolioVisible && item.id !== project.id);
  const { itemWidth } = getPortfolioGrid(width, otherProjects.length);

  return (
    <PortfolioShell activeRoute="projects">
      <Button onPress={() => router.push('/portfolio/projects')} style={styles.backButton} variant="ghost">
        ← Projelere Dön
      </Button>
      <ProjectHero project={project} />
      <PurposeSection project={project} />
      <ContributionSection project={project} />
      <ProcessSection project={project} />
      <ResultSection project={project} />
      <GallerySection project={project} />
      <View style={styles.section}>
        <PortfolioSectionHeading eyebrow="Keşfet" title="Diğer Projeler" />
        <View style={styles.otherProjects}>
          {otherProjects.map((item) => (
            <PortfolioProjectCard key={item.id} project={item} width={itemWidth} />
          ))}
        </View>
      </View>
    </PortfolioShell>
  );
}

const styles = StyleSheet.create({
  backButton: { alignSelf: 'flex-start' },
  hero: { alignItems: 'stretch', flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xxl },
  heroCopy: { flex: 1, gap: spacing.lg, justifyContent: 'center', minWidth: spacing.max * 4 },
  heroVisual: { flex: 1, minWidth: spacing.max * 4 },
  metaRow: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  lead: { lineHeight: spacing.xl },
  technologyRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  actionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  section: { gap: spacing.xl },
  readingCard: { gap: spacing.md, maxWidth: layout.readingWidth.max, padding: spacing.xl },
  bodyLine: { lineHeight: spacing.lg },
  detailBlock: { borderTopColor: colors.border, borderTopWidth: border.width, gap: spacing.xs, paddingTop: spacing.md },
  contributionList: { gap: spacing.lg, maxWidth: layout.readingWidth.max, padding: spacing.xl },
  contributionItem: { alignItems: 'flex-start', flexDirection: 'row', gap: spacing.md },
  bullet: { backgroundColor: colors.primary, borderRadius: radius.pill, height: spacing.xs, marginTop: spacing.xs, width: spacing.xs },
  contributionCopy: { flex: 1, gap: spacing.xs },
  timeline: { gap: spacing.md, maxWidth: layout.readingWidth.max },
  timelineCard: { gap: spacing.sm, padding: spacing.lg },
  timelineHeader: { alignItems: 'flex-start', flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, justifyContent: 'space-between' },
  resultCard: { gap: spacing.xl, maxWidth: layout.readingWidth.max, padding: spacing.xl },
  resultGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  resultItem: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm, minHeight: sizing.touchTarget.minHeight },
  resultMark: { backgroundColor: colors.success, borderRadius: radius.pill, height: spacing.xs, width: spacing.xs },
  galleryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  galleryItem: { justifyContent: 'flex-end', minHeight: spacing.max * 3, minWidth: layout.readingWidth.min / 3, padding: spacing.lg },
  emptyState: { gap: spacing.sm, maxWidth: layout.readingWidth.max, padding: spacing.xl },
  otherProjects: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  errorState: { alignItems: 'flex-start', gap: spacing.xl, maxWidth: layout.readingWidth.max, padding: spacing.xl },
  errorCopy: { gap: spacing.sm },
});
