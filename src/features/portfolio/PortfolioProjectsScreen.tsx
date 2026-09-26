import { StyleSheet, useWindowDimensions, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { Typography } from '@/components/ui/Typography';
import { projects } from '@/data/projects';
import { spacing } from '@/theme/tokens';

import { getPortfolioGrid, PortfolioProjectCard, PortfolioSectionHeading } from './PortfolioComponents';
import { PortfolioShell } from './PortfolioShell';

const visibleProjects = projects.filter((project) => project.portfolioVisible);

export function PortfolioProjectsScreen() {
  const { width } = useWindowDimensions();
  const { itemWidth } = getPortfolioGrid(width, visibleProjects.length);

  return (
    <PortfolioShell activeRoute="projects">
      <PortfolioSectionHeading
        description="ELORA, NOVA ve Moonphase çalışmalarının problem, süreç, çözüm ve sonuç odaklı sunumları."
        eyebrow="Portföy"
        title="Projeler"
      />
      {visibleProjects.length > 0 ? (
        <View style={styles.grid}>
          {visibleProjects.map((project) => (
            <PortfolioProjectCard key={project.id} project={project} width={itemWidth} />
          ))}
        </View>
      ) : (
        <Card style={styles.emptyState}>
          <Typography accessibilityRole="header" variant="h4">Henüz yayınlanmış proje yok</Typography>
          <Typography color="textSecondary">Portföyde gösterilecek projeler burada yer alacak.</Typography>
        </Card>
      )}
    </PortfolioShell>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  emptyState: { gap: spacing.sm, padding: spacing.xl },
});
