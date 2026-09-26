import { RouteScreen } from '@/components/navigation/RouteScreen';

export default function NotFoundScreen() {
  return <RouteScreen eyebrow="404" title="Bu sayfa bulunamadı" description="Bağlantı geçersiz veya içerik artık burada değil." links={[{ label: 'Ana sayfaya dön', href: '/home' }]} />;
}
