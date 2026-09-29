import { render } from '@testing-library/react-native';
import { StyleSheet, View } from 'react-native';

import { PortfolioHomeScreen } from './PortfolioHomeScreen';

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn() },
}));

describe('PortfolioHomeScreen content flow', () => {
  it('renders all portfolio projects in source order before the remaining sections', () => {
    const screen = render(<PortfolioHomeScreen />);
    const projectLabels = screen
      .getAllByRole('link')
      .map((element) => element.props.accessibilityLabel)
      .filter((label): label is string => typeof label === 'string' && /^(ELORA|NOVA|Moonphase),/.test(label));

    expect(projectLabels.map((label) => label.split(',')[0])).toEqual([
      'ELORA',
      'NOVA',
      'Moonphase',
    ]);
    expect(screen.getByText('Nasıl Çalışıyorum')).toBeTruthy();
    expect(screen.getByText('Yetkinlikler')).toBeTruthy();
    expect(screen.getAllByText('Hakkımda').length).toBeGreaterThan(0);
    expect(screen.getByText('Projeler Üzerinden Bağlantı Kur')).toBeTruthy();
  });

  it('lets project cards use intrinsic height inside the wrapping grid', () => {
    const screen = render(<PortfolioHomeScreen />);
    const eloraLink = screen.getAllByRole('link').find(
      (element) => element.props.accessibilityLabel?.startsWith('ELORA,'),
    );
    const cardSurface = eloraLink?.findAllByType(View)[0];

    expect(cardSurface).toBeDefined();
    expect(StyleSheet.flatten(cardSurface?.props.style)).not.toHaveProperty('height');
  });
});
