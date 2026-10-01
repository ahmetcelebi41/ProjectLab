import { fireEvent, render } from '@testing-library/react-native';

import { useProgressStore } from '@/stores/progressStore';
import { PROGRESS_SCHEMA_VERSION } from '@/types';

import { ProfileScreen } from './ProfileScreen';

const mockRouterPush = jest.fn();

jest.mock('expo-router', () => ({
  router: { push: (...args: unknown[]) => mockRouterPush(...args) },
}));

const completedAt = '2026-09-27T10:00:00.000Z';

function setProgress(overrides: Partial<ReturnType<typeof useProgressStore.getState>> = {}) {
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
    hasHydrated: true,
    ...overrides,
  });
}

describe('ProfileScreen V1.3 progress integration', () => {
  beforeEach(() => {
    mockRouterPush.mockClear();
    setProgress();
  });

  it('renders existing profile features and safe zero-data states', () => {
    const screen = render(<ProfileScreen />);

    expect(screen.getByText('0 XP')).toBeTruthy();
    expect(screen.getByText('Öğrenme Özeti')).toBeTruthy();
    expect(screen.getByLabelText('Ders ilerlemesi yüzde 0')).toBeTruthy();
    expect(screen.getByLabelText('Quiz ilerlemesi yüzde 0')).toBeTruthy();
    expect(screen.getByText('Veri yetersiz')).toBeTruthy();
    expect(screen.getByText('Henüz quiz performans verisi yok.')).toBeTruthy();
    expect(screen.getByText('Henüz aktivite yok.')).toBeTruthy();
    expect(screen.getByText('Henüz aktivite kaydı yok.')).toBeTruthy();
    expect(screen.queryByText(/NaN|Infinity/)).toBeNull();
    expect(screen.getByText('Başarımlar')).toBeTruthy();
    expect(screen.getByLabelText('Kazanılan başarım: 0 / 6')).toBeTruthy();
  });

  it('shows selector-backed activity stats, recent events and the history entry point', () => {
    const recent = Date.now() - 60_000;
    setProgress({
      activityHistory: [
        { id: 'lesson', type: 'lesson_completed', entityId: 'design-tokens', timestamp: recent - 1 },
        {
          id: 'retry',
          type: 'quiz_retry',
          entityId: 'design-tokens-quiz',
          timestamp: recent,
          metadata: { correctAnswerCount: 1, questionCount: 1 },
        },
      ],
    });

    const screen = render(<ProfileScreen />);

    expect(screen.getByLabelText('Aktivite özeti: toplam 2, son 7 gün 2')).toBeTruthy();
    expect(screen.getByText('Quiz tekrarlandı')).toBeTruthy();
    expect(screen.getByText('Ders tamamlandı')).toBeTruthy();
    fireEvent.press(screen.getByLabelText('Tüm aktiviteleri aç'));
    expect(mockRouterPush).toHaveBeenCalledWith('/profile/activity');
  });

  it('shows lesson and quiz completion plus weighted quiz performance', () => {
    setProgress({
      lessons: [{ lessonId: 'design-tokens', completedAt }],
      quizzes: [{
        quizId: 'design-tokens-quiz',
        currentQuestionIndex: 2,
        answers: [],
        bestCorrectAnswerCount: 3,
        completedAt,
      }],
      quizHistory: [{
        quizId: 'design-tokens-quiz',
        attemptType: 'full',
        completedAt,
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

    expect(screen.getByLabelText('Ders ilerlemesi yüzde 33')).toBeTruthy();
    expect(screen.getByLabelText('Quiz ilerlemesi yüzde 33')).toBeTruthy();
    expect(screen.getAllByText('1 / 3 · %33').length).toBeGreaterThanOrEqual(2);
    expect(screen.getByLabelText('Genel doğruluk: %80')).toBeTruthy();
    expect(screen.getByLabelText('Full attempt: 1')).toBeTruthy();
    expect(screen.getByLabelText('Retry attempt: 1')).toBeTruthy();
    expect(screen.getByLabelText('Toplam attempt: 2')).toBeTruthy();
    expect(screen.queryByText('technical-question-id')).toBeNull();
  });

  it('separates preserved quiz completion from unavailable legacy full-attempt history', () => {
    setProgress({
      quizzes: [
        {
          quizId: 'design-tokens-quiz',
          currentQuestionIndex: 2,
          answers: [],
          bestCorrectAnswerCount: 2,
          completedAt: '2026-09-26T11:00:00.000Z',
        },
        {
          quizId: 'api-contracts-quiz',
          currentQuestionIndex: 2,
          answers: [],
          bestCorrectAnswerCount: 2,
          completedAt: '2026-09-26T12:00:00.000Z',
        },
        {
          quizId: 'product-taxonomy-quiz',
          currentQuestionIndex: 2,
          answers: [],
          bestCorrectAnswerCount: 2,
          completedAt: '2026-09-26T13:00:00.000Z',
        },
      ],
      quizHistory: [],
    });
    const screen = render(<ProfileScreen />);

    expect(screen.getByLabelText('Quiz ilerlemesi yüzde 100')).toBeTruthy();
    expect(screen.getByText('3 / 3 · %100')).toBeTruthy();
    expect(screen.getByLabelText('Full attempt: 0')).toBeTruthy();
    expect(screen.getByLabelText('Toplam attempt: 0')).toBeTruthy();
    expect(screen.getByLabelText('Geçmiş quiz verisi eksik')).toBeTruthy();
  });

  it('uses selector category mapping for the four V1.2 groups', () => {
    setProgress({
      lessons: [
        { lessonId: 'design-tokens', completedAt },
        { lessonId: 'api-contracts', completedAt },
      ],
    });
    const screen = render(<ProfileScreen />);

    expect(screen.getByText('Kategori İlerlemesi')).toBeTruthy();
    expect(screen.getByLabelText('UI/UX yüzde 50')).toBeTruthy();
    expect(screen.getByLabelText('Frontend yüzde 0')).toBeTruthy();
    expect(screen.getByLabelText('Backend yüzde 100')).toBeTruthy();
    expect(screen.getByLabelText('DevOps yüzde 0')).toBeTruthy();
  });

  it('labels recorded values and warns when legacy quiz history is incomplete', () => {
    setProgress({
      quizzes: [{
        quizId: 'design-tokens-quiz',
        currentQuestionIndex: 2,
        answers: [],
        bestCorrectAnswerCount: 3,
        completedAt,
      }],
      quizHistory: [{
        quizId: 'design-tokens-quiz',
        attemptType: 'retry',
        completedAt: '2026-09-27T11:00:00.000Z',
        correctAnswerCount: 1,
        questionCount: 1,
        wrongQuestionIds: [],
      }],
    });
    const screen = render(<ProfileScreen />);

    expect(screen.getByLabelText('Geçmiş quiz verisi eksik')).toBeTruthy();
    expect(screen.getByLabelText('Genel doğruluk: Veri yetersiz')).toBeTruthy();
    expect(screen.getByLabelText('Full attempt: 0')).toBeTruthy();
    expect(screen.getByLabelText('Retry attempt: 1')).toBeTruthy();
    expect(screen.getByLabelText('Toplam attempt: 1')).toBeTruthy();
    expect(screen.queryByLabelText('Genel doğruluk: %100')).toBeNull();
  });

  it('shows the selector-chosen latest activity with type and date', () => {
    setProgress({
      lastActivity: {
        type: 'lesson',
        lessonId: 'design-tokens',
        occurredAt: completedAt,
      },
      projects: [{ projectId: 'nova', lastVisitedAt: '2026-09-28T10:00:00.000Z' }],
    });
    const screen = render(<ProfileScreen />);

    expect(screen.getByLabelText(/Son aktivite, Proje, NOVA, 28 Eylül 2026/)).toBeTruthy();
    expect(screen.getByText('Tür: Proje')).toBeTruthy();
  });

  it('uses the empty activity fallback when persisted dates are invalid', () => {
    setProgress({
      lastActivity: {
        type: 'quiz',
        quizId: 'design-tokens-quiz',
        occurredAt: 'invalid-date',
      },
      projects: [{ projectId: 'nova', lastVisitedAt: 'also-invalid' }],
    });
    const screen = render(<ProfileScreen />);

    expect(screen.getByText('Henüz aktivite yok.')).toBeTruthy();
    expect(screen.queryByText('Invalid Date')).toBeNull();
  });

  it('preserves exact-boundary level and earned-achievement UI', () => {
    setProgress({ totalXp: 20, earnedAchievementIds: ['first-project'] });
    const screen = render(<ProfileScreen />);

    expect(screen.getByLabelText('Seviye 3, toplam 20 XP, sonraki seviyeye 10 XP')).toBeTruthy();
    expect(screen.getByText('Bu seviyede 0 / 10 XP')).toBeTruthy();
    expect(screen.getByLabelText('Kazanılan başarım: 1 / 6')).toBeTruthy();
    expect(screen.getByLabelText('İlk Keşif, kazanıldı')).toBeTruthy();
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
});
