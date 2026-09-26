import type { Achievement, Lesson, Project, Quiz } from '@/types';

export type ContentIntegrityIssue = Readonly<{
  code: string;
  message: string;
}>;

export type ContentCollections = Readonly<{
  projects: readonly Project[];
  lessons: readonly Lesson[];
  quizzes: readonly Quiz[];
  achievements: readonly Achievement[];
}>;

function findDuplicateIds(label: string, items: readonly Readonly<{ id: string }>[]) {
  const seen = new Set<string>();
  const duplicateIds = new Set<string>();

  for (const item of items) {
    if (seen.has(item.id)) duplicateIds.add(item.id);
    seen.add(item.id);
  }

  return [...duplicateIds].map((id) => ({
    code: 'duplicate-id',
    message: `${label} içinde yinelenen ID: "${id}".`,
  }));
}

export function validateContentIntegrity(content: ContentCollections): ContentIntegrityIssue[] {
  const issues: ContentIntegrityIssue[] = [
    ...findDuplicateIds('Proje registry', content.projects),
    ...findDuplicateIds('Ders registry', content.lessons),
    ...findDuplicateIds('Quiz registry', content.quizzes),
    ...findDuplicateIds('Başarım registry', content.achievements),
  ];
  const projectsById = new Map(content.projects.map((project) => [project.id, project]));
  const lessonsById = new Map(content.lessons.map((lesson) => [lesson.id, lesson]));
  const quizzesById = new Map(content.quizzes.map((quiz) => [quiz.id, quiz]));

  for (const project of content.projects) {
    if (!project.stages.some((stage) => stage.id === project.currentStageId)) {
      issues.push({
        code: 'missing-current-stage',
        message: `"${project.id}" projesinin currentStageId değeri bir aşamaya karşılık gelmiyor.`,
      });
    }

    issues.push(...findDuplicateIds(`"${project.id}" proje aşamaları`, project.stages));

    for (const lessonId of project.lessonIds) {
      const lesson = lessonsById.get(lessonId);
      if (!lesson) {
        issues.push({ code: 'missing-lesson', message: `"${project.id}" projesi bulunmayan "${lessonId}" dersine bağlı.` });
      } else if (!lesson.projectIds.includes(project.id)) {
        issues.push({ code: 'lesson-project-mismatch', message: `"${project.id}" ve "${lessonId}" ilişkisi karşılıklı değil.` });
      }
    }

    for (const quizId of project.quizIds) {
      const quiz = quizzesById.get(quizId);
      if (!quiz) {
        issues.push({ code: 'missing-quiz', message: `"${project.id}" projesi bulunmayan "${quizId}" quizine bağlı.` });
      } else if (quiz.projectId !== project.id) {
        issues.push({ code: 'quiz-project-mismatch', message: `"${project.id}" ve "${quizId}" ilişkisi karşılıklı değil.` });
      }
    }

    for (const stage of project.stages) {
      for (const lessonId of stage.lessonIds ?? []) {
        if (!lessonsById.has(lessonId)) {
          issues.push({ code: 'missing-stage-lesson', message: `"${project.id}/${stage.id}" aşaması bulunmayan "${lessonId}" dersine bağlı.` });
        }
      }
    }
  }

  for (const lesson of content.lessons) {
    issues.push(...findDuplicateIds(`"${lesson.id}" içerik blokları`, lesson.content));

    for (const projectId of lesson.projectIds) {
      const project = projectsById.get(projectId);
      if (!project) {
        issues.push({ code: 'missing-project', message: `"${lesson.id}" dersi bulunmayan "${projectId}" projesine bağlı.` });
      } else if (!project.lessonIds.includes(lesson.id)) {
        issues.push({ code: 'unregistered-lesson', message: `"${lesson.id}" dersi "${projectId}" projesinde kayıtlı değil.` });
      }
    }

    if (lesson.quizId) {
      const quiz = quizzesById.get(lesson.quizId);
      if (!quiz) {
        issues.push({ code: 'missing-quiz', message: `"${lesson.id}" dersi bulunmayan "${lesson.quizId}" quizine bağlı.` });
      } else if (quiz.lessonId !== lesson.id) {
        issues.push({ code: 'quiz-lesson-mismatch', message: `"${lesson.id}" ve "${lesson.quizId}" ilişkisi karşılıklı değil.` });
      }
    }
  }

  for (const quiz of content.quizzes) {
    const project = projectsById.get(quiz.projectId);
    const lesson = lessonsById.get(quiz.lessonId);

    if (!project) issues.push({ code: 'missing-project', message: `"${quiz.id}" quizi bulunmayan "${quiz.projectId}" projesine bağlı.` });
    if (!lesson) issues.push({ code: 'missing-lesson', message: `"${quiz.id}" quizi bulunmayan "${quiz.lessonId}" dersine bağlı.` });
    if (lesson && !lesson.projectIds.includes(quiz.projectId)) {
      issues.push({ code: 'quiz-project-mismatch', message: `"${quiz.id}" quizi ile "${quiz.lessonId}" dersi aynı projeye bağlı değil.` });
    }
    if (quiz.questions.length < 3 || quiz.questions.length > 5) {
      issues.push({ code: 'invalid-question-count', message: `"${quiz.id}" quizi 3–5 soru içermeli.` });
    }

    issues.push(...findDuplicateIds(`"${quiz.id}" soruları`, quiz.questions));
    for (const question of quiz.questions) {
      issues.push(...findDuplicateIds(`"${quiz.id}/${question.id}" seçenekleri`, question.options));
      if (!question.options.some((option) => option.id === question.correctOptionId)) {
        issues.push({ code: 'missing-correct-option', message: `"${quiz.id}/${question.id}" doğru cevabı seçeneklerde bulunmuyor.` });
      }
      if (question.type === 'true-false' && question.options.length !== 2) {
        issues.push({ code: 'invalid-true-false-options', message: `"${quiz.id}/${question.id}" doğru/yanlış sorusu iki seçenek içermeli.` });
      }
    }
  }

  return issues;
}

export function assertContentIntegrity(content: ContentCollections): void {
  const issues = validateContentIntegrity(content);
  if (issues.length > 0) {
    throw new Error(issues.map((issue) => issue.message).join('\n'));
  }
}

