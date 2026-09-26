import { useLocalSearchParams } from 'expo-router';
import { RouteScreen } from '@/components/navigation/RouteScreen';

export default function ProjectOverviewScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  return <RouteScreen eyebrow="Genel Bakış" title={projectId.toUpperCase()} description="Projenin amacı, kapsamı, sonucu, durumu ve temel teknolojileri." links={[
    { label: 'Proje yolculuğu', href: `/projects/${projectId}/journey` },
    { label: 'Projeden öğren', href: `/projects/${projectId}/learn` },
    { label: 'Proje quizleri', href: `/projects/${projectId}/quiz` },
  ]} />;
}
