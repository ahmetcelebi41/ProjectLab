import { fireEvent, render } from '@testing-library/react-native';

import { designTokensQuiz } from '@/data/quizzes';
import { createQuizAttempt } from '@/features/quiz/quizAttempts';
import { useProgressStore } from '@/stores/progressStore';
import { PROGRESS_SCHEMA_VERSION, type QuizAnswer, type QuizAttempt } from '@/types';

import { QuizResultScreen } from './QuizResultScreen';

const mockRouterReplace = jest.fn();

jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    replace: (...args: unknown[]) => mockRouterReplace(...args),
  },
}));

const firstCompletedAt = '2026-09-27T10:00:00.000Z';
const secondCompletedAt = '2026-09-27T11:00:00.000Z';

function answersFor(correctCount: number): readonly QuizAnswer[] {
  return designTokensQuiz.questions.map((question, index) => ({
    questionId: question.id,
    selectedOptionId: index < correctCount
      ? question.correctOptionId
      : question.options.find((option) => option.id !== question.correctOptionId)!.id,
  }));
}

function attemptFor(correctCount: number, completedAt: string): QuizAttempt {
  const attempt = createQuizAttempt(designTokensQuiz, answersFor(correctCount), completedAt);
  if (!attempt) throw new Error('Test attempt should be valid');
  return attempt;
}

function setCompletedQuiz(history: readonly QuizAttempt[], awardedXp = 10) {
  useProgressStore.setState({
    schemaVersion: PROGRESS_SCHEMA_VERSION,
    totalXp: awardedXp,
    projects: [],
    lessons: [],
    quizzes: [{
      quizId: designTokensQuiz.id,
      currentQuestionIndex: designTokensQuiz.questions.length - 1,
      answers: answersFor(history.at(-1)?.correctAnswerCount ?? 0),
      bestCorrectAnswerCount: Math.max(...history.map((attempt) => attempt.correctAnswerCount)),
      awardedXp,
      completedAt: history[0]?.completedAt,
    }],
    quizHistory: history,
    lastActivity: null,
    earnedAchievementIds: [],
    hasHydrated: true,
  });
}

describe('QuizResultScreen attempt details', () => {
  beforeEach(() => {
    mockRouterReplace.mockClear();
  });

  it('shows last and best scores, question states, explanations and retry actions', () => {
    setCompletedQuiz([
      attemptFor(2, firstCompletedAt),
      attemptFor(1, secondCompletedAt),
    ]);

    const screen = render(
      <QuizResultScreen lessonId="design-tokens" quizId="design-tokens-quiz" />,
    );

    expect(screen.getByText('Son tam quiz: 1/3')).toBeTruthy();
    expect(screen.getByText('En iyi tam quiz: 2/3')).toBeTruthy();
    expect(screen.getByLabelText('Soru 1, doğru')).toBeTruthy();
    expect(screen.getByLabelText('Soru 2, yanlış')).toBeTruthy();
    expect(screen.getByLabelText('Soru 3, yanlış')).toBeTruthy();
    expect(screen.getByText(designTokensQuiz.questions[1].explanation)).toBeTruthy();
    expect(screen.getByText('+0')).toBeTruthy();

    const historyBeforeRerender = useProgressStore.getState().quizHistory;
    const xpBeforeRerender = useProgressStore.getState().totalXp;
    screen.rerender(
      <QuizResultScreen lessonId="design-tokens" quizId="design-tokens-quiz" />,
    );
    expect(useProgressStore.getState().quizHistory).toBe(historyBeforeRerender);
    expect(useProgressStore.getState().totalXp).toBe(xpBeforeRerender);

    fireEvent.press(screen.getByText('Yanlışları Tekrarla'));
    expect(mockRouterReplace).toHaveBeenCalledWith(
      '/learn/design-tokens/quiz/design-tokens-quiz?retryAttemptAt=2026-09-27T11%3A00%3A00.000Z',
    );

    mockRouterReplace.mockClear();
    fireEvent.press(screen.getByText('Quizi Tekrar Çöz'));
    expect(mockRouterReplace).toHaveBeenCalledWith(
      '/learn/design-tokens/quiz/design-tokens-quiz',
    );
  });

  it('shows a perfect result without the wrong-answer retry action', () => {
    setCompletedQuiz([attemptFor(3, firstCompletedAt)], 40);

    const screen = render(
      <QuizResultScreen lessonId="design-tokens" quizId="design-tokens-quiz" />,
    );

    expect(screen.getByText('Mükemmel sonuç')).toBeTruthy();
    expect(screen.getByLabelText('Yüzde 100')).toBeTruthy();
    expect(screen.getByText('+40')).toBeTruthy();
    expect(screen.queryByText('Yanlışları Tekrarla')).toBeNull();
    designTokensQuiz.questions.forEach((_, index) => {
      expect(screen.getByLabelText(`Soru ${index + 1}, doğru`)).toBeTruthy();
    });
  });

  it('shows retry remediation while preserving full quiz last and best scores', () => {
    const fullAttempt = attemptFor(2, firstCompletedAt);
    const retryAttempt: QuizAttempt = {
      quizId: designTokensQuiz.id,
      attemptType: 'retry',
      completedAt: secondCompletedAt,
      correctAnswerCount: 1,
      questionCount: 1,
      wrongQuestionIds: [],
    };
    setCompletedQuiz([fullAttempt, retryAttempt]);
    useProgressStore.setState({
      quizzes: [{
        quizId: designTokensQuiz.id,
        currentQuestionIndex: designTokensQuiz.questions.length - 1,
        answers: [{ questionId: 'safe-change', selectedOptionId: 'update-token' }],
        bestCorrectAnswerCount: 2,
        awardedXp: 10,
        completedAt: firstCompletedAt,
      }],
    });

    const screen = render(
      <QuizResultScreen lessonId="design-tokens" quizId="design-tokens-quiz" />,
    );

    expect(screen.getByText('RETRY SONUCU')).toBeTruthy();
    expect(screen.getByLabelText('Yüzde 100')).toBeTruthy();
    expect(screen.getByText('Son tam quiz: 2/3')).toBeTruthy();
    expect(screen.getByText('En iyi tam quiz: 2/3')).toBeTruthy();
    expect(screen.getByLabelText('Soru 3, doğru')).toBeTruthy();
    expect(screen.queryByLabelText('Soru 1, doğru')).toBeNull();
    expect(screen.getByText('+0')).toBeTruthy();
  });

  it('shows every question as wrong for a zero score without technical route copy', () => {
    setCompletedQuiz([attemptFor(0, firstCompletedAt)]);

    const screen = render(
      <QuizResultScreen lessonId="design-tokens" quizId="design-tokens-quiz" />,
    );

    expect(screen.getByLabelText('Yüzde 0')).toBeTruthy();
    designTokensQuiz.questions.forEach((_, index) => {
      expect(screen.getByLabelText(`Soru ${index + 1}, yanlış`)).toBeTruthy();
    });
    expect(screen.queryByText(/retryAttemptAt|quizId|result/)).toBeNull();
  });

  it('keeps completed pre-history quiz results available through the attempt helper', () => {
    setCompletedQuiz([attemptFor(2, firstCompletedAt)]);
    useProgressStore.setState({ quizHistory: [] });

    const screen = render(
      <QuizResultScreen lessonId="design-tokens" quizId="design-tokens-quiz" />,
    );

    expect(screen.getByText('Son tam quiz: 2/3')).toBeTruthy();
    expect(screen.getByLabelText('Soru 3, yanlış')).toBeTruthy();
    expect(screen.getByText('Yanlışları Tekrarla')).toBeTruthy();
  });
});
