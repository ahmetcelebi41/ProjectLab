import { getLevelProgress } from './level';

describe('getLevelProgress', () => {
  it.each([
    [0, 1],
    [9, 1],
    [10, 2],
    [89, 9],
    [90, 10],
  ])('%i XP icin level %i dondurur', (xp, expectedLevel) => {
    expect(getLevelProgress(xp).level).toBe(expectedLevel);
  });
});
