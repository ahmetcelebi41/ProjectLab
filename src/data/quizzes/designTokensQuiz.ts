import type { Quiz } from '@/types';

export const designTokensQuiz = {
  id: 'design-tokens-quiz',
  projectId: 'elora',
  lessonId: 'design-tokens',
  title: 'Design Token Kontrolü',
  summary: 'ELORA tasarım sistemi üzerinden temel token kararlarını pekiştir.',
  completionXp: 10,
  questions: [
    {
      id: 'token-purpose',
      type: 'single-choice',
      prompt: 'Design token’ın temel amacı nedir?',
      options: [
        { id: 'centralize', label: 'Görsel kararları anlamlı isimlerle merkezileştirmek' },
        { id: 'unique-colors', label: 'Her bileşene farklı renk vermek' },
        { id: 'animation-only', label: 'Yalnız animasyon sürelerini belirlemek' },
      ],
      correctOptionId: 'centralize',
      explanation: 'Token’lar ortak görsel kararları tek ve anlamlı bir kaynakta toplar.',
    },
    {
      id: 'semantic-name',
      type: 'true-false',
      prompt: '“surfacePrimary” gibi anlamsal bir ad, değerin kullanım amacını anlatır.',
      options: [
        { id: 'true', label: 'Doğru' },
        { id: 'false', label: 'Yanlış' },
      ],
      correctOptionId: 'true',
      explanation: 'Anlamsal adlar ham değerden çok token’ın arayüzdeki rolünü açıklar.',
    },
    {
      id: 'safe-change',
      type: 'single-choice',
      prompt: 'Ortak yüzey rengi değiştiğinde en güvenli yaklaşım hangisidir?',
      options: [
        { id: 'search-screens', label: 'Tüm ekranlarda renk kodunu tek tek değiştirmek' },
        { id: 'update-token', label: 'Merkezi token değerini güncellemek' },
        { id: 'new-constant', label: 'Her ekrana yeni bir sabit eklemek' },
      ],
      correctOptionId: 'update-token',
      explanation: 'Tek kaynak, değişikliğin kontrollü ve tutarlı biçimde yayılmasını sağlar.',
    },
  ],
} as const satisfies Quiz;

