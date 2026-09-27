import {
  getContinueActivity,
  getLatestContinueActivity,
  getLatestLearningSummary,
} from './homeProgress';

describe('home progress presentation', () => {
  it.each([
    [
      { type: 'lesson', lessonId: 'design-tokens', occurredAt: '2026-09-27T10:00:00.000Z' },
      'Ders',
      'Design Token ile Tutarlı Arayüz',
      '/learn/design-tokens',
    ],
    [
      { type: 'quiz', quizId: 'design-tokens-quiz', occurredAt: '2026-09-27T10:00:00.000Z' },
      'Quiz',
      'Design Token Kontrolü',
      '/learn/design-tokens/quiz/design-tokens-quiz',
    ],
    [
      { type: 'project', projectId: 'nova', occurredAt: '2026-09-27T10:00:00.000Z' },
      'Proje',
      'NOVA',
      '/projects/nova',
    ],
  ])('resolves known activity %# without exposing its id', (activity, typeLabel, title, href) => {
    const result = getContinueActivity(activity);

    expect(result).toMatchObject({ typeLabel, title, href });
  });

  it.each([
    null,
    { type: 'lesson', lessonId: 'missing', occurredAt: '2026-09-27T10:00:00.000Z' },
    { type: 'quiz', quizId: '/learn/internal-route', occurredAt: 'invalid' },
    { type: 'project', projectId: 'missing', occurredAt: '2026-09-27T10:00:00.000Z' },
    { type: 'unknown', target: '/projects/nova' },
  ])('hides invalid activity safely: %p', (activity) => {
    expect(getContinueActivity(activity)).toBeNull();
  });

  it.each([
    [
      { type: 'lesson', lessonId: 'design-tokens', occurredAt: '2026-09-27T11:00:00.000Z' },
      [{ projectId: 'nova', lastVisitedAt: '2026-09-27T10:00:00.000Z' }],
      'Ders',
    ],
    [
      { type: 'lesson', lessonId: 'design-tokens', occurredAt: '2026-09-27T09:00:00.000Z' },
      [{ projectId: 'nova', lastVisitedAt: '2026-09-27T10:00:00.000Z' }],
      'Proje',
    ],
    [
      { type: 'quiz', quizId: 'design-tokens-quiz', occurredAt: '2026-09-27T11:00:00.000Z' },
      [{ projectId: 'nova', lastVisitedAt: '2026-09-27T10:00:00.000Z' }],
      'Quiz',
    ],
    [
      { type: 'lesson', lessonId: 'design-tokens', occurredAt: 'invalid' },
      [{ projectId: 'nova', lastVisitedAt: '2026-09-27T10:00:00.000Z' }],
      'Proje',
    ],
    [
      { type: 'lesson', lessonId: 'design-tokens', occurredAt: '2026-09-27T11:00:00.000Z' },
      [{ projectId: 'nova', lastVisitedAt: 'invalid' }],
      'Ders',
    ],
  ] as const)(
    'selects the newest valid continue candidate %#',
    (lastActivity, projects, expectedType) => {
      expect(getLatestContinueActivity(lastActivity, projects)?.typeLabel).toBe(expectedType);
    },
  );

  it('ignores all candidates when their timestamps are invalid', () => {
    expect(getLatestContinueActivity(
      { type: 'quiz', quizId: 'design-tokens-quiz', occurredAt: 'invalid' },
      [{ projectId: 'nova', lastVisitedAt: 'also-invalid' }],
    )).toBeNull();
  });

  it('falls back to an older valid project when a newer project target is unknown', () => {
    expect(getLatestContinueActivity(null, [
      {
        projectId: 'missing',
        lastVisitedAt: '2026-09-27T11:00:00.000Z',
      } as unknown as { projectId: 'nova'; lastVisitedAt: string },
      { projectId: 'nova', lastVisitedAt: '2026-09-27T10:00:00.000Z' },
    ])).toMatchObject({ typeLabel: 'Proje', title: 'NOVA', href: '/projects/nova' });
  });

  it('uses the latest existing learning event and quiz score helper output', () => {
    expect(getLatestLearningSummary(
      [{ lessonId: 'design-tokens', completedAt: '2026-09-27T09:00:00.000Z' }],
      [{
        quizId: 'design-tokens-quiz',
        completedAt: '2026-09-27T10:00:00.000Z',
        correctAnswerCount: 2,
        questionCount: 3,
        wrongQuestionIds: ['design-tokens-q3'],
      }],
    )).toMatchObject({
      eyebrow: 'SON QUIZ DENEMESİ',
      title: 'Design Token Kontrolü',
      description: '%67 başarı · 2/3 doğru',
    });
  });

  it('selects the latest learning timestamp independently of array order', () => {
    expect(getLatestLearningSummary([], [
      {
        quizId: 'design-tokens-quiz',
        completedAt: '2026-09-27T11:00:00.000Z',
        correctAnswerCount: 3,
        questionCount: 3,
        wrongQuestionIds: [],
      },
      {
        quizId: 'api-contracts-quiz',
        completedAt: '2026-09-27T09:00:00.000Z',
        correctAnswerCount: 1,
        questionCount: 3,
        wrongQuestionIds: ['api-contracts-q2', 'api-contracts-q3'],
      },
    ])).toMatchObject({
      title: 'Design Token Kontrolü',
      occurredAt: '2026-09-27T11:00:00.000Z',
    });
  });

  it('selects a newer completed lesson over an older quiz attempt', () => {
    expect(getLatestLearningSummary(
      [
        { lessonId: 'api-contracts', completedAt: '2026-09-27T11:00:00.000Z' },
        { lessonId: 'design-tokens', completedAt: '2026-09-27T08:00:00.000Z' },
      ],
      [{
        quizId: 'design-tokens-quiz',
        completedAt: '2026-09-27T10:00:00.000Z',
        correctAnswerCount: 3,
        questionCount: 3,
        wrongQuestionIds: [],
      }],
    )).toMatchObject({
      eyebrow: 'SON TAMAMLANAN DERS',
      title: 'API Contract Tasarlamak',
      occurredAt: '2026-09-27T11:00:00.000Z',
    });
  });
});
