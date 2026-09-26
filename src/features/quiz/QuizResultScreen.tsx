import type { Href } from 'expo-router';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Progress } from '@/components/ui/Progress';
import { Screen } from '@/components/ui/Screen';
import { Typography } from '@/components/ui/Typography';
import { getQuizAwardXp } from '@/features/progress/rewards';
import { useProgressStore } from '@/stores/progressStore';
import { colors, layout, radius, spacing } from '@/theme/tokens';

import { getQuizScore, getValidQuizAnswers, resolveQuiz } from './quizUtils';

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

  if (!quiz) return <ResultState lessonId={lessonId} missingQuiz />;
  if (!hasHydrated) return <LoadingResult />;
  const validAnswers = getValidQuizAnswers(quiz, savedProgress?.answers ?? []);
  if (!savedProgress?.completedAt || validAnswers.length !== quiz.questions.length) {
    return <ResultState lessonId={lessonId} missingQuiz={false} />;
  }

  const { correctAnswerCount, incorrectAnswerCount, percentage } = getQuizScore(
    quiz,
    validAnswers,
  );
  const answersByQuestionId = new Map(
    validAnswers.map((answer) => [answer.questionId, answer.selectedOptionId]),
  );
  const incorrectQuestions = quiz.questions.filter(
    (question) => answersByQuestionId.get(question.id) !== question.correctOptionId,
  );
  const awardedXp = savedProgress.awardedXp
    ?? getQuizAwardXp(quiz, savedProgress.bestCorrectAnswerCount);

  return (
    <Screen
      contentContainerStyle={[styles.readingColumn, styles.screen]}
      edges={['top', 'bottom']}
      scrollViewProps={{ contentInsetAdjustmentBehavior: 'automatic' }}
    >
      <View style={styles.hero}>
        <Badge variant="success">Quiz tamamlandı</Badge>
        <View style={styles.copy}>
          <Typography color="primary" variant="caption">QUIZ SONUCU</Typography>
          <Typography accessibilityRole="header" variant="h1">{quiz.title}</Typography>
          <Typography color="textSecondary" style={styles.bodyLine} variant="bodyLarge">
            {evaluationFor(percentage)}
          </Typography>
        </View>
      </View>

      <Card raised style={styles.scoreCard}>
        <View style={styles.scoreTop}>
          <View style={styles.scoreCopy}>
            <Typography color="textMuted" variant="caption">SKORUN</Typography>
            <Typography accessibilityLabel={`Yüzde ${percentage}`} style={styles.percentage} variant="displayCompact">
              %{percentage}
            </Typography>
          </View>
          <Badge variant="primary">En iyi: {savedProgress.bestCorrectAnswerCount}/{quiz.questions.length}</Badge>
        </View>
        <Progress accessibilityLabel={`Quiz skoru yüzde ${percentage}`} color="success" value={percentage} />
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Typography color="success" variant="h3">{correctAnswerCount}</Typography>
            <Typography color="textSecondary">Doğru</Typography>
          </View>
          <View style={styles.summaryItem}>
            <Typography color={incorrectAnswerCount ? 'error' : 'textMuted'} variant="h3">{incorrectAnswerCount}</Typography>
            <Typography color="textSecondary">Yanlış</Typography>
          </View>
          <View style={styles.summaryItem}>
            <Typography color="primary" variant="h3">+{awardedXp}</Typography>
            <Typography color="textSecondary">İlk tamamlama XP</Typography>
          </View>
        </View>
      </Card>

      {incorrectQuestions.length ? (
        <View style={styles.reviewSection}>
          <View style={styles.copy}>
            <Typography color="warning" variant="caption">KISA REVIEW</Typography>
            <Typography accessibilityRole="header" variant="h2">Tekrar göz at</Typography>
          </View>
          {incorrectQuestions.map((question) => {
            const correctOption = question.options.find((option) => option.id === question.correctOptionId);
            return (
              <Card key={question.id} style={styles.reviewCard}>
                <Typography accessibilityRole="header" variant="h4">{question.prompt}</Typography>
                {correctOption ? (
                  <Typography color="success">Doğru cevap: {correctOption.label}</Typography>
                ) : null}
                <Typography color="textSecondary" style={styles.bodyLine}>{question.explanation}</Typography>
              </Card>
            );
          })}
        </View>
      ) : null}

      <Card style={styles.actionsCard}>
        <View style={styles.copy}>
          <Typography accessibilityRole="header" variant="h3">Sıradaki adım</Typography>
          <Typography color="textSecondary" style={styles.bodyLine}>
            Dersi yeniden inceleyebilir, Öğren’e dönebilir veya quizi tekrar çözebilirsin.
          </Typography>
        </View>
        <View style={styles.actionRow}>
          <Button
            onPress={() => router.replace(`/learn/${quiz.lessonId}/quiz/${quiz.id}` as Href)}
            size="large"
            style={styles.actionButton}
          >
            Quizi Tekrarla
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
            variant="ghost"
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
  reviewSection: { gap: spacing.md },
  reviewCard: { gap: spacing.sm, padding: spacing.lg },
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
