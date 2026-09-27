import { render } from '@testing-library/react-native';

import type { ProjectStage } from '@/types';

import {
  formatProjectStageDate,
  getOrderedProjectStages,
  getUniqueTechnologies,
  ProjectLearningList,
  ProjectMilestoneList,
  ProjectTechnologyList,
} from './ProjectDetailComponents';

const stages = [
  {
    id: 'release',
    order: 3,
    title: 'Yayın',
    summary: 'Son doğrulamalar tamamlandı.',
    status: 'not-started',
  },
  {
    id: 'discovery',
    order: 1,
    title: 'Keşif',
    summary: 'İhtiyaçlar belirlendi.',
    status: 'completed',
  },
  {
    id: 'development',
    order: 2,
    title: 'Geliştirme',
    summary: 'Ortak bileşenler geliştiriliyor.',
    status: 'in-progress',
  },
] as const satisfies readonly ProjectStage[];

describe('project detail shared components', () => {
  it('orders timeline data chronologically without mutating project data', () => {
    expect(getOrderedProjectStages(stages).map((stage) => stage.id)).toEqual([
      'discovery',
      'development',
      'release',
    ]);
    expect(stages.map((stage) => stage.id)).toEqual(['release', 'discovery', 'development']);
  });

  it('renders the shared milestone list in order with readable statuses', () => {
    const screen = render(<ProjectMilestoneList stages={stages} />);
    const titles = screen.getAllByRole('header').map((item) => item.props.children);

    expect(titles).toEqual(['Keşif', 'Geliştirme', 'Yayın']);
    expect(screen.getByText('Tamamlandı')).toBeTruthy();
    expect(screen.getByText('Devam Ediyor')).toBeTruthy();
    expect(screen.getByText('Henüz Başlanmadı')).toBeTruthy();
    expect(screen.getByText('1/3 kilometre taşı tamamlandı')).toBeTruthy();
    expect(screen.queryByText('İhtiyaçlar belirlendi.')).toBeNull();
  });

  it('safely omits missing optional detail content', () => {
    const learningScreen = render(<ProjectLearningList />);
    const technologyScreen = render(<ProjectTechnologyList />);
    const milestoneScreen = render(<ProjectMilestoneList />);

    expect(learningScreen.queryByLabelText('Bu projede öğrenilenler')).toBeNull();
    expect(technologyScreen.queryByLabelText('Projede kullanılan teknolojiler')).toBeNull();
    expect(milestoneScreen.queryByLabelText('Proje kilometre taşları')).toBeNull();
    expect(formatProjectStageDate()).toBeUndefined();
    expect(formatProjectStageDate('geçersiz-tarih')).toBeUndefined();
  });

  it('renders long learning and technology content without truncating the value', () => {
    const longLearning = 'Uzun proje metinleri küçük ekranlarda anlamını kaybetmeden satırlara ayrılmalı ve içerik alanının dışına taşmamalıdır.'.repeat(3);
    const screen = render(
      <>
        <ProjectLearningList learnings={[longLearning]} />
        <ProjectTechnologyList technologies={['Cloudflare Workers']} />
      </>,
    );

    expect(screen.getByText(longLearning)).toBeTruthy();
    expect(screen.getByText('Cloudflare Workers')).toBeTruthy();
  });

  it('omits blank technologies and displays duplicate names only once', () => {
    const technologies = ['TypeScript', 'typescript', ' TypeScript ', '', 'Cloudflare Workers'];
    const screen = render(<ProjectTechnologyList technologies={technologies} />);

    expect(getUniqueTechnologies(technologies)).toEqual(['TypeScript', 'Cloudflare Workers']);
    expect(screen.getAllByText('TypeScript')).toHaveLength(1);
    expect(screen.queryByText('typescript')).toBeNull();
    expect(screen.getByText('Cloudflare Workers')).toBeTruthy();
  });
});
