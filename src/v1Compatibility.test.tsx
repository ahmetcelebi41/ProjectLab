import { fireEvent, render } from '@testing-library/react-native';
import type { ReactNode } from 'react';
import { Text } from 'react-native';

import TabsLayout from '../app/(tabs)/_layout';
import LearnLayout from '../app/(tabs)/learn/_layout';
import LessonLayout from '../app/(tabs)/learn/[lessonId]/_layout';
import ProjectsLayout from '../app/(tabs)/projects/_layout';
import ProjectDetailLayout from '../app/(tabs)/projects/[projectId]/_layout';
import PortfolioLayout from '../app/portfolio/_layout';
import appConfig from '../app.json';
import { PortfolioShell } from './features/portfolio/PortfolioShell';

const mockRouterPush = jest.fn();
const mockRouterReplace = jest.fn();
const mockStackRoot = jest.fn();
const mockStackScreen = jest.fn();
const mockTabsRoot = jest.fn();
const mockTabsScreen = jest.fn();

jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));

jest.mock('expo-router', () => {
  const React = jest.requireActual<typeof import('react')>('react');

  function Stack({ children, ...props }: { children?: ReactNode }) {
    mockStackRoot(props);
    return React.createElement(React.Fragment, null, children);
  }
  Stack.Screen = (props: unknown) => {
    mockStackScreen(props);
    return null;
  };

  function Tabs({ children, ...props }: { children?: ReactNode }) {
    mockTabsRoot(props);
    return React.createElement(React.Fragment, null, children);
  }
  Tabs.Screen = (props: unknown) => {
    mockTabsScreen(props);
    return null;
  };

  return {
    Stack,
    Tabs,
    router: {
      push: (...args: unknown[]) => mockRouterPush(...args),
      replace: (...args: unknown[]) => mockRouterReplace(...args),
    },
  };
});

type RouteOptions = Readonly<{
  headerShown?: boolean;
  title?: string;
}>;

type RouteRegistration = Readonly<{
  name: string;
  options?: RouteOptions;
}>;

function stackRegistrations(): readonly RouteRegistration[] {
  return mockStackScreen.mock.calls.map(([registration]) => registration as RouteRegistration);
}

function tabRegistrations(): readonly RouteRegistration[] {
  return mockTabsScreen.mock.calls.map(([registration]) => registration as RouteRegistration);
}

describe('V1 compatibility regression', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('keeps the Android application id unchanged', () => {
    expect(appConfig.expo.android.package).toBe('com.projectlab.mobile');
  });

  it('keeps the four existing bottom tabs with readable labels and no parent header', () => {
    render(<TabsLayout />);

    expect(mockTabsRoot).toHaveBeenCalledWith(expect.objectContaining({
      screenOptions: expect.objectContaining({ headerShown: false }),
    }));
    expect(tabRegistrations().map(({ name, options }) => [name, options?.title])).toEqual([
      ['home', 'Ana Sayfa'],
      ['projects', 'Projeler'],
      ['learn', 'Öğren'],
      ['profile', 'Profil'],
    ]);
  });

  it('keeps nested lesson and project routes on a single readable header layer', () => {
    render(<LearnLayout />);
    expect(stackRegistrations()).toEqual(expect.arrayContaining([
      expect.objectContaining({ name: 'index', options: { title: 'Öğren' } }),
      expect.objectContaining({ name: '[lessonId]', options: { headerShown: false } }),
    ]));

    mockStackScreen.mockClear();
    render(<LessonLayout />);
    expect(stackRegistrations().map(({ name, options }) => [name, options?.title])).toEqual([
      ['index', 'Konu'],
      ['quiz/[quizId]', 'Quiz'],
      ['quiz/[quizId]/result', 'Quiz Sonucu'],
    ]);

    mockStackScreen.mockClear();
    render(<ProjectsLayout />);
    expect(stackRegistrations()).toEqual(expect.arrayContaining([
      expect.objectContaining({ name: 'index', options: { title: 'Projeler' } }),
      expect.objectContaining({ name: '[projectId]', options: { headerShown: false } }),
    ]));

    mockStackScreen.mockClear();
    render(<ProjectDetailLayout />);
    expect(stackRegistrations().map(({ name, options }) => [name, options?.title])).toEqual([
      ['index', 'Genel Bakış'],
      ['journey', 'Yolculuk'],
      ['learn', 'Öğren'],
      ['quiz', 'Quiz'],
    ]);
  });

  it('keeps Portfolio Mode headerless with working user-facing navigation', () => {
    render(<PortfolioLayout />);

    expect(mockStackRoot).toHaveBeenCalledWith(expect.objectContaining({
      screenOptions: { headerShown: false },
    }));
    expect(stackRegistrations().map(({ name }) => name)).toEqual([
      'index',
      'projects/index',
      'projects/[projectId]',
      'about',
    ]);

    const screen = render(
      <PortfolioShell activeRoute="home">
        <Text>Portföy içeriği</Text>
      </PortfolioShell>,
    );

    expect(screen.getByLabelText('Portföy navigasyonu')).toBeTruthy();
    expect(screen.getByRole('tab', { name: 'Ana Sayfa', selected: true })).toBeTruthy();
    expect(screen.queryByText('/portfolio/projects')).toBeNull();

    fireEvent.press(screen.getByText('Projeler'));
    expect(mockRouterPush).toHaveBeenCalledWith('/portfolio/projects');

    fireEvent.press(screen.getByLabelText('Kişisel moda dön'));
    expect(mockRouterReplace).toHaveBeenCalledWith('/home');
  });
});
