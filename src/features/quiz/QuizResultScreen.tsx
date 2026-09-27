import type { Href } from 'expo-router';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Progress } from '@/components/ui/Progress';
import { Screen } from '@/components/ui/Screen';
import { Typography } from '@/components/ui/Typography';
import { useProgressStore } from '@/stores/progressStore';
import { colors, layout, radius, spacing } from '@/theme/tokens';

import {
  createQuizAttempt,
  getBestQuizScore,
  getLastQuizAttempt,
  getLastQuizScore,
  getQuizAttemptScore,
  getQuizRetryQuestions,
} from './quizAttempts';
import { resolveQuiz } from './quizUtils';

type Props = {
  lessonId?: string;
  quizId?: string;
};

function LoadingResult() {
  return (
    <Screen contentContainerStyle={[styles.readingColumn, styles.screen]} edges={['top', 'bottom']}>
      <View style={[styles.skeleton, styles.loadingTitle]} />
      <View style={[styles.skeleton, styles.loadingScore]} />
      <View style={[styles.skeleton, styles.loadingCard]} />
    </Screen>
  );
}

function ResultState({ lessonId, missingQuiz }: { lessonId?: string; missingQuiz: boolean }) {
  return (
    <Screen contentContainerStyle={styles.centeredState} edges={['top', 'bottom']}>
      <Card accessibilityLiveRegion="polite" style={styles.stateCard}>
        <Badge variant={missingQuiz ? 'error' : 'warning'}>
          {missingQuiz ? 'Quiz bulunamadı' : 'Sonuç henüz hazır değil'}
        </Badge>
        <View style={styles.copy}>
          <Typography accessibilityRole="header" variant="h2">
            {missingQuiz ? 'Bu quiz bağlantısı geçerli değil' : 'Önce quizi tamamla'}
          </Typography>
          <Typography color="textSecondary" style={styles.bodyLine}>
            {missingQuiz
              ? 'Ders ve quiz eşleşmesi bulunamadı.'
              : 'Sonuç ekranı yalnız tüm sorular tamamlandıktan sonra açılır.'}
          </Typography>
        </View>
        <View style={styles.actionRow}>
          {lessonId && !missingQuiz ? (
            <Button onPress={() => router.replace(`/learn/${lessonId}` as Href)} size="large" variant="secondary">
              Derse Dön
            </Button>
          ) : null}
          <Button onPress={() => router.replace('/learn')} size="large">Öğren’e Dön</Button>
        </View>
      </Card>
    </Screen>
  );
}

function evaluationFor(percentage: number): string {
  if (percentage === 100) return 'Tüm soruları doğru yanıtladın.';
  if (percentage >= 67) return 'Konuyu büyük ölçüde pekiştirdin.';
  return 'Yanlış cevaplarını inceleyip quizi yeniden çözebilirsin.';
}

export function QuizResultScreen({ lessonId, quizId }: Props) {
  const quiz = resolveQuiz(lessonId, quizId);
  const hasHydrated = useProgressStore((state) => state.hasHydrated);
  const savedProgress = useProgressStore((state) =>
    quiz ? state.quizzes.find((item) => item.quizId === quiz.id) : undefined,
  );
  const quizHistory = useProgressStore((state) => state.quizHistory);

  if (!quiz) return <ResultState lessonId={lessonId} missingQuiz />;
  if (!hasHydrated) return <LoadingResult />;
  const fallbackAttempt = savedProgress?.completedAt
    ? createQuizAttempt(quiz, savedProgress.answers, savedProgress.completedAt)
    : undefined;
  const attemptHistory = quizHistory.some((attempt) => attempt.quizId === quiz.id)
    ? quizHistory
    : fallbackAttempt
      ? [fallbackAttempt]
      : [];
  const lastAttempt = getLastQuizAttempt(attemptHistory, quiz.id);
  if (!savedProgress?.completedAt || !lastAttempt) {
    return <ResultState lessonId={lessonId} missingQuiz={false} />;
  }

  const lastScore = getQuizAttemptScore(lastAttempt);
  const lastFullScore = getLastQuizScore(attemptHistory, quiz.id);
  const bestScore = getBestQuizScore(attemptHistory, quiz.id) ?? lastFullScore;
  const incorrectQuestions = getQuizRetryQuestions(quiz, lastAttempt);
  const incorrectQuestionIds = new Set(incorrectQuestions.map((question) => question.id));
  const attemptedQuestionIds = new Set(savedProgress.answers.map((answer) => answer.questionId));
  const resultQuestions = lastAttempt.attemptType === 'retry'
    ? quiz.questions.filter((question) => attemptedQuestionIds.has(question.id))
    : quiz.questions;
  const firstAttempt = attemptHistory.find((attempt) => attempt.quizId === quiz.id);
  const awardedXp = firstAttempt === lastAttempt ? savedProgress.awardedXp : undefined;
  const quizPath = `/learn/${quiz.lessonId}/quiz/${quiz.id}`;

  return (
    <Screen
      contentContainerStyle={[styles.readingColumn, styles.screen]}
      edges={['top', 'bottom']}
      scrollViewProps={{ contentInsetAdjustmentBehavior: 'automatic' }}
    >
      <View style={styles.hero}>
        <Badge variant={lastScore.score === 100 ? 'success' : 'info'}>
          {lastScore.score === 100 ? 'Mükemmel sonuç' : 'Quiz tamamlandı'}
        </Badge>
        <View style={styles.copy}>
          <Typography color="primary" variant="caption">QUIZ SONUCU</Typography>
          <Typography accessibilityRole="header" variant="h1">{quiz.title}</Typography>
          <Typography color="textSecondary" style={styles.bodyLine} variant="bodyLarge">
            {evaluationFor(lastScore.score)}
          </Typography>
        </View>
      </View>

      <Card raised style={styles.scoreCard}>
        <View style={styles.scoreTop}>
          <View style={styles.scoreCopy}>
            <Typography color="textMuted" variant="caption">
              {lastAttempt.attemptType === 'retry' ? 'RETRY SONUCU' : 'SON SKOR'}
            </Typography>
            <Typography accessibilityLabel={`Yüzde ${lastScore.score}`} style={styles.percentage} variant="displayCompact">
              %{lastScore.score}
            </Typography>
          </View>
          {bestScore ? <Badge variant="primary">En iyi tam quiz: %{bestScore.score}</Badge> : null}
        </View>
        <Progress
          accessibilityLabel={`Son quiz skoru yüzde ${lastScore.score}`}
          color={lastScore.score === 100 ? 'success' : 'primary'}
          value={lastScore.score}
        />
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Typography color="success" variant="h3">{lastScore.correctCount}</Typography>
            <Typography color="textSecondary">Doğru</Typography>
          </View>
          <View style={styles.summaryItem}>
            <Typography color={lastScore.wrongCount ? 'error' : 'textMuted'} variant="h3">{lastScore.wrongCount}</Typography>
            <Typography color="textSecondary">Yanlış</Typography>
          </View>
          <View style={styles.summaryItem}>
            <Typography color={awardedXp ? 'primary' : 'textMuted'} variant="h3">+{awardedXp ?? 0}</Typography>
            <Typography color="textSecondary">Bu denemede XP</Typography>
          </View>
        </View>
        {lastFullScore && bestScore ? (
          <View style={styles.scoreComparison}>
            <Typography color="textSecondary" variant="small">
              Son tam quiz: {lastFullScore.correctCount}/{lastFullScore.correctCount + lastFullScore.wrongCount}
            </Typography>
            <Typography color="textSecondary" variant="small">
              En iyi tam quiz: {bestScore.correctCount}/{bestScore.correctCount + bestScore.wrongCount}
            </Typography>
          </View>
        ) : null}
      </Card>

      <View style={styles.reviewSection}>
        <View style={styles.copy}>
          <Typography color="primary" variant="caption">CEVAP DETAYI</Typography>
          <Typography accessibilityRole="header" variant="h2">Soruların</Typography>
        </View>
        {resultQuestions.map((question) => {
          const incorrect = incorrectQuestionIds.has(question.id);
          const questionNumber = quiz.questions.findIndex((item) => item.id === question.id) + 1;
          const correctOption = question.options.find((option) => option.id === question.correctOptionId);
          return (
            <Card
              accessibilityLabel={`Soru ${questionNumber}, ${incorrect ? 'yanlış' : 'doğru'}`}
              key={question.id}
              style={[styles.reviewCard, incorrect ? styles.incorrectCard : styles.correctCard]}
            >
              <View style={styles.questionHeading}>
                <Typography accessibilityRole="header" style={styles.questionTitle} variant="h4">
                  {questionNumber}. {question.prompt}
                </Typography>
                <Badge variant={incorrect ? 'error' : 'success'}>{incorrect ? 'Yanlış' : 'Doğru'}</Badge>
              </View>
              {correctOption ? (
                <Typography color="success">Doğru cevap: {correctOption.label}</Typography>
              ) : null}
              {question.explanation ? (
                <Typography color="textSecondary" style={styles.bodyLine}>{question.explanation}</Typography>
              ) : null}
            </Card>
          );
        })}
      </View>

      <Card style={styles.actionsCard}>
        <View style={styles.copy}>
          <Typography accessibilityRole="header" variant="h3">Sıradaki adım</Typography>
          <Typography color="textSecondary" style={styles.bodyLine}>
            {incorrectQuestions.length
              ? 'Yanlışlarını tekrar edebilir, dersi yeniden inceleyebilir veya Öğren’e dönebilirsin.'
              : 'Tüm soruları doğru yanıtladın. Öğren’e dönerek sıradaki konuya geçebilirsin.'}
          </Typography>
        </View>
        <View style={styles.actionRow}>
          {incorrectQuestions.length ? (
            <Button
              onPress={() => router.replace(
                `${quizPath}?retryAttemptAt=${encodeURIComponent(lastAttempt.completedAt)}` as Href,
              )}
              size="large"
              style={styles.actionButton}
            >
              Yanlışları Tekrarla
            </Button>
          ) : null}
          <Button
            onPress={() => router.replace(quizPath as Href)}
            size="large"
            style={styles.actionButton}
            variant="secondary"
          >
            Quizi Tekrar Çöz
          </Button>
          <Button
            onPress={() => router.replace(`/learn/${quiz.lessonId}` as Href)}
            size="large"
            style={styles.actionButton}
            variant="secondary"
          >
            Derse Dön
          </Button>
          <Button
            onPress={() => router.replace('/learn')}
            size="large"
            style={styles.actionButton}
            variant={incorrectQuestions.length ? 'ghost' : 'primary'}
          >
            Öğren’e Dön
          </Button>
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { gap: spacing.xxl },
  readingColumn: { maxWidth: layout.readingWidth.min },
  hero: { gap: spacing.lg },
  copy: { gap: spacing.xs },
  bodyLine: { lineHeight: spacing.lg },
  scoreCard: { gap: spacing.xl, padding: spacing.xl },
  scoreTop: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, justifyContent: 'space-between' },
  scoreCopy: { gap: spacing.xxs },
  percentage: { color: colors.text },
  summaryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  summaryItem: { backgroundColor: colors.surface, borderRadius: radius.md, flexGrow: 1, gap: spacing.xxs, minWidth: 120, padding: spacing.md },
  scoreComparison: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, justifyContent: 'space-between' },
  reviewSection: { gap: spacing.md },
  reviewCard: { gap: spacing.sm, padding: spacing.lg },
  correctCard: { borderColor: colors.success },
  incorrectCard: { borderColor: colors.error },
  questionHeading: { alignItems: 'flex-start', flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, justifyContent: 'space-between' },
  questionTitle: { flex: 1, minWidth: 200 },
  actionsCard: { gap: spacing.xl, padding: spacing.xl },
  actionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  actionButton: { flexGrow: 1 },
  centeredState: { justifyContent: 'center' },
  stateCard: { alignSelf: 'center', gap: spacing.xl, maxWidth: layout.readingWidth.min, padding: spacing.xl, width: '100%' },
  skeleton: { backgroundColor: colors.surfaceRaised, borderRadius: radius.md },
  loadingTitle: { height: spacing.xxxxl, width: '75%' },
  loadingScore: { height: 180, width: '100%' },
  loadingCard: { height: 140, width: '100%' },
});
