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

describe('HomeScreen V1.2 progress integration', () => {
  beforeEach(() => {
    mockRouterPush.mockClear();
    setProgress();
  });

  it('shows a useful empty state for a new user', () => {
    const screen = render(<HomeScreen />);

    expect(screen.getByLabelText('Öğrenme özeti: 0/3 ders, yüzde 0, 0 XP, seviye 1')).toBeTruthy();
    expect(screen.getByLabelText('Ders ilerlemesi yüzde 0')).toBeTruthy();
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
    expect(screen.getByText(`SON AKTİVİTE · ${activity.type.toUpperCase() === 'LESSON' ? 'DERS' : 'QUIZ'}`)).toBeTruthy();
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
    expect(screen.getByText('SON AKTİVİTE · PROJE')).toBeTruthy();
    fireEvent.press(screen.getByText('Projeye devam et'));
    expect(mockRouterPush).toHaveBeenCalledWith('/projects/nova');
  });

  it('falls back to the existing start action for an invalid activity target', () => {
    setProgress({
      lastActivity: {
        type: 'lesson',
        lessonId: 'internal-route',
        occurredAt: '2026-09-27T10:00:00.000Z',
      } as unknown as LastActivity,
    });
    const screen = render(<HomeScreen />);

    expect(screen.getByText('Kaldığın Yerden Devam Et')).toBeTruthy();
    expect(screen.getByText('ProjectLab’e başla')).toBeTruthy();
    expect(screen.queryByText('internal-route')).toBeNull();
  });

  it('shows lesson completion, percentage, XP and level from learning stats', () => {
    setProgress({
      totalXp: 20,
      lessons: [{ lessonId: 'design-tokens', completedAt: '2026-09-27T10:00:00.000Z' }],
    });
    const screen = render(<HomeScreen />);

    expect(screen.getByLabelText('Öğrenme özeti: 1/3 ders, yüzde 33, 20 XP, seviye 3')).toBeTruthy();
    expect(screen.getByLabelText('Ders ilerlemesi yüzde 33')).toBeTruthy();
    expect(screen.getByText('1/3')).toBeTruthy();
    expect(screen.getByText('%33')).toBeTruthy();
  });

  it('falls back from an invalid learning date to a valid project visit', () => {
    setProgress({
      lastActivity: {
        type: 'quiz',
        quizId: 'design-tokens-quiz',
        occurredAt: 'not-a-date',
      },
      projects: [{ projectId: 'elora', lastVisitedAt: '2026-09-27T10:00:00.000Z' }],
    });
    const screen = render(<HomeScreen />);

    expect(screen.getByText('SON AKTİVİTE · PROJE')).toBeTruthy();
    expect(screen.getAllByText('ELORA').length).toBeGreaterThan(0);
    fireEvent.press(screen.getByText('Projeye devam et'));
    expect(mockRouterPush).toHaveBeenCalledWith('/projects/elora');
  });

  it('keeps existing project cards and their navigation', () => {
    const screen = render(<HomeScreen />);

    expect(screen.getByText('Projelerim')).toBeTruthy();
    expect(screen.getAllByText('NOVA').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Tamamlandı').length).toBeGreaterThan(0);
    fireEvent.press(screen.getByLabelText('NOVA projesini aç'));
    expect(mockRouterPush).toHaveBeenCalledWith('/projects/nova');
  });
});
