import { getLessonById } from '@/data/lessons';
import { getQuizById } from '@/data/quizzes';
import type { Quiz, QuizAnswer } from '@/types';

export type QuizScore = Readonly<{
  correctAnswerCount: number;
  incorrectAnswerCount: number;
  percentage: number;
}>;

export function resolveQuiz(lessonId?: string, quizId?: string): Quiz | undefined {
  if (!lessonId || !quizId) return undefined;

  const lesson = getLessonById(lessonId);
  const quiz = getQuizById(quizId);

  if (!lesson || !quiz || quiz.lessonId !== lesson.id || lesson.quizId !== quiz.id) {
    return undefined;
  }

  return quiz;
}

export function countCorrectAnswers(quiz: Quiz, answers: readonly QuizAnswer[]): number {
  const validAnswers = getValidQuizAnswers(quiz, answers);
  const answersByQuestionId = new Map(
    validAnswers.map((answer) => [answer.questionId, answer.selectedOptionId]),
  );

  return quiz.questions.reduce(
    (total, question) => total + Number(answersByQuestionId.get(question.id) === question.correctOptionId),
    0,
  );
}

export function getQuizScore(quiz: Quiz, answers: readonly QuizAnswer[]): QuizScore {
  const correctAnswerCount = countCorrectAnswers(quiz, answers);

  return {
    correctAnswerCount,
    incorrectAnswerCount: quiz.questions.length - correctAnswerCount,
    percentage: Math.round((correctAnswerCount / quiz.questions.length) * 100),
  };
}

export function getValidQuizAnswers(quiz: Quiz, answers: readonly QuizAnswer[]): QuizAnswer[] {
  const latestAnswers = new Map(answers.map((answer) => [answer.questionId, answer]));

  return quiz.questions.flatMap((question) => {
    const answer = latestAnswers.get(question.id);
    const optionExists = question.options.some((option) => option.id === answer?.selectedOptionId);

    return answer && optionExists ? [answer] : [];
  });
}
