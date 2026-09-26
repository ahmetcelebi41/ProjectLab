import type { Quiz } from '@/types';

export const apiContractsQuiz = {
  id: 'api-contracts-quiz',
  projectId: 'nova',
  lessonId: 'api-contracts',
  title: 'API Contract Kontrolü',
  summary: 'NOVA servis sınırları üzerinden contract tasarımını pekiştir.',
  completionXp: 10,
  questions: [
    {
      id: 'contract-role',
      type: 'single-choice',
      prompt: 'API contract neyi tanımlar?',
      options: [
        { id: 'data-shape', label: 'İstemci ile servis arasındaki veri biçimini' },
        { id: 'table-names', label: 'Yalnız veritabanı tablo adlarını' },
        { id: 'color-palette', label: 'Uygulamanın renk paletini' },
      ],
      correctOptionId: 'data-shape',
      explanation: 'Contract, tarafların veri alışverişindeki ortak beklentisini tanımlar.',
    },
    {
      id: 'database-shape',
      type: 'true-false',
      prompt: 'Veritabanı satırı her zaman değişiklik yapılmadan API cevabı olarak dönmelidir.',
      options: [
        { id: 'true', label: 'Doğru' },
        { id: 'false', label: 'Yanlış' },
      ],
      correctOptionId: 'false',
      explanation: 'İç veri modeli ve dış API temsili farklı sorumluluklara sahip olabilir.',
    },
    {
      id: 'compatible-change',
      type: 'single-choice',
      prompt: 'Mevcut istemcileri koruma olasılığı en yüksek değişiklik hangisidir?',
      options: [
        { id: 'remove-required', label: 'Zorunlu bir alanı kaldırmak' },
        { id: 'change-type', label: 'Bir alanın tipini tamamen değiştirmek' },
        { id: 'add-optional', label: 'Yeni ve opsiyonel bir alan eklemek' },
      ],
      correctOptionId: 'add-optional',
      explanation: 'Opsiyonel ek alan, eski istemcilerin mevcut veri beklentisini bozmaz.',
    },
  ],
} as const satisfies Quiz;

