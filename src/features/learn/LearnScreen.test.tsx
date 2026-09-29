import { fireEvent, render } from '@testing-library/react-native';

import { useProgressStore } from '@/stores/progressStore';
import { PROGRESS_SCHEMA_VERSION } from '@/types';

import { LearnScreen } from './LearnScreen';

const mockRouterPush = jest.fn();

jest.mock('expo-router', () => ({
  router: { push: (...args: unknown[]) => mockRouterPush(...args) },
}));

const completedAt = '2026-09-29T10:00:00.000Z';

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

describe('LearnScreen V1.2 progress integration', () => {
  beforeEach(() => {
    mockRouterPush.mockClear();
    setProgress();
  });

  it('shows real zero progress and keeps the first-lesson start action', () => {
    const screen = render(<LearnScreen />);

    expect(screen.getByLabelText('3 dersten 0 tanesi tamamlandı, yüzde 0, 0 XP, seviye 1')).toBeTruthy();
    expect(screen.getByLabelText('Genel ders ilerlemesi yüzde 0')).toBeTruthy();
    expect(screen.getByText('0/3 ders tamamlandı')).toBeTruthy();
    expect(screen.getByText('0 XP')).toBeTruthy();
    expect(screen.getByText('Seviye 1')).toBeTruthy();
    expect(screen.queryByText('Devam Et')).toBeNull();
    expect(screen.getByLabelText('Frontend, 0 dersten 0 tamamlandı, yüzde 0')).toBeTruthy();
    expect(screen.getByLabelText('Frontend ilerlemesi yüzde 0').props.accessibilityValue).toEqual({
      max: 100,
      min: 0,
      now: 0,
    });

    fireEvent.press(screen.getByLabelText('Bugün Öğren: Design Token ile Tutarlı Arayüz'));
    expect(mockRouterPush).toHaveBeenCalledWith('/learn/design-tokens');
  });

  it('renders selector-backed partial and category progress with XP and level', () => {
    setProgress({
      totalXp: 20,
      lessons: [
        { lessonId: 'design-tokens', completedAt },
        { lessonId: 'api-contracts', lastBlockId: 'concept' },
      ],
    });
    const screen = render(<LearnScreen />);

    expect(screen.getByLabelText('Genel ders ilerlemesi yüzde 33')).toBeTruthy();
    expect(screen.getByText('1/3 ders tamamlandı')).toBeTruthy();
    expect(screen.getByText('20 XP')).toBeTruthy();
    expect(screen.getByText('Seviye 3')).toBeTruthy();
    expect(screen.getAllByLabelText(/^(UI\/UX|Frontend|Backend|DevOps),/).map(
      (card) => card.props.accessibilityLabel,
    )).toEqual([
      'UI/UX, 2 dersten 1 tamamlandı, yüzde 50',
      'Frontend, 0 dersten 0 tamamlandı, yüzde 0',
      'Backend, 1 dersten 0 tamamlandı, yüzde 0',
      'DevOps, 0 dersten 0 tamamlandı, yüzde 0',
    ]);
    expect(screen.getByLabelText('UI/UX ilerlemesi yüzde 50')).toBeTruthy();
    expect(screen.getByLabelText('Frontend ilerlemesi yüzde 0')).toBeTruthy();
    expect(screen.getByLabelText('Backend ilerlemesi yüzde 0')).toBeTruthy();
    expect(screen.getByLabelText('DevOps ilerlemesi yüzde 0')).toBeTruthy();
    fireEvent.press(screen.getByLabelText('API Contract Tasarlamak dersine devam et'));
    expect(mockRouterPush).toHaveBeenCalledWith('/learn/api-contracts');
  });

  it('does not render duplicate completions above the category total', () => {
    setProgress({
      lessons: [
        { lessonId: 'design-tokens', completedAt },
        { lessonId: 'design-tokens', completedAt },
        { lessonId: 'product-taxonomy', completedAt },
      ],
    });
    const screen = render(<LearnScreen />);

    expect(screen.getByLabelText('UI/UX, 2 dersten 2 tamamlandı, yüzde 100')).toBeTruthy();
    expect(screen.getByLabelText('UI/UX ilerlemesi yüzde 100').props.accessibilityValue).toEqual({
      max: 100,
      min: 0,
      now: 100,
    });
    expect(screen.queryByText('3/2 ders')).toBeNull();
  });

  it('keeps completed lessons visible and re-openable', () => {
    setProgress({ lessons: [{ lessonId: 'design-tokens', completedAt }] });
    const screen = render(<LearnScreen />);

    expect(screen.getByText('Tamamlandı')).toBeTruthy();
    expect(screen.getAllByText('Tekrar İncele').length).toBeGreaterThan(0);
    fireEvent.press(screen.getByLabelText(/Design Token ile Tutarlı Arayüz, Tamamlandı/));
    expect(mockRouterPush).toHaveBeenCalledWith('/learn/design-tokens');
  });

  it('preserves the existing Continue choice and lesson navigation', () => {
    setProgress({
      lessons: [
        { lessonId: 'api-contracts', lastBlockId: 'concept' },
        { lessonId: 'product-taxonomy', lastBlockId: 'importance' },
      ],
      lastActivity: {
        type: 'lesson',
        lessonId: 'product-taxonomy',
        occurredAt: completedAt,
      },
    });
    const screen = render(<LearnScreen />);

    expect(screen.getAllByText('Devam Et').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Ürün Taksonomisi Kurmak').length).toBeGreaterThan(0);
    fireEvent.press(screen.getByLabelText('Ürün Taksonomisi Kurmak dersine devam et'));
    expect(mockRouterPush).toHaveBeenCalledWith('/learn/product-taxonomy');

    fireEvent.press(screen.getByLabelText(/Ürün Taksonomisi Kurmak, Devam Ediyor/));
    expect(mockRouterPush).toHaveBeenCalledWith('/learn/product-taxonomy');
  });

  it('keeps category filtering and its empty-state return path working', () => {
    const screen = render(<LearnScreen />);

    fireEvent.press(screen.getByRole('tab', { name: 'Frontend' }));
    expect(screen.getByText('Bu kategoride henüz ders yok')).toBeTruthy();
    fireEvent.press(screen.getByText('Tüm konuları göster'));
    expect(screen.getByLabelText(/API Contract Tasarlamak, Başlanmadı/)).toBeTruthy();
  });
});
