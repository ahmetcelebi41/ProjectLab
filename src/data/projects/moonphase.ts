import type { Project } from '@/types';

export const moonphaseProject = {
  id: 'moonphase',
  title: 'Moonphase',
  type: 'mobile',
  status: 'in-progress',
  summary: 'Ürün keşfini kategori yapısı ve güçlü görsel sunumla destekleyen e-ticaret deneyimi.',
  purpose: 'Mobil kullanıcıların ürünleri kolayca keşfedip karşılaştırabileceği anlaşılır bir katalog kurmak.',
  technologies: ['TypeScript', 'React Native', 'E-commerce', 'Product Design'],
  learnings: [
    'Kategoriler kullanıcıların zihinsel modelini izler.',
    'Ürün özellikleri tutarlı alanlarla tanımlanır.',
    'Filtreleme ihtiyaçları veri modeline erken yansıtılır.',
  ],
  featured: false,
  portfolioVisible: true,
  updatedAt: '2026-09-12',
  currentStageId: 'product-structure',
  stages: [
    {
      id: 'discovery',
      order: 1,
      title: 'Ürün Keşfi',
      summary: 'Katalog kapsamı ve mobil ürün keşfi ihtiyaçları incelendi.',
      status: 'completed',
    },
    {
      id: 'product-structure',
      order: 2,
      title: 'Ürün ve Kategori Yapısı',
      summary: 'Kategori hiyerarşisi ve ortak ürün özellikleri planlanıyor.',
      status: 'in-progress',
      decision: 'Kategori adlarında iç terminoloji yerine kullanıcı dili esas alındı.',
      lessonIds: ['product-taxonomy'],
    },
    {
      id: 'design',
      order: 3,
      title: 'Görsel Deneyim',
      summary: 'Ürün listeleme ve detay ekranlarının tasarım aşaması henüz başlamadı.',
      status: 'not-started',
    },
    {
      id: 'development',
      order: 4,
      title: 'Mobil Geliştirme',
      summary: 'Uygulama geliştirme aşaması henüz başlamadı.',
      status: 'not-started',
    },
  ],
  lessonIds: ['product-taxonomy'],
  quizIds: ['product-taxonomy-quiz'],
  result: {
    summary: 'Planlanan ürün için sürdürülebilir katalog ve mobil keşif temeli oluşturuluyor.',
    highlights: ['Ürün kataloğu', 'Kategori gezinimi', 'Görsel ürün keşfi'],
  },
} as const satisfies Project;
