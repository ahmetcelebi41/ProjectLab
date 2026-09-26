import type { Quiz } from '@/types';

export const productTaxonomyQuiz = {
  id: 'product-taxonomy-quiz',
  projectId: 'moonphase',
  lessonId: 'product-taxonomy',
  title: 'Ürün Taksonomisi Kontrolü',
  summary: 'Moonphase katalog kararları üzerinden ürün sınıflandırmasını pekiştir.',
  completionXp: 10,
  questions: [
    {
      id: 'taxonomy-goal',
      type: 'single-choice',
      prompt: 'Ürün taksonomisinin kullanıcıya temel katkısı nedir?',
      options: [
        { id: 'discover', label: 'Ürünleri daha kolay keşfetmek ve karşılaştırmak' },
        { id: 'separate-apps', label: 'Her ürünü ayrı bir uygulamada göstermek' },
        { id: 'remove-categories', label: 'Kategori kullanımını tamamen kaldırmak' },
      ],
      correctOptionId: 'discover',
      explanation: 'Tutarlı sınıflandırma gezinme ve filtreleme deneyimini güçlendirir.',
    },
    {
      id: 'customer-language',
      type: 'true-false',
      prompt: 'Kategori adlarında kullanıcının dili, iç ekip terminolojisinden daha önemlidir.',
      options: [
        { id: 'true', label: 'Doğru' },
        { id: 'false', label: 'Yanlış' },
      ],
      correctOptionId: 'true',
      explanation: 'Kullanıcılar, kendi zihinsel modellerine yakın katalog yapısını daha kolay anlar.',
    },
    {
      id: 'filter-requirement',
      type: 'single-choice',
      prompt: 'Filtrelerin güvenilir çalışması için ne gerekir?',
      options: [
        { id: 'consistent-fields', label: 'Ürün özelliklerini tutarlı alanlarda saklamak' },
        { id: 'free-text', label: 'Tüm özellikleri serbest metin olarak yazmak' },
        { id: 'unique-names', label: 'Her üründe farklı özellik adları kullanmak' },
      ],
      correctOptionId: 'consistent-fields',
      explanation: 'Tutarlı alanlar, ürünlerin aynı ölçütlerle filtrelenebilmesini sağlar.',
    },
  ],
} as const satisfies Quiz;

