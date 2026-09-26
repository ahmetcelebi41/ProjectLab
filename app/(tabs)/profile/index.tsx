import { RouteScreen } from '@/components/navigation/RouteScreen';

export default function ProfileScreen() {
  return <RouteScreen title="Profil" description="Profil özeti, toplam XP ve kişisel kullanım verilerinin merkezi." links={[
    { label: 'İlerlemem', href: '/profile/progress' },
    { label: 'Başarımlar', href: '/profile/achievements' },
    { label: 'Ayarlar', href: '/profile/settings' },
  ]} />;
}
