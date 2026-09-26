import { RouteScreen } from '@/components/navigation/RouteScreen';

export default function PortfolioHomeScreen() {
  return <RouteScreen eyebrow="Portföy Modu" title="Merhaba" description="Kısa tanıtım, öne çıkan projeler ve yetkinliklerin profesyonel sunumu." links={[
    { label: 'Tüm projeler', href: '/portfolio/projects' },
    { label: 'Hakkımda', href: '/portfolio/about' },
    { label: 'Kişisel Moda dön', href: '/home' },
  ]} />;
}
