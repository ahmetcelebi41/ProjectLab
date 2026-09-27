import { lessonsById, projectsById, quizzesById } from '@/data';
import { getCompletedProjectStageIds } from '@/features/progress/projectProgress';
import { getQuizAwardXp } from '@/features/progress/rewards';
import { PROGRESS_SCHEMA_VERSION, type QuizProgress } from '@/types';

import { useProgressStore } from './progressStore';

const completedAt = '2026-09-26T00:00:00.000Z';
const quiz = quizzesById['design-tokens-quiz'];

function quizResult(bestCorrectAnswerCount: number): QuizProgress {
  return {
    quizId: quiz.id,
    currentQuestionIndex: quiz.questions.length - 1,
    answers: [],
    bestCorrectAnswerCount,
    completedAt,
  };
}

describe('progressStore', () => {
  beforeEach(() => {
    useProgressStore.setState({
      schemaVersion: PROGRESS_SCHEMA_VERSION,
      totalXp: 0,
      projects: [],
      lessons: [],
      quizzes: [],
      quizHistory: [],
      lastActivity: null,
      earnedAchievementIds: [],
      hasHydrated: false,
    });
  });

  it('V1.1 schema ve guvenli progress varsayilanlarini saglar', () => {
    useProgressStore.setState({
      quizHistory: [{
        quizId: quiz.id,
        completedAt,
        correctAnswerCount: 2,
        questionCount: 3,
        wrongQuestionIds: ['question-3'],
      }],
      lastActivity: { type: 'quiz', quizId: quiz.id, occurredAt: completedAt },
    });

    useProgressStore.getState().resetProgress();

    const state = useProgressStore.getState();
    expect(state.schemaVersion).toBe(2);
    expect(state.lessons).toEqual([]);
    expect(state.quizHistory).toEqual([]);
    expect(state.lastActivity).toBeNull();
  });

  it('V1.1 alanlarini persisted state kapsaminda tutar', () => {
    const quizHistory = [{
      quizId: quiz.id,
      completedAt,
      correctAnswerCount: 2,
      questionCount: 3,
      wrongQuestionIds: ['question-3'],
    }] as const;
    const lastActivity = { type: 'quiz', quizId: quiz.id, occurredAt: completedAt } as const;
    useProgressStore.setState({ quizHistory, lastActivity });

    const partialize = useProgressStore.persist.getOptions().partialize;
    expect(partialize).toBeDefined();
    if (!partialize) throw new Error('Progress partialize tanimli olmali');

    const persisted = partialize(useProgressStore.getState());
    expect(persisted).toMatchObject({
      schemaVersion: 2,
      lessons: [],
      quizHistory,
      lastActivity,
    });
  });

  it('ders XP sini yalniz ilk tamamlamada ekler', () => {
    const store = useProgressStore.getState();

    store.completeLesson('design-tokens', completedAt);
    store.completeLesson('design-tokens', '2026-09-27T00:00:00.000Z');

    expect(useProgressStore.getState().totalXp).toBe(lessonsById['design-tokens'].completionXp);
  });

  it('quiz XP sini yalniz ilk tamamlamada ekler ve en yuksek skoru korur', () => {
    const store = useProgressStore.getState();

    store.saveQuizResult(quizResult(3));
    store.saveQuizResult(quizResult(1));

    const state = useProgressStore.getState();
    expect(state.totalXp).toBe(getQuizAwardXp(quiz, 3));
    expect(state.quizzes[0].bestCorrectAnswerCount).toBe(3);
    expect(state.quizzes[0].awardedXp).toBe(getQuizAwardXp(quiz, 3));
  });

  it('daha yüksek quiz retry skorunda ek XP üretmez', () => {
    const store = useProgressStore.getState();

    store.saveQuizResult(quizResult(1));
    const firstCompletionXp = useProgressStore.getState().totalXp;
    store.saveQuizResult(quizResult(3));

    const state = useProgressStore.getState();
    expect(firstCompletionXp).toBe(quiz.completionXp);
    expect(state.totalXp).toBe(firstCompletionXp);
    expect(state.quizzes[0].bestCorrectAnswerCount).toBe(3);
    expect(state.quizzes[0].awardedXp).toBe(quiz.completionXp);
  });

  it('proje ziyareti yalnız lastVisitedAt metadata alanını kaydeder', () => {
    const journeyBeforeVisit = getCompletedProjectStageIds(projectsById.nova);
    useProgressStore.getState().updateProjectProgress('nova', {
      lastVisitedAt: completedAt,
    });

    expect(useProgressStore.getState().projects).toEqual([{
      projectId: 'nova',
      lastVisitedAt: completedAt,
    }]);
    expect(getCompletedProjectStageIds(projectsById.nova)).toEqual(journeyBeforeVisit);
  });

  it('duplicate achievement olusturmaz', () => {
    const store = useProgressStore.getState();

    store.unlockAchievement('first-lesson');
    store.unlockAchievement('first-lesson');

    expect(useProgressStore.getState().earnedAchievementIds).toEqual(['first-lesson']);
  });

  it('hydration hazir degilken achievement degerlendirmez', () => {
    useProgressStore.getState().completeLesson('design-tokens', completedAt);

    expect(useProgressStore.getState().earnedAchievementIds).toEqual([]);

    useProgressStore.getState().setHasHydrated(true);

    expect(useProgressStore.getState().earnedAchievementIds).toContain('first-lesson');
  });
});
