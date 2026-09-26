import type { Lesson } from '@/types';

export const productTaxonomyLesson = {
  id: 'product-taxonomy',
  projectIds: ['moonphase'],
  title: 'Ürün Taksonomisi Kurmak',
  summary: 'Ürünleri kullanıcıların anlayacağı kategori ve özelliklerle düzenle.',
  objective: 'Katalog modelinin ürün keşfi ve filtreleme deneyimine etkisini görmek.',
  category: 'project-planning',
  tags: ['E-commerce', 'Information Architecture', 'Product'],
  durationMinutes: 3,
  completionXp: 20,
  content: [
    { id: 'concept-title', type: 'heading', text: 'Kavram' },
    {
      id: 'concept',
      type: 'paragraph',
      text: 'Ürün taksonomisi, katalogdaki ürünlerin tutarlı kategori ve özellikler altında sınıflandırılmasıdır.',
    },
    { id: 'importance-title', type: 'heading', text: 'Neden önemli?' },
    {
      id: 'importance',
      type: 'paragraph',
      text: 'Anlaşılır sınıflandırma, kullanıcıların ürünleri daha hızlı bulmasını ve benzer seçenekleri karşılaştırmasını sağlar.',
    },
    { id: 'project-title', type: 'heading', text: 'Moonphase’te nerede kullandık?' },
    {
      id: 'project-use',
      type: 'paragraph',
      text: 'Moonphase kategori yapısı, mobil ürün keşfi ve ortak filtre ihtiyaçları birlikte düşünülerek planlanır.',
    },
    {
      id: 'example',
      type: 'list',
      items: ['Kategori adlarını kullanıcı diliyle yaz.', 'Ortak ürün özelliklerini tutarlı alanlarda sakla.', 'Filtreleri gerçek keşif ihtiyaçlarından üret.'],
    },
    {
      id: 'critical-point',
      type: 'callout',
      emphasis: 'info',
      text: 'İç ekip terminolojisi yerine müşterinin anlayacağı adlandırmalar kullanılmalıdır.',
    },
  ],
  takeaways: [
    'Kategoriler kullanıcıların zihinsel modelini izler.',
    'Ürün özellikleri tutarlı alanlarla tanımlanır.',
    'Filtreleme ihtiyaçları veri modeline erken yansıtılır.',
  ],
  quizId: 'product-taxonomy-quiz',
} as const satisfies Lesson;

