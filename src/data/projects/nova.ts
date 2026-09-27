import type { Project } from '@/types';

export const novaProject = {
  id: 'nova',
  title: 'NOVA',
  type: 'dashboard',
  status: 'completed',
  summary: 'Sipariş, stok ve müşteri operasyonlarını ortak panelde yöneten full-stack ürün.',
  purpose: 'Dağınık operasyon verilerini anlaşılır bir yönetim deneyiminde bir araya getirmek.',
  technologies: ['TypeScript', 'React', 'Cloudflare Workers', 'D1'],
  featured: true,
  portfolioVisible: true,
  updatedAt: '2026-09-24',
  currentStageId: 'development',
  stages: [
    {
      id: 'planning',
      order: 1,
      title: 'Ürün Planlama',
      summary: 'Sipariş, stok ve müşteri yönetimi için temel kullanım akışları çıkarıldı.',
      status: 'completed',
    },
    {
      id: 'architecture',
      order: 2,
      title: 'Teknik Mimari',
      summary: 'İstemci, API ve veri katmanı arasındaki sınırlar tanımlandı.',
      status: 'completed',
      decision: 'İstemci ile servis arasındaki veri şekilleri açık contract’larla ayrıldı.',
      lessonIds: ['api-contracts'],
    },
    {
      id: 'development',
      order: 3,
      title: 'Modül Geliştirme',
      summary: 'Dashboard ve temel operasyon modülleri geliştiriliyor.',
      status: 'in-progress',
      problem: 'Farklı operasyonların aynı veri modelini güvenli biçimde paylaşması gerekiyor.',
      solution: 'Modüller ortak API contract’ları üzerinden bağlanıyor.',
    },
    {
      id: 'release',
      order: 4,
      title: 'Test ve Yayın',
      summary: 'Üretim öncesi doğrulama ve yayın aşaması henüz başlamadı.',
      status: 'not-started',
    },
  ],
  lessonIds: ['api-contracts'],
  quizIds: ['api-contracts-quiz'],
  result: {
    summary: 'Aktif geliştirme sürümü temel operasyonları ortak bir panelde yönetebilir durumda.',
    highlights: ['Sipariş yönetimi', 'Stok takibi', 'Müşteri kayıtları', 'API tabanlı mimari'],
  },
} as const satisfies Project;

