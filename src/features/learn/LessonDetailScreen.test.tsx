import { fireEvent, render, waitFor } from '@testing-library/react-native';

import { lessonsById } from '@/data';
import { useProgressStore } from '@/stores/progressStore';
import { PROGRESS_SCHEMA_VERSION } from '@/types';

import { LessonDetailScreen } from './LessonDetailScreen';

const mockRouterPush = jest.fn();

jest.mock('expo-router', () => ({
  router: {
    push: (...args: unknown[]) => mockRouterPush(...args),
    replace: jest.fn(),
  },
}));

describe('LessonDetailScreen progress integration', () => {
  beforeEach(() => {
    mockRouterPush.mockClear();
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
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('shows an incomplete lesson and completes it once without duplicate XP', async () => {
    const lessonOpenedAt = '2026-09-27T10:00:00.000Z';
    const lessonCompletedAt = '2026-09-27T10:00:00.001Z';
    jest.useFakeTimers();
    jest.setSystemTime(new Date(lessonOpenedAt));
    const screen = render(<LessonDetailScreen lessonId="design-tokens" />);

    expect(screen.getByText('Dersi Tamamla')).toBeTruthy();
    expect(useProgressStore.getState().lastActivity?.occurredAt).toBe(lessonOpenedAt);

    fireEvent.press(screen.getByText('Dersi Tamamla'));

    await waitFor(() => expect(screen.getByText('Harika, bu dersi tamamladın.')).toBeTruthy());
    expect(screen.getByText(`+${lessonsById['design-tokens'].completionXp} XP kazandın. Dersi istediğin zaman yeniden inceleyebilirsin.`)).toBeTruthy();
    const stateAfterFirstCompletion = useProgressStore.getState();
    expect(stateAfterFirstCompletion.totalXp).toBe(lessonsById['design-tokens'].completionXp);
    expect(stateAfterFirstCompletion.lessons[0]?.completedAt).toBe(lessonCompletedAt);
    expect(stateAfterFirstCompletion.lastActivity).toMatchObject({
      type: 'lesson',
      lessonId: 'design-tokens',
      occurredAt: lessonCompletedAt,
    });
    expect(Date.parse(stateAfterFirstCompletion.lastActivity!.occurredAt))
      .toBeGreaterThan(Date.parse(lessonOpenedAt));

    stateAfterFirstCompletion.completeLesson('design-tokens', '2026-09-28T00:00:00.000Z');
    expect(useProgressStore.getState().totalXp).toBe(lessonsById['design-tokens'].completionXp);
  });

  it('shows completed state without another completion action and keeps quiz routing', () => {
    useProgressStore.setState({
      lessons: [{ lessonId: 'design-tokens', completedAt: '2026-09-27T10:00:00.000Z' }],
    });

    const screen = render(<LessonDetailScreen lessonId="design-tokens" />);

    expect(screen.getByText('Harika, bu dersi tamamladın.')).toBeTruthy();
    expect(screen.queryByText('Dersi Tamamla')).toBeNull();
    fireEvent.press(screen.getByText('Quize Geç'));
    expect(mockRouterPush).toHaveBeenCalledWith(
      '/learn/design-tokens/quiz/design-tokens-quiz',
    );
  });

  it('records lesson activity once for the current screen visit', async () => {
    const lessonOpenedAt = '2026-09-27T10:00:00.000Z';
    jest.useFakeTimers();
    jest.setSystemTime(new Date(lessonOpenedAt));
    const screen = render(<LessonDetailScreen lessonId="api-contracts" />);

    await waitFor(() => expect(useProgressStore.getState().lastActivity).toMatchObject({
      type: 'lesson',
      lessonId: 'api-contracts',
      occurredAt: lessonOpenedAt,
    }));
    const firstActivity = useProgressStore.getState().lastActivity;

    jest.setSystemTime(new Date('2026-09-27T10:01:00.000Z'));
    screen.rerender(<LessonDetailScreen lessonId="api-contracts" />);
    expect(useProgressStore.getState().lastActivity).toBe(firstActivity);
  });
});
