import { achievements, quizzes } from '@/data';
import type { Progress } from '@/types';

import { evaluateAchievements } from './evaluateAchievements';

const baseProgress: Progress = {
  totalXp: 0,
  projects: [],
  lessons: [],
  quizzes: [],
  earnedAchievementIds: [],
};

describe('evaluateAchievements', () => {
  it('kosul saglandiginda dogru achievementi acar', () => {
    const progress: Progress = {
      ...baseProgress,
      lessons: [{ lessonId: 'design-tokens', completedAt: '2026-09-26T00:00:00.000Z' }],
    };

    expect(evaluateAchievements(progress, achievements, quizzes)).toContain('first-lesson');
  });

  it('daha once kazanilmis achievementi tekrar uretmez', () => {
    const progress: Progress = {
      ...baseProgress,
      lessons: [{ lessonId: 'design-tokens', completedAt: '2026-09-26T00:00:00.000Z' }],
      earnedAchievementIds: ['first-lesson'],
    };

    expect(evaluateAchievements(progress, achievements, quizzes)).not.toContain('first-lesson');
  });
});
