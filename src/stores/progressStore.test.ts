import { lessonsById, projectsById, quizzesById } from '@/data';
import { getCompletedProjectStageIds } from '@/features/progress/projectProgress';
import { getQuizAwardXp } from '@/features/progress/rewards';
import {
  PROGRESS_SCHEMA_VERSION,
  type Quiz,
  type QuizAnswer,
  type QuizProgress,
} from '@/types';

import { MAX_ACTIVITY_HISTORY_EVENTS, useProgressStore } from './progressStore';

const completedAt = '2026-09-26T00:00:00.000Z';
const quiz = quizzesById['design-tokens-quiz'];

function answersFor(targetQuiz: Quiz, correctAnswerCount: number): readonly QuizAnswer[] {
  return targetQuiz.questions.map((question, index) => ({
    questionId: question.id,
    selectedOptionId: index < correctAnswerCount
      ? question.correctOptionId
      : question.options.find((option) => option.id !== question.correctOptionId)!.id,
  }));
}

function quizResult(
  bestCorrectAnswerCount: number,
  resultCompletedAt = completedAt,
  targetQuiz: Quiz = quiz,
): QuizProgress {
  return {
    quizId: targetQuiz.id,
    currentQuestionIndex: targetQuiz.questions.length - 1,
    answers: answersFor(targetQuiz, bestCorrectAnswerCount),
    bestCorrectAnswerCount,
    completedAt: resultCompletedAt,
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
      activityHistory: [],
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
    expect(state.schemaVersion).toBe(3);
    expect(state.lessons).toEqual([]);
    expect(state.quizHistory).toEqual([]);
    expect(state.lastActivity).toBeNull();
    expect(state.activityHistory).toEqual([]);
  });

  it('yeni activity eventini en basa ekler ve mevcut sirayi korur', () => {
    const firstEvent = {
      id: 'quiz_retry:design-tokens-quiz:1',
      type: 'quiz_retry',
      entityId: 'design-tokens-quiz',
      timestamp: 1,
    } as const;
    const secondEvent = {
      id: 'quiz_retry:design-tokens-quiz:2',
      type: 'quiz_retry',
      entityId: 'design-tokens-quiz',
      timestamp: 2,
      metadata: { correctAnswerCount: 3 },
    } as const;

    useProgressStore.getState().addActivityEvent(secondEvent);
    useProgressStore.getState().addActivityEvent(firstEvent);

    expect(useProgressStore.getState().activityHistory).toEqual([secondEvent, firstEvent]);
  });

  it('activity history icin en yeni 100 eventi korur', () => {
    for (let index = 0; index <= MAX_ACTIVITY_HISTORY_EVENTS; index += 1) {
      useProgressStore.getState().addActivityEvent({
        id: `project_progress:nova:${index}`,
        type: 'project_progress',
        entityId: 'nova',
        timestamp: index,
      });
    }

    const history = useProgressStore.getState().activityHistory;
    expect(history).toHaveLength(MAX_ACTIVITY_HISTORY_EVENTS);
    expect(history[0].timestamp).toBe(MAX_ACTIVITY_HISTORY_EVENTS);
    expect(history.at(-1)?.timestamp).toBe(1);
  });

  it('ayni id ile activity eventini duplicate etmez', () => {
    const event = {
      id: 'quiz_completed:design-tokens-quiz:1',
      type: 'quiz_completed',
      entityId: 'design-tokens-quiz',
      timestamp: 1,
    } as const;

    useProgressStore.getState().addActivityEvent(event);
    const history = useProgressStore.getState().activityHistory;
    useProgressStore.getState().addActivityEvent(event);

    expect(useProgressStore.getState().activityHistory).toBe(history);
    expect(history).toEqual([event]);
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
      schemaVersion: 3,
      lessons: [],
      quizHistory,
      lastActivity,
      activityHistory: [],
    });
  });

  it('ders XP sini yalniz ilk tamamlamada ekler', () => {
    const store = useProgressStore.getState();

    store.completeLesson('design-tokens', completedAt);
    const stateAfterFirstCompletion = useProgressStore.getState();
    store.completeLesson('design-tokens', '2026-09-27T00:00:00.000Z');

    const state = useProgressStore.getState();
    expect(state).toBe(stateAfterFirstCompletion);
    expect(state.totalXp).toBe(lessonsById['design-tokens'].completionXp);
    expect(state.lessons).toEqual([{ lessonId: 'design-tokens', completedAt }]);
    expect(state.activityHistory).toEqual([{
      id: 'lesson_completed:design-tokens',
      type: 'lesson_completed',
      entityId: 'design-tokens',
      timestamp: Date.parse(completedAt),
    }]);
  });

  it('mevcut progress verisini ilk ders tamamlamasinda korur', () => {
    const existingLesson = {
      lessonId: 'api-contracts',
      lastBlockId: 'request-shape',
      completedAt: '2026-09-25T00:00:00.000Z',
    } as const;
    const existingProject = { projectId: 'nova', lastVisitedAt: completedAt } as const;
    useProgressStore.setState({
      totalXp: 25,
      lessons: [existingLesson],
      projects: [existingProject],
      earnedAchievementIds: ['first-project'],
    });

    useProgressStore.getState().completeLesson('design-tokens', completedAt);

    const state = useProgressStore.getState();
    expect(state.totalXp).toBe(25 + lessonsById['design-tokens'].completionXp);
    expect(state.lessons).toEqual([
      existingLesson,
      { lessonId: 'design-tokens', completedAt },
    ]);
    expect(state.projects).toEqual([existingProject]);
    expect(state.earnedAchievementIds).toEqual(['first-project']);
  });

  it('son aktiviteyi mevcut activity semasiyla set eder ve gunceller', () => {
    const store = useProgressStore.getState();
    store.setLastActivity({ type: 'lesson', lessonId: 'design-tokens' }, completedAt);

    expect(useProgressStore.getState().lastActivity).toEqual({
      type: 'lesson',
      lessonId: 'design-tokens',
      occurredAt: completedAt,
    });

    const updatedAt = '2026-09-27T12:00:00.000Z';
    useProgressStore.getState().setLastActivity(
      { type: 'quiz', quizId: 'design-tokens-quiz' },
      updatedAt,
    );

    expect(useProgressStore.getState().lastActivity).toEqual({
      type: 'quiz',
      quizId: 'design-tokens-quiz',
      occurredAt: updatedAt,
    });
  });

  it('ayni son aktivite icin gereksiz state uretmez', () => {
    const store = useProgressStore.getState();
    store.setLastActivity({ type: 'lesson', lessonId: 'design-tokens' }, completedAt);
    const activity = useProgressStore.getState().lastActivity;

    useProgressStore.getState().setLastActivity(
      { type: 'lesson', lessonId: 'design-tokens' },
      completedAt,
    );

    expect(useProgressStore.getState().lastActivity).toBe(activity);
  });

  it('quiz XP sini yalniz ilk tamamlamada ekler ve en yuksek skoru korur', () => {
    const store = useProgressStore.getState();

    store.saveQuizResult(quizResult(3));
    store.saveQuizResult(quizResult(1, '2026-09-27T00:00:00.000Z'));

    const state = useProgressStore.getState();
    expect(state.totalXp).toBe(getQuizAwardXp(quiz, 3));
    expect(state.quizzes[0].bestCorrectAnswerCount).toBe(3);
    expect(state.quizzes[0].awardedXp).toBe(getQuizAwardXp(quiz, 3));
  });

  it('daha yüksek quiz retry skorunda ek XP üretmez', () => {
    const store = useProgressStore.getState();

    store.saveQuizResult(quizResult(1));
    const firstCompletionXp = useProgressStore.getState().totalXp;
    store.saveQuizResult(quizResult(3, '2026-09-27T00:00:00.000Z'));

    const state = useProgressStore.getState();
    expect(firstCompletionXp).toBe(quiz.completionXp);
    expect(state.totalXp).toBe(firstCompletionXp);
    expect(state.quizzes[0].bestCorrectAnswerCount).toBe(3);
    expect(state.quizzes[0].awardedXp).toBe(quiz.completionXp);
  });

  it('yanlış soru retry attemptini historyye ekler ama full best ve XP değerini değiştirmez', () => {
    const store = useProgressStore.getState();
    store.saveQuizResult(quizResult(1));
    const firstCompletionXp = useProgressStore.getState().totalXp;

    const retryCompletedAt = '2026-09-27T12:00:00.000Z';
    store.saveQuizResult({
      quizId: quiz.id,
      currentQuestionIndex: 1,
      answers: answersFor(quiz, 2).slice(0, 2),
      bestCorrectAnswerCount: 2,
      completedAt: retryCompletedAt,
    }, 'retry');

    const state = useProgressStore.getState();
    expect(state.totalXp).toBe(firstCompletionXp);
    expect(state.quizzes[0].bestCorrectAnswerCount).toBe(1);
    expect(state.quizHistory).toHaveLength(2);
    expect(state.quizHistory[1]).toMatchObject({
      attemptType: 'retry',
      completedAt: retryCompletedAt,
      correctAnswerCount: 2,
      questionCount: 2,
      wrongQuestionIds: [],
    });
  });

  it('gecerli quiz completionlarini sirali history olarak saklar ve event duplicate etmez', () => {
    const firstAttempt = quizResult(1);
    const secondCompletedAt = '2026-09-27T00:00:00.000Z';
    const secondAttempt = quizResult(2, secondCompletedAt);

    useProgressStore.getState().saveQuizResult(firstAttempt);
    const firstCompletionXp = useProgressStore.getState().totalXp;
    useProgressStore.getState().saveQuizResult(firstAttempt);
    expect(useProgressStore.getState().totalXp).toBe(firstCompletionXp);
    useProgressStore.getState().saveQuizResult(secondAttempt);
    expect(useProgressStore.getState().totalXp).toBe(firstCompletionXp);

    expect(useProgressStore.getState().quizHistory).toEqual([
      {
        quizId: quiz.id,
        attemptType: 'full',
        completedAt,
        correctAnswerCount: 1,
        questionCount: quiz.questions.length,
        wrongQuestionIds: quiz.questions.slice(1).map((question) => question.id),
      },
      {
        quizId: quiz.id,
        attemptType: 'full',
        completedAt: secondCompletedAt,
        correctAnswerCount: 2,
        questionCount: quiz.questions.length,
        wrongQuestionIds: [quiz.questions[2].id],
      },
    ]);
  });

  it('baska quiz attemptini bagimsiz saklar ve mevcut progress verisini korur', () => {
    const otherQuiz = quizzesById['api-contracts-quiz'];
    const existingLesson = { lessonId: 'design-tokens', completedAt } as const;
    const existingProject = { projectId: 'nova', lastVisitedAt: completedAt } as const;
    useProgressStore.setState({
      totalXp: 25,
      lessons: [existingLesson],
      projects: [existingProject],
      earnedAchievementIds: ['first-lesson'],
    });

    useProgressStore.getState().saveQuizResult(quizResult(1));
    const firstQuizAward = getQuizAwardXp(quiz, 1);
    useProgressStore.getState().saveQuizResult(quizResult(3, completedAt, otherQuiz));

    const state = useProgressStore.getState();
    expect(state.totalXp).toBe(25 + firstQuizAward + getQuizAwardXp(otherQuiz, 3));
    expect(state.quizHistory.map((attempt) => attempt.quizId)).toEqual([
      quiz.id,
      otherQuiz.id,
    ]);
    expect(state.quizzes.map((progress) => progress.quizId)).toEqual([
      quiz.id,
      otherQuiz.id,
    ]);
    expect(state.lessons).toEqual([existingLesson]);
    expect(state.projects).toEqual([existingProject]);
    expect(state.earnedAchievementIds).toEqual(['first-lesson']);
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
