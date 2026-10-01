import type { Href } from 'expo-router';

import { lessonsById, projectsById, quizzesById } from '@/data';
import type { ActivityEvent } from '@/types';

export type ActivityPresentation = Readonly<{
  detail?: string;
  entityName: string;
  href?: Href;
  icon: string;
  title: string;
  typeLabel: string;
}>;

export type ActivityGroup = Readonly<{
  label: 'Bugün' | 'Dün' | 'Son 7 Gün' | 'Daha Eski';
  events: readonly ActivityEvent[];
}>;

function scoreDetail(event: ActivityEvent): string | undefined {
  const correct = event.metadata?.correctAnswerCount;
  const total = event.metadata?.questionCount;

  return Number.isInteger(correct) && Number.isInteger(total) && Number(total) > 0
    ? `${correct}/${total} doğru`
    : undefined;
}

export function getActivityPresentation(event: ActivityEvent): ActivityPresentation {
  if (event.type === 'lesson_completed') {
    const lesson = lessonsById[event.entityId as keyof typeof lessonsById];
    return {
      entityName: lesson?.title ?? 'Artık mevcut olmayan ders',
      ...(lesson ? { href: `/learn/${lesson.id}` as Href } : {}),
      icon: '✓',
      title: 'Ders tamamlandı',
      typeLabel: 'Ders',
    };
  }

  if (event.type === 'quiz_completed' || event.type === 'quiz_retry') {
    const quiz = quizzesById[event.entityId as keyof typeof quizzesById];
    const detail = scoreDetail(event);
    return {
      ...(detail ? { detail } : {}),
      entityName: quiz?.title ?? 'Artık mevcut olmayan quiz',
      ...(quiz ? { href: `/learn/${quiz.lessonId}/quiz/${quiz.id}` as Href } : {}),
      icon: event.type === 'quiz_retry' ? '↻' : '✓',
      title: event.type === 'quiz_retry' ? 'Quiz tekrarlandı' : 'Quiz tamamlandı',
      typeLabel: event.type === 'quiz_retry' ? 'Quiz tekrarı' : 'Quiz',
    };
  }

  const project = projectsById[event.entityId as keyof typeof projectsById];
  const milestoneId = typeof event.metadata?.milestoneId === 'string'
    ? event.metadata.milestoneId
    : undefined;
  const milestone = milestoneId
    ? project?.stages.find((stage) => stage.id === milestoneId)
    : undefined;

  return {
    ...(milestone ? { detail: milestone.title } : {}),
    entityName: project?.title ?? 'Artık mevcut olmayan proje',
    ...(project ? { href: `/projects/${project.id}` as Href } : {}),
    icon: '◆',
    title: 'Projede ilerleme kaydedildi',
    typeLabel: 'Proje',
  };
}

export function sortActivityEvents(events: readonly ActivityEvent[]): readonly ActivityEvent[] {
  return [...events]
    .filter((event) => Number.isFinite(event.timestamp))
    .sort((left, right) => right.timestamp - left.timestamp);
}

function localDayStart(timestamp: number): number {
  const date = new Date(timestamp);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

function localDayOffset(timestamp: number, days: number): number {
  const date = new Date(timestamp);
  date.setDate(date.getDate() + days);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

export function groupActivityEvents(
  events: readonly ActivityEvent[],
  now: number = Date.now(),
): readonly ActivityGroup[] {
  const today = localDayStart(now);
  const yesterday = localDayOffset(today, -1);
  const sevenDayStart = localDayOffset(today, -6);
  const groups: Record<ActivityGroup['label'], ActivityEvent[]> = {
    Bugün: [],
    Dün: [],
    'Son 7 Gün': [],
    'Daha Eski': [],
  };

  sortActivityEvents(events).forEach((event) => {
    const eventDay = localDayStart(event.timestamp);
    const label = eventDay === today
      ? 'Bugün'
      : eventDay === yesterday
        ? 'Dün'
        : eventDay >= sevenDayStart && eventDay < today
          ? 'Son 7 Gün'
          : 'Daha Eski';
    groups[label].push(event);
  });

  return (Object.entries(groups) as [ActivityGroup['label'], ActivityEvent[]][])
    .filter(([, groupedEvents]) => groupedEvents.length > 0)
    .map(([label, groupedEvents]) => ({ label, events: groupedEvents }));
}

export function formatActivityDateTime(timestamp: number): string {
  if (!Number.isFinite(timestamp)) return 'Tarih bilgisi yok';

  return new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(timestamp));
}
