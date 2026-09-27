import type { LessonId, LessonProgress } from '@/types';

import { getTopicProgressPercentage, isLessonCompleted } from './lessonProgress';

const completedAt = '2026-09-27T10:00:00.000Z';
const topicLessonIds: readonly LessonId[] = ['design-tokens', 'api-contracts'];

describe('lesson progress services', () => {
  it('checks lesson completion safely by id', () => {
    const progress: readonly LessonProgress[] = [
      { lessonId: 'design-tokens', completedAt },
      { lessonId: 'api-contracts', lastBlockId: 'request-shape' },
    ];

    expect(isLessonCompleted(progress, 'design-tokens')).toBe(true);
    expect(isLessonCompleted(progress, 'api-contracts')).toBe(false);
    expect(isLessonCompleted(progress, 'unknown-lesson')).toBe(false);
  });

  it.each([
    [[], 0],
    [[{ lessonId: 'design-tokens', completedAt }], 50],
    [[
      { lessonId: 'design-tokens', completedAt },
      { lessonId: 'api-contracts', completedAt },
    ], 100],
  ] as const)('calculates 0, partial and complete topic progress', (progress, expected) => {
    expect(getTopicProgressPercentage(topicLessonIds, progress)).toBe(expected);
  });

  it('returns zero when a topic has no lessons', () => {
    expect(getTopicProgressPercentage([], [
      { lessonId: 'design-tokens', completedAt },
    ])).toBe(0);
  });

  it('does not let duplicate lesson ids distort the percentage', () => {
    expect(getTopicProgressPercentage(
      ['design-tokens', 'design-tokens', 'api-contracts'],
      [{ lessonId: 'design-tokens', completedAt }],
    )).toBe(50);
  });
});
