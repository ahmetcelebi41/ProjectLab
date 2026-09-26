import { RouteScreen } from '@/components/navigation/RouteScreen';

export default function LearnScreen() {
  return <RouteScreen title="Öğren" description="Gerçek projelerden üretilen öğrenme kartları ve mini quizler." links={[{ label: 'Design Token konusu', href: '/learn/design-tokens' }]} />;
}
