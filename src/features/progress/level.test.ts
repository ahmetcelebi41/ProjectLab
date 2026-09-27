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

  it.each([
    [0, 0, 10],
    [9, 90, 1],
    [10, 0, 10],
    [19, 90, 1],
    [20, 0, 10],
  ])(
    '%i XP esiginde yuzde %i ilerleme ve sonraki seviyeye %i XP dondurur',
    (xp, progressPercentage, xpToNextLevel) => {
      expect(getLevelProgress(xp)).toMatchObject({ progressPercentage, xpToNextLevel });
    },
  );

  it.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, -10])(
    '%p XP icin guvenli baslangic ilerlemesi dondurur',
    (xp) => {
      expect(getLevelProgress(xp)).toEqual({
        level: 1,
        currentLevelXp: 0,
        xpToNextLevel: 10,
        progressPercentage: 0,
      });
    },
  );
});
