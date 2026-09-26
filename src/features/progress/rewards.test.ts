import { designTokensQuiz } from '@/data/quizzes';

import { getQuizAwardXp, getQuizScoreBonusXp } from './rewards';

describe('quiz rewards', () => {
  it.each([
    [6, 10, 0],
    [3, 4, 10],
    [9, 10, 20],
    [10, 10, 30],
  ])('%i/%i skoruna %i bonus XP verir', (correct, total, expected) => {
    expect(getQuizScoreBonusXp(correct, total)).toBe(expected);
  });

  it('quiz taban XP ve başarı bonusunu tek ödülde birleştirir', () => {
    expect(getQuizAwardXp(designTokensQuiz, 3)).toBe(40);
  });
});
