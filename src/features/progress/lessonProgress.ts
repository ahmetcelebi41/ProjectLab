import type { LessonId, LessonProgress } from '@/types';

export function isLessonCompleted(
  progress: readonly LessonProgress[],
  lessonId: string,
): boolean {
  return progress.some((item) => item.lessonId === lessonId && Boolean(item.completedAt));
}

export function getTopicProgressPercentage(
  lessonIds: readonly LessonId[],
  progress: readonly LessonProgress[],
): number {
  const uniqueLessonIds = [...new Set(lessonIds)];
  if (uniqueLessonIds.length === 0) return 0;

  const completedCount = uniqueLessonIds.filter((lessonId) => (
    isLessonCompleted(progress, lessonId)
  )).length;

  return Math.round((completedCount / uniqueLessonIds.length) * 100);
}
