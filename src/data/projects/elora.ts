import type { Project } from '@/types';

export const eloraProject = {
  id: 'elora',
  title: 'ELORA',
  type: 'web',
  status: 'completed',
  summary: 'Kurumsal anlatımı ve rezervasyon akışını ortak bir web deneyiminde buluşturan proje.',
  purpose: 'Markayı güven veren bir arayüzle sunmak ve rezervasyon yolculuğunu sadeleştirmek.',
  technologies: ['TypeScript', 'React', 'Design System', 'Responsive UI'],
  learnings: [
    'Tekrarlanan tasarım kararları merkezileşir.',
    'Bileşenler ortak bir görsel sözlük kullanır.',
    'Tema ve ölçek değişiklikleri daha kontrollü yapılır.',
  ],
  featured: true,
  portfolioVisible: true,
  updatedAt: '2026-09-18',
  currentStageId: 'release',
  stages: [
    {
      id: 'discovery',
      order: 1,
      title: 'Keşif ve Planlama',
      summary: 'Kurumsal içerik, kullanıcı ihtiyaçları ve rezervasyon adımları netleştirildi.',
      status: 'completed',
      learning: 'İçerik hiyerarşisi, dönüşüm akışından ayrı düşünülmemelidir.',
    },
    {
      id: 'design-system',
      order: 2,
      title: 'UI/UX ve Tasarım Sistemi',
      summary: 'Tekrarlanabilir görsel kararlar ve temel arayüz bileşenleri tanımlandı.',
      status: 'completed',
      decision: 'Renk, boşluk ve tipografi kararları design token yapısında merkezileştirildi.',
      lessonIds: ['design-tokens'],
    },
    {
      id: 'development',
      order: 3,
      title: 'Responsive Geliştirme',
      summary: 'Kurumsal sayfalar ve rezervasyon akışı farklı ekran boyutları için geliştirildi.',
      status: 'completed',
      solution: 'Ortak bileşenler ve mobile-first yerleşim kullanıldı.',
    },
    {
      id: 'release',
      order: 4,
      title: 'Test ve Yayın',
      summary: 'Akış kontrolleri tamamlandı ve yayın süreci sonuçlandırıldı.',
      status: 'completed',
    },
  ],
  lessonIds: ['design-tokens'],
  quizIds: ['design-tokens-quiz'],
  result: {
    summary: 'Kurumsal içerik, tutarlı görsel dil ve rezervasyon akışı tek deneyimde birleştirildi.',
    highlights: ['Responsive kurumsal sayfalar', 'Rezervasyon akışı', 'Ortak tasarım sistemi'],
  },
} as const satisfies Project;

