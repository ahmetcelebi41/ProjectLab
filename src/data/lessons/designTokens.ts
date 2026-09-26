import type { Lesson } from '@/types';

export const designTokensLesson = {
  id: 'design-tokens',
  projectIds: ['elora'],
  title: 'Design Token ile Tutarlı Arayüz',
  summary: 'Renk, boşluk ve tipografi kararlarını ölçeklenebilir bir sisteme dönüştür.',
  objective: 'Design token kullanımının tekrarları ve görsel tutarsızlığı nasıl azalttığını kavramak.',
  category: 'ui-ux',
  tags: ['Design System', 'UI', 'TypeScript'],
  durationMinutes: 4,
  completionXp: 20,
  content: [
    { id: 'concept-title', type: 'heading', text: 'Kavram' },
    {
      id: 'concept',
      type: 'paragraph',
      text: 'Design token; renk, boşluk ve radius gibi tekrar eden tasarım kararlarının anlamlı isimlerle merkezi olarak tanımlanmasıdır.',
    },
    { id: 'importance-title', type: 'heading', text: 'Neden önemli?' },
    {
      id: 'importance',
      type: 'paragraph',
      text: 'Ortak kararlar tek kaynaktan yönetildiğinde ekranlar arasındaki tutarlılık korunur ve değişiklikler daha güvenli yapılır.',
    },
    { id: 'project-title', type: 'heading', text: 'ELORA’da nerede kullandık?' },
    {
      id: 'project-use',
      type: 'paragraph',
      text: 'ELORA’nın kurumsal sayfaları ve rezervasyon akışı aynı renk, boşluk ve tipografi sözlüğünü paylaşır.',
    },
    {
      id: 'example',
      type: 'code',
      language: 'ts',
      caption: 'Anlamsal token örneği',
      code: "export const tokens = {\n  color: { surface: '#11151A' },\n  spacing: { content: 16 },\n} as const;",
    },
    {
      id: 'critical-point',
      type: 'callout',
      emphasis: 'important',
      text: 'Token adı yalnız görsel değeri değil, değerin arayüzdeki amacını anlatmalıdır.',
    },
  ],
  takeaways: [
    'Tekrarlanan tasarım kararları merkezileşir.',
    'Bileşenler ortak bir görsel sözlük kullanır.',
    'Tema ve ölçek değişiklikleri daha kontrollü yapılır.',
  ],
  quizId: 'design-tokens-quiz',
} as const satisfies Lesson;

