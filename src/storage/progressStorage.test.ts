import { quizzesById } from '@/data/quizzes';
import type { PersistedProgressState } from './progressStorage';

import { migrateProgressState } from './progressStorage';

describe('progress storage migration', () => {
  it('v1 tamamlanmış quizde totalXp değerini ve yalnız kullanıcı metadata alanlarını korur', () => {
    const quiz = quizzesById['design-tokens-quiz'];
    const state: PersistedProgressState = {
      totalXp: 137,
      projects: [{
        projectId: 'nova',
        lastVisitedAt: '2026-09-26T00:00:00.000Z',
        completedStageIds: ['development'],
        activeStageId: 'release',
      } as PersistedProgressState['projects'][number]],
      lessons: [],
      quizzes: [{
        quizId: quiz.id,
        currentQuestionIndex: quiz.questions.length - 1,
        answers: [],
        bestCorrectAnswerCount: quiz.questions.length,
        completedAt: '2026-09-26T00:00:00.000Z',
      }],
      earnedAchievementIds: [],
    };

    const migrated = migrateProgressState(state, 1);
    expect(migrated.totalXp).toBe(state.totalXp);
    expect(migrated.quizzes[0].awardedXp).toBe(quiz.completionXp);
    expect(migrated.projects).toEqual([{
      projectId: 'nova',
      lastVisitedAt: '2026-09-26T00:00:00.000Z',
    }]);

    const migratedAgain = migrateProgressState(migrated, 1);
    expect(migratedAgain.totalXp).toBe(state.totalXp);
    expect(migratedAgain.quizzes[0].awardedXp).toBe(quiz.completionXp);
  });
});
