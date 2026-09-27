import { fireEvent, render } from '@testing-library/react-native';

import { designTokensQuiz } from '@/data/quizzes';
import { getQuizAwardXp } from '@/features/progress/rewards';
import { useProgressStore } from '@/stores/progressStore';
import { PROGRESS_SCHEMA_VERSION } from '@/types';

import { QuizFlowScreen } from './QuizFlowScreen';

const mockRouterReplace = jest.fn();
const completedAt = '2026-09-27T10:00:00.000Z';

jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    replace: (...args: unknown[]) => mockRouterReplace(...args),
  },
}));

describe('QuizFlowScreen retry session', () => {
  beforeEach(() => {
    mockRouterReplace.mockClear();
    useProgressStore.setState({
      schemaVersion: PROGRESS_SCHEMA_VERSION,
      totalXp: 10,
      projects: [],
      lessons: [],
      quizzes: [{
        quizId: designTokensQuiz.id,
        currentQuestionIndex: designTokensQuiz.questions.length - 1,
        answers: [{ questionId: 'safe-change', selectedOptionId: 'search-screens' }],
        bestCorrectAnswerCount: 2,
        awardedXp: 10,
        completedAt,
      }],
      quizHistory: [{
        quizId: designTokensQuiz.id,
        completedAt,
        correctAnswerCount: 2,
        questionCount: designTokensQuiz.questions.length,
        wrongQuestionIds: ['safe-change', 'unknown-question'],
      }],
      lastActivity: null,
      earnedAchievementIds: [],
      hasHydrated: true,
    });
  });

  it('completes a first quiz through attempt services and records wrong questions', () => {
    useProgressStore.setState({
      totalXp: 0,
      quizzes: [],
      quizHistory: [],
    });
    const screen = render(
      <QuizFlowScreen lessonId="design-tokens" quizId="design-tokens-quiz" />,
    );

    fireEvent.press(screen.getByLabelText('Görsel kararları anlamlı isimlerle merkezileştirmek'));
    fireEvent.press(screen.getByText('Cevabı Kontrol Et'));
    fireEvent.press(screen.getByText('Sonraki Soru'));
    fireEvent.press(screen.getByLabelText('Doğru'));
    fireEvent.press(screen.getByText('Cevabı Kontrol Et'));
    fireEvent.press(screen.getByText('Sonraki Soru'));
    fireEvent.press(screen.getByLabelText('Tüm ekranlarda renk kodunu tek tek değiştirmek'));
    fireEvent.press(screen.getByText('Cevabı Kontrol Et'));
    fireEvent.press(screen.getByText('Sonucu Gör'));

    const state = useProgressStore.getState();
    expect(state.totalXp).toBe(getQuizAwardXp(designTokensQuiz, 2));
    expect(state.quizHistory).toHaveLength(1);
    expect(state.quizHistory[0]).toMatchObject({
      correctAnswerCount: 2,
      questionCount: 3,
      wrongQuestionIds: ['safe-change'],
    });
    expect(mockRouterReplace).toHaveBeenCalledWith(
      '/learn/design-tokens/quiz/design-tokens-quiz/result',
    );
  });

  it('starts empty with only valid wrong questions and awards no second XP', () => {
    const screen = render(
      <QuizFlowScreen
        lessonId="design-tokens"
        quizId="design-tokens-quiz"
        retryAttemptAt={completedAt}
      />,
    );

    expect(screen.getByText('1 soru · Yanlış tekrar')).toBeTruthy();
    expect(screen.getByText(designTokensQuiz.questions[2].prompt)).toBeTruthy();
    expect(screen.queryByText(designTokensQuiz.questions[0].prompt)).toBeNull();
    expect(screen.getByLabelText('Seçili cevabı kontrol et').props.accessibilityState.disabled)
      .toBe(true);

    fireEvent.press(screen.getByText('Merkezi token değerini güncellemek'));
    fireEvent.press(screen.getByText('Cevabı Kontrol Et'));
    fireEvent.press(screen.getByText('Sonucu Gör'));

    const state = useProgressStore.getState();
    expect(state.totalXp).toBe(10);
    expect(state.quizHistory).toHaveLength(2);
    expect(state.quizHistory[1]).toMatchObject({
      attemptType: 'retry',
      correctAnswerCount: 1,
      questionCount: 1,
      wrongQuestionIds: [],
    });
    expect(mockRouterReplace).toHaveBeenCalledWith(
      '/learn/design-tokens/quiz/design-tokens-quiz/result',
    );
  });

  it('starts a full re-solve with every question, no old answers and no second XP', () => {
    const screen = render(
      <QuizFlowScreen lessonId="design-tokens" quizId="design-tokens-quiz" />,
    );

    expect(screen.getByText('3 soru')).toBeTruthy();
    expect(screen.queryByText('+10 XP')).toBeNull();
    expect(screen.getByText(designTokensQuiz.questions[0].prompt)).toBeTruthy();
    expect(screen.getByLabelText('Seçili cevabı kontrol et').props.accessibilityState.disabled)
      .toBe(true);

    fireEvent.press(screen.getByLabelText('Görsel kararları anlamlı isimlerle merkezileştirmek'));
    fireEvent.press(screen.getByText('Cevabı Kontrol Et'));
    fireEvent.press(screen.getByText('Sonraki Soru'));
    fireEvent.press(screen.getByLabelText('Doğru'));
    fireEvent.press(screen.getByText('Cevabı Kontrol Et'));
    fireEvent.press(screen.getByText('Sonraki Soru'));
    fireEvent.press(screen.getByLabelText('Merkezi token değerini güncellemek'));
    fireEvent.press(screen.getByText('Cevabı Kontrol Et'));
    fireEvent.press(screen.getByText('Sonucu Gör'));

    const state = useProgressStore.getState();
    expect(state.totalXp).toBe(10);
    expect(state.quizHistory).toHaveLength(2);
    expect(state.quizHistory[1]).toMatchObject({
      attemptType: 'full',
      correctAnswerCount: 3,
      questionCount: 3,
      wrongQuestionIds: [],
    });
  });
});
