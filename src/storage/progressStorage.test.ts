import { quizzesById } from '@/data/quizzes';
import { PROGRESS_SCHEMA_VERSION } from '@/types';

import {
  migrateProgressState,
  PROGRESS_STORAGE_KEY,
  PROGRESS_STORAGE_VERSION,
} from './progressStorage';

describe('progress storage migration', () => {
  it('V1.1 veri schema surumunu storage anahtarindan ayri olarak tanimlar', () => {
    expect(PROGRESS_SCHEMA_VERSION).toBe(2);
    expect(PROGRESS_STORAGE_KEY).toBe('@projectlab/progress');
    expect(PROGRESS_STORAGE_VERSION).toBe(2);
  });

  it('v1 tamamlanmış quizde totalXp değerini ve yalnız kullanıcı metadata alanlarını korur', () => {
    const quiz = quizzesById['design-tokens-quiz'];
    const state = {
      totalXp: 137,
      projects: [{
        projectId: 'nova',
        lastVisitedAt: '2026-09-26T00:00:00.000Z',
        completedStageIds: ['development'],
        activeStageId: 'release',
      }],
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
