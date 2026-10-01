import { fireEvent, render } from '@testing-library/react-native';

import { useProgressStore } from '@/stores/progressStore';
import { PROGRESS_SCHEMA_VERSION, type ActivityEvent } from '@/types';

import { ActivityHistoryScreen } from './ActivityHistoryScreen';

const mockRouterPush = jest.fn();

jest.mock('expo-router', () => ({
  router: { push: (...args: unknown[]) => mockRouterPush(...args) },
}));

function setActivityHistory(activityHistory: readonly ActivityEvent[]) {
  useProgressStore.setState({
    schemaVersion: PROGRESS_SCHEMA_VERSION,
    totalXp: 0,
    projects: [],
    lessons: [],
    quizzes: [],
    quizHistory: [],
    lastActivity: null,
    activityHistory,
    earnedAchievementIds: [],
    hasHydrated: true,
  });
}

describe('ActivityHistoryScreen', () => {
  beforeEach(() => {
    mockRouterPush.mockClear();
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-10-01T12:00:00.000Z'));
    setActivityHistory([]);
  });

  afterEach(() => jest.useRealTimers());

  it('shows the shared empty state without exposing a technical route name', () => {
    const screen = render(<ActivityHistoryScreen />);

    expect(screen.getByText('Henüz aktivite yok')).toBeTruthy();
    expect(screen.getByText(/İlk dersini veya quizini tamamladığında/)).toBeTruthy();
    expect(screen.queryByText(/activity|activityHistory|profile\/activity/i)).toBeNull();
  });

  it('sorts newest first and renders all supported event types with readable copy', () => {
    setActivityHistory([
      {
        id: 'lesson',
        type: 'lesson_completed',
        entityId: 'design-tokens',
        timestamp: Date.parse('2026-09-25T09:00:00.000Z'),
      },
      {
        id: 'project',
        type: 'project_progress',
        entityId: 'nova',
        timestamp: Date.parse('2026-10-01T11:30:00.000Z'),
        metadata: { milestoneId: 'planning' },
      },
      {
        id: 'quiz-complete',
        type: 'quiz_completed',
        entityId: 'design-tokens-quiz',
        timestamp: Date.parse('2026-09-30T10:00:00.000Z'),
        metadata: { correctAnswerCount: 2, questionCount: 3 },
      },
      {
        id: 'quiz-retry',
        type: 'quiz_retry',
        entityId: 'design-tokens-quiz',
        timestamp: Date.parse('2026-10-01T11:00:00.000Z'),
        metadata: { correctAnswerCount: 1, questionCount: 1 },
      },
    ]);

    const screen = render(<ActivityHistoryScreen />);
    const activityTitles = screen.getAllByText(
      /^(Projede ilerleme kaydedildi|Quiz tekrarlandı|Quiz tamamlandı|Ders tamamlandı)$/,
    );

    expect(activityTitles.map((item) => item.props.children)).toEqual([
      'Projede ilerleme kaydedildi',
      'Quiz tekrarlandı',
      'Quiz tamamlandı',
      'Ders tamamlandı',
    ]);
    expect(screen.getByText('Bugün')).toBeTruthy();
    expect(screen.getByText('Dün')).toBeTruthy();
    expect(screen.getByText('Son 7 Gün')).toBeTruthy();
    expect(screen.getByText('1/1 doğru')).toBeTruthy();
    expect(screen.getByText('2/3 doğru')).toBeTruthy();

    fireEvent.press(screen.getByLabelText('Quiz tekrarlandı, Design Token Kontrolü'));
    expect(mockRouterPush).toHaveBeenCalledWith('/learn/design-tokens/quiz/design-tokens-quiz');
  });

  it('keeps an invalid entity visible and disables its navigation', () => {
    setActivityHistory([{
      id: 'missing-lesson',
      type: 'lesson_completed',
      entityId: 'removed-lesson',
      timestamp: Date.parse('2026-10-01T10:00:00.000Z'),
    }]);

    const screen = render(<ActivityHistoryScreen />);

    expect(screen.getByText('Ders tamamlandı')).toBeTruthy();
    expect(screen.getByText('Artık mevcut olmayan ders')).toBeTruthy();
    expect(screen.queryByRole('link')).toBeNull();
  });
});
