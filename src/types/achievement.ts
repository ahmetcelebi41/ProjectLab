export type AchievementId =
  | 'first-project'
  | 'project-explorer'
  | 'first-lesson'
  | 'lesson-collector'
  | 'first-quiz'
  | 'perfect-quiz';

export type AchievementRule =
  | Readonly<{ type: 'visited-projects'; count: number }>
  | Readonly<{ type: 'completed-lessons'; count: number }>
  | Readonly<{ type: 'completed-quizzes'; count: number }>
  | Readonly<{ type: 'perfect-quizzes'; count: number }>;

export type Achievement = Readonly<{
  id: AchievementId;
  title: string;
  description: string;
  rule: AchievementRule;
}>;
