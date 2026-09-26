import { RouteScreen } from '@/components/shared/RouteScreen';

export default function ProjectsScreen() {
  return <RouteScreen title="Projeler" description="Tüm projeler aynı dinamik route ve ortak ekran altyapısını kullanır." links={[
    { label: 'ELORA', href: '/projects/elora' },
    { label: 'NOVA', href: '/projects/nova' },
    { label: 'Moonphase', href: '/projects/moonphase' },
  ]} />;
}
