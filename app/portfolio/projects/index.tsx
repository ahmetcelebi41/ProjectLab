import { RouteScreen } from '@/components/navigation/RouteScreen';

export default function PortfolioProjectsScreen() {
  return <RouteScreen title="Portföy Projeleri" description="Kişisel ilerleme verilerinden ayrılmış proje sunumları." links={[
    { label: 'ELORA', href: '/portfolio/projects/elora' },
    { label: 'NOVA', href: '/portfolio/projects/nova' },
    { label: 'Moonphase', href: '/portfolio/projects/moonphase' },
  ]} />;
}
