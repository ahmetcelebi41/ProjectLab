import type { Lesson } from '@/types';

export const apiContractsLesson = {
  id: 'api-contracts',
  projectIds: ['nova'],
  title: 'API Contract Tasarlamak',
  summary: 'İstemci ve servis arasındaki veri sınırını açık ve değişime dayanıklı kur.',
  objective: 'Bir API contract’ının sorumluluğunu ve güvenli değişiklik ilkelerini öğrenmek.',
  category: 'backend-api',
  tags: ['API', 'TypeScript', 'Cloudflare Workers'],
  durationMinutes: 5,
  completionXp: 20,
  content: [
    { id: 'concept-title', type: 'heading', text: 'Kavram' },
    {
      id: 'concept',
      type: 'paragraph',
      text: 'API contract, istemcinin göndereceği ve servisin döndüreceği verinin açık biçimini tanımlar.',
    },
    { id: 'importance-title', type: 'heading', text: 'Neden önemli?' },
    {
      id: 'importance',
      type: 'paragraph',
      text: 'Açık bir contract, istemci ve servis katmanlarının aynı veri beklentisinde buluşmasını sağlar.',
    },
    { id: 'project-title', type: 'heading', text: 'NOVA’da nerede kullandık?' },
    {
      id: 'project-use',
      type: 'paragraph',
      text: 'NOVA dashboard’u sipariş, stok ve müşteri verilerini servis katmanından tanımlı cevap modelleriyle alır.',
    },
    {
      id: 'example',
      type: 'code',
      language: 'ts',
      caption: 'Sipariş özeti contract’ı',
      code: "type OrderSummary = {\n  id: string;\n  total: number;\n  status: 'open' | 'completed';\n};",
    },
    {
      id: 'critical-point',
      type: 'callout',
      emphasis: 'important',
      text: 'İç veritabanı modelini doğrudan dışarı açmak yerine API’nin ihtiyaç duyduğu temsil ayrıca tanımlanmalıdır.',
    },
  ],
  takeaways: [
    'İstemci ve servis aynı veri beklentisini paylaşır.',
    'İç veri modeli ile dış temsil ayrı evrilebilir.',
    'Geriye uyumlu değişiklikler daha kolay planlanır.',
  ],
  quizId: 'api-contracts-quiz',
} as const satisfies Lesson;

