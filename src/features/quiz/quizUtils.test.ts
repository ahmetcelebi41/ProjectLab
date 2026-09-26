import { designTokensQuiz } from '@/data/quizzes';
import type { QuizAnswer } from '@/types';

import { getQuizScore } from './quizUtils';

describe('getQuizScore', () => {
  it('skoru ve dogru-yanlis sayilarini hesaplar', () => {
    const answers: QuizAnswer[] = designTokensQuiz.questions.map((question, index) => ({
      questionId: question.id,
      selectedOptionId: index === 0
        ? question.correctOptionId
        : question.options.find((option) => option.id !== question.correctOptionId)!.id,
    }));

    expect(getQuizScore(designTokensQuiz, answers)).toEqual({
      correctAnswerCount: 1,
      incorrectAnswerCount: designTokensQuiz.questions.length - 1,
      percentage: Math.round(100 / designTokensQuiz.questions.length),
    });
  });
});
