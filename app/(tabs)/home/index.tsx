import { RouteScreen } from '@/components/navigation/RouteScreen';

export default function HomeScreen() {
  return <RouteScreen eyebrow="Kişisel Mod" title="Ana Sayfa" description="Devam Et, öne çıkan proje, öğrenme önerileri ve ilerleme özeti burada birleşir." links={[
    { label: 'NOVA projesini aç', href: '/projects/nova' },
    { label: 'Öğrenmeye devam et', href: '/learn/design-tokens' },
    { label: 'Portföy Moduna geç', href: '/portfolio' },
  ]} />;
}
