import type { Achievement, AchievementId } from '@/types';

export const achievements = [
  {
    id: 'first-project',
    title: 'İlk Keşif',
    description: 'İlk projeyi ziyaret et.',
    rule: { type: 'visited-projects', count: 1 },
  },
  {
    id: 'project-explorer',
    title: 'Proje Gezgini',
    description: 'Üç farklı projeyi ziyaret et.',
    rule: { type: 'visited-projects', count: 3 },
  },
  {
    id: 'first-lesson',
    title: 'İlk Ders',
    description: 'İlk öğrenme içeriğini tamamla.',
    rule: { type: 'completed-lessons', count: 1 },
  },
  {
    id: 'lesson-collector',
    title: 'Öğrenme Serisi',
    description: 'Üç öğrenme içeriğini tamamla.',
    rule: { type: 'completed-lessons', count: 3 },
  },
  {
    id: 'first-quiz',
    title: 'Bilgini Sına',
    description: 'İlk quizini tamamla.',
    rule: { type: 'completed-quizzes', count: 1 },
  },
  {
    id: 'perfect-quiz',
    title: 'Kusursuz Sonuç',
    description: 'Bir quizde tüm soruları doğru yanıtla.',
    rule: { type: 'perfect-quizzes', count: 1 },
  },
] as const satisfies readonly Achievement[];

export const achievementsById = {
  'first-project': achievements[0],
  'project-explorer': achievements[1],
  'first-lesson': achievements[2],
  'lesson-collector': achievements[3],
  'first-quiz': achievements[4],
  'perfect-quiz': achievements[5],
} as const satisfies Readonly<Record<AchievementId, Achievement>>;

export function getAchievementById(id: string): Achievement | undefined {
  return achievements.find((achievement) => achievement.id === id);
}
