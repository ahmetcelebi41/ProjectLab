import { render } from '@testing-library/react-native';

import { useProgressStore } from '@/stores/progressStore';
import { PROGRESS_SCHEMA_VERSION } from '@/types';

import { ProfileScreen } from './ProfileScreen';

jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));

function setProgress(overrides: Partial<ReturnType<typeof useProgressStore.getState>> = {}) {
  useProgressStore.setState({
    schemaVersion: PROGRESS_SCHEMA_VERSION,
    totalXp: 0,
    projects: [],
    lessons: [],
    quizzes: [],
    quizHistory: [],
    lastActivity: null,
    earnedAchievementIds: [],
    hasHydrated: true,
    ...overrides,
  });
}

describe('ProfileScreen V1.1 progress visibility', () => {
  beforeEach(() => setProgress());

  it('shows safe XP, level and empty-state copy for a new user', () => {
    const screen = render(<ProfileScreen />);

    expect(screen.getByText('0 XP')).toBeTruthy();
    expect(screen.getByText('İlk adımını at')).toBeTruthy();
    expect(screen.queryByText(/NaN|Infinity|0 \/ 0/)).toBeNull();
  });

  it('shows exact-boundary level progress', () => {
    setProgress({ totalXp: 20 });
    const screen = render(<ProfileScreen />);

    expect(screen.getByLabelText('Seviye 3, toplam 20 XP, sonraki seviyeye 10 XP')).toBeTruthy();
    expect(screen.getByText('Bu seviyede 0 / 10 XP')).toBeTruthy();
  });

  it('explains missing quiz history when lesson progress already exists', () => {
    setProgress({
      lessons: [{ lessonId: 'design-tokens', completedAt: '2026-09-27T10:00:00.000Z' }],
    });
    const screen = render(<ProfileScreen />);

    expect(screen.getByText('Henüz quiz denemesi yok')).toBeTruthy();
    expect(screen.queryByText('İlk adımını at')).toBeNull();
  });

  it('explains missing completed lessons when quiz history already exists', () => {
    setProgress({
      quizHistory: [{
        quizId: 'design-tokens-quiz',
        attemptType: 'full',
        completedAt: '2026-09-27T10:00:00.000Z',
        correctAnswerCount: 3,
        questionCount: 3,
        wrongQuestionIds: [],
      }],
    });
    const screen = render(<ProfileScreen />);

    expect(screen.getByText('Henüz tamamlanan ders yok')).toBeTruthy();
    expect(screen.queryByText('İlk adımını at')).toBeNull();
  });

  it.each([Number.NaN, Number.POSITIVE_INFINITY, -10])(
    'normalizes invalid total XP value %p in the UI',
    (totalXp) => {
      setProgress({ totalXp });
      const screen = render(<ProfileScreen />);

      expect(screen.getByLabelText('Seviye 1, toplam 0 XP, sonraki seviyeye 10 XP')).toBeTruthy();
      expect(screen.queryByText(/NaN|Infinity|-10 XP/)).toBeNull();
    },
  );

  it('shows full-attempt performance without exposing technical ids', () => {
    setProgress({
      quizHistory: [{
        quizId: 'design-tokens-quiz',
        attemptType: 'full',
        completedAt: '2026-09-27T10:00:00.000Z',
        correctAnswerCount: 3,
        questionCount: 4,
        wrongQuestionIds: ['technical-question-id'],
      }, {
        quizId: 'design-tokens-quiz',
        attemptType: 'retry',
        completedAt: '2026-09-27T11:00:00.000Z',
        correctAnswerCount: 1,
        questionCount: 1,
        wrongQuestionIds: [],
      }],
    });
    const screen = render(<ProfileScreen />);

    expect(screen.getByText('Full quiz denemesi')).toBeTruthy();
    expect(screen.getByLabelText('Full quiz denemesi: 1')).toBeTruthy();
    expect(screen.getByText('%75')).toBeTruthy();
    expect(screen.queryByText('design-tokens-quiz')).toBeNull();
    expect(screen.queryByText('technical-question-id')).toBeNull();
  });
});
