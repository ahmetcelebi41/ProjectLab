import { fireEvent, render } from '@testing-library/react-native';

import { useProgressStore } from '@/stores/progressStore';
import { PROGRESS_SCHEMA_VERSION, type LastActivity } from '@/types';

import { HomeScreen } from './HomeScreen';

const mockRouterPush = jest.fn();

jest.mock('expo-router', () => ({
  router: { push: (...args: unknown[]) => mockRouterPush(...args) },
}));

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

describe('HomeScreen V1.1 progress integration', () => {
  beforeEach(() => {
    mockRouterPush.mockClear();
    setProgress();
  });

  it('shows a useful empty state for a new user', () => {
    const screen = render(<HomeScreen />);

    expect(screen.getByText('ProjectLab’e başla')).toBeTruthy();
    fireEvent.press(screen.getByLabelText('Öğren sayfasına git'));
    expect(mockRouterPush).toHaveBeenCalledWith('/learn');
  });

  it.each([
    [
      { type: 'lesson', lessonId: 'design-tokens', occurredAt: '2026-09-27T10:00:00.000Z' },
      'Design Token ile Tutarlı Arayüz',
      'Derse devam et',
      '/learn/design-tokens',
    ],
    [
      { type: 'quiz', quizId: 'design-tokens-quiz', occurredAt: '2026-09-27T10:00:00.000Z' },
      'Design Token Kontrolü',
      'Quize devam et',
      '/learn/design-tokens/quiz/design-tokens-quiz',
    ],
  ])('renders and routes activity %# with readable copy', (activity, title, action, href) => {
    setProgress({
      lastActivity: activity as unknown as LastActivity,
      projects: [{ projectId: 'nova', lastVisitedAt: '2026-09-27T09:00:00.000Z' }],
    });
    const screen = render(<HomeScreen />);

    expect(screen.getAllByText(title).length).toBeGreaterThan(0);
    expect(screen.queryByText('design-tokens')).toBeNull();
    expect(screen.queryByText('/learn/design-tokens')).toBeNull();
    fireEvent.press(screen.getByText(action));
    expect(mockRouterPush).toHaveBeenCalledWith(href);
  });

  it('routes the latest project activity from existing project progress', () => {
    setProgress({
      lastActivity: {
        type: 'lesson',
        lessonId: 'design-tokens',
        occurredAt: '2026-09-27T09:00:00.000Z',
      },
      projects: [{ projectId: 'nova', lastVisitedAt: '2026-09-27T10:00:00.000Z' }],
    });
    const screen = render(<HomeScreen />);

    expect(screen.getAllByText('NOVA').length).toBeGreaterThan(0);
    fireEvent.press(screen.getByText('Projeye devam et'));
    expect(mockRouterPush).toHaveBeenCalledWith('/projects/nova');
  });

  it('hides a continuation card for an invalid activity target', () => {
    setProgress({
      lastActivity: {
        type: 'lesson',
        lessonId: 'internal-route',
        occurredAt: '2026-09-27T10:00:00.000Z',
      } as unknown as LastActivity,
    });
    const screen = render(<HomeScreen />);

    expect(screen.queryByText('Kaldığın Yerden Devam Et')).toBeNull();
    expect(screen.queryByText('internal-route')).toBeNull();
  });

  it('derives level progress at an exact level boundary', () => {
    setProgress({ totalXp: 10 });
    const screen = render(<HomeScreen />);

    expect(screen.getByLabelText('Seviye 2, toplam 10 XP')).toBeTruthy();
    expect(screen.getByLabelText('Seviye 2 ilerlemesi yüzde 0')).toBeTruthy();
    expect(screen.getByText('Sonraki seviyeye 10 XP')).toBeTruthy();
  });
});
