import type { Href } from 'expo-router';

import { getLessonById, getProjectById, getQuizById, lessons } from '@/data';
import { isLessonCompleted } from '@/features/progress/lessonProgress';
import { getQuizAttemptScore } from '@/features/quiz/quizAttempts';
import type { LessonProgress, ProjectProgress, QuizAttempt } from '@/types';

export type ContinueActivity = Readonly<{
  typeLabel: 'Ders' | 'Quiz' | 'Proje';
  title: string;
  description: string;
  action: string;
  href: Href;
  occurredAt?: string;
}>;

export type LearningSummary = Readonly<{
  eyebrow: string;
  title: string;
  description: string;
  occurredAt: string;
}>;

type TimedContinueActivity = ContinueActivity & Readonly<{ occurredAt: string }>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function validDate(value: unknown): string | undefined {
  return typeof value === 'string' && Number.isFinite(Date.parse(value)) ? value : undefined;
}

export function formatActivityTime(value: string): string | undefined {
  if (!validDate(value)) return undefined;

  return new Intl.DateTimeFormat('tr-TR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function getContinueActivity(activity: unknown): ContinueActivity | null {
  if (!isRecord(activity)) return null;

  const occurredAt = validDate(activity.occurredAt);

  if (activity.type === 'lesson' && typeof activity.lessonId === 'string') {
    const lesson = getLessonById(activity.lessonId);
    if (!lesson) return null;

    return {
      typeLabel: 'Ders',
      title: lesson.title,
      description: lesson.summary,
      action: 'Derse devam et',
      href: `/learn/${lesson.id}` as Href,
      occurredAt,
    };
  }

  if (activity.type === 'quiz' && typeof activity.quizId === 'string') {
    const quiz = getQuizById(activity.quizId);
    if (!quiz) return null;

    return {
      typeLabel: 'Quiz',
      title: quiz.title,
      description: quiz.summary,
      action: 'Quize devam et',
      href: `/learn/${quiz.lessonId}/quiz/${quiz.id}` as Href,
      occurredAt,
    };
  }

  // Project activity is accepted defensively for in-memory/newer progress data.
  // V1.1 persistence and schema remain untouched.
  if (activity.type === 'project' && typeof activity.projectId === 'string') {
    const project = getProjectById(activity.projectId);
    if (!project) return null;

    return {
      typeLabel: 'Proje',
      title: project.title,
      description: project.summary,
      action: 'Projeye devam et',
      href: `/projects/${project.id}` as Href,
      occurredAt,
    };
  }

  return null;
}

export function getLatestProjectContinueActivity(
  progress: readonly ProjectProgress[],
): ContinueActivity | null {
  return progress
    .flatMap((item) => {
      const occurredAt = validDate(item.lastVisitedAt);
      const activity = occurredAt
        ? getContinueActivity({ type: 'project', projectId: item.projectId, occurredAt })
        : null;
      return activity?.occurredAt ? [activity as TimedContinueActivity] : [];
    })
    .sort((left, right) => Date.parse(right.occurredAt) - Date.parse(left.occurredAt))[0] ?? null;
}

export function getLatestContinueActivity(
  lastActivity: unknown,
  projectProgress: readonly ProjectProgress[],
): ContinueActivity | null {
  const contentActivity = getContinueActivity(lastActivity);
  const projectActivity = getLatestProjectContinueActivity(projectProgress);

  return [contentActivity, projectActivity]
    .filter((activity): activity is TimedContinueActivity => Boolean(activity?.occurredAt))
    .sort((left, right) => (
      Date.parse(right.occurredAt) - Date.parse(left.occurredAt)
    ))[0] ?? null;
}

export function getLatestLearningSummary(
  lessonProgress: readonly LessonProgress[],
  quizHistory: readonly QuizAttempt[],
): LearningSummary | null {
  const completedLessons = lessons.flatMap((lesson) => {
    if (!isLessonCompleted(lessonProgress, lesson.id)) return [];
    const progress = lessonProgress.find((item) => item.lessonId === lesson.id);
    const completedAt = validDate(progress?.completedAt);

    return completedAt ? [{ lesson, completedAt }] : [];
  });
  const latestLesson = completedLessons.sort((left, right) => (
    Date.parse(right.completedAt) - Date.parse(left.completedAt)
  ))[0];

  const latestQuiz = quizHistory
    .flatMap((attempt) => {
      const quiz = getQuizById(attempt.quizId);
      const completedAt = validDate(attempt.completedAt);
      return quiz && completedAt ? [{ quiz, attempt, completedAt }] : [];
    })
    .sort((left, right) => Date.parse(right.completedAt) - Date.parse(left.completedAt))[0];

  if (
    latestQuiz
    && (!latestLesson || Date.parse(latestQuiz.completedAt) > Date.parse(latestLesson.completedAt))
  ) {
    const score = getQuizAttemptScore(latestQuiz.attempt);
    return {
      eyebrow: 'SON QUIZ DENEMESİ',
      title: latestQuiz.quiz.title,
      description: `%${score.score} başarı · ${score.correctCount}/${latestQuiz.attempt.questionCount} doğru`,
      occurredAt: latestQuiz.completedAt,
    };
  }

  return latestLesson ? {
    eyebrow: 'SON TAMAMLANAN DERS',
    title: latestLesson.lesson.title,
    description: 'Dersi tamamladın ve öğrenme ilerlemene ekledin.',
    occurredAt: latestLesson.completedAt,
  } : null;
}
