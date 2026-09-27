import { render } from '@testing-library/react-native';

import { useProgressStore } from '@/stores/progressStore';
import { PROGRESS_SCHEMA_VERSION, type ProjectId } from '@/types';

import { ProjectDetailScreen } from './ProjectDetailScreen';

jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    replace: jest.fn(),
  },
}));

describe('ProjectDetailScreen V1.1 sections', () => {
  beforeEach(() => {
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

  it.each([
    ['elora', 'ELORA'],
    ['nova', 'NOVA'],
    ['moonphase', 'Moonphase'],
  ] as const)('renders common project sections for %s', (projectId, title) => {
    const screen = render(<ProjectDetailScreen projectId={projectId satisfies ProjectId} />);

    expect(screen.getAllByText(title).length).toBeGreaterThan(0);
    expect(screen.getByText('Proje Timeline’ı')).toBeTruthy();
    expect(screen.getByText('Kilometre Taşları')).toBeTruthy();
    expect(screen.getByText('Bu Projede Ne Öğrendim?')).toBeTruthy();
    expect(screen.getByText('Kullanılan Teknolojiler')).toBeTruthy();
  });

  it('does not expose a technical route id as user-facing copy', () => {
    const screen = render(<ProjectDetailScreen projectId="moonphase" />);

    expect(screen.queryByText('moonphase')).toBeNull();
    expect(screen.getAllByText('Moonphase').length).toBeGreaterThan(0);
  });
});
