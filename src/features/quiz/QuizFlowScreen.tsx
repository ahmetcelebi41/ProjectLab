import type { Href } from 'expo-router';
import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Progress } from '@/components/ui/Progress';
import { Screen } from '@/components/ui/Screen';
import { Typography } from '@/components/ui/Typography';
import { useProgressStore } from '@/stores/progressStore';
import { border, colors, layout, radius, sizing, spacing } from '@/theme/tokens';
import type { QuizAnswer, QuizQuestion } from '@/types';

import { createQuizAttempt, getQuizRetryQuestions } from './quizAttempts';
import { getValidQuizAnswers, resolveQuiz } from './quizUtils';

type Props = {
  lessonId?: string;
  quizId?: string;
  retryAttemptAt?: string;
};

type AnswerMap = Record<string, string>;
type CheckedMap = Record<string, boolean>;

function QuizLoading() {
  return (
    <Screen
      contentContainerStyle={[styles.readingColumn, styles.screen]}
      edges={['top', 'bottom']}
      scrollViewProps={{
        accessibilityLabel: 'Quiz yükleniyor',
        accessibilityState: { busy: true },
      }}
    >
      <View style={styles.header}>
        <View style={[styles.skeleton, styles.loadingBadge]} />
        <View style={[styles.skeleton, styles.loadingTitle]} />
        <View style={[styles.skeleton, styles.loadingLine]} />
      </View>
      <View style={[styles.skeleton, styles.loadingProgress]} />
      <Card style={styles.questionCard}>
        <View style={[styles.skeleton, styles.loadingQuestion]} />
        <View style={[styles.skeleton, styles.loadingOption]} />
        <View style={[styles.skeleton, styles.loadingOption]} />
        <View style={[styles.skeleton, styles.loadingOption]} />
      </Card>
    </Screen>
  );
}

function QuizNotFound({ lessonId }: Pick<Props, 'lessonId'>) {
  return (
    <Screen contentContainerStyle={styles.centeredState} edges={['top', 'bottom']}>
      <Card accessibilityLiveRegion="polite" style={styles.stateCard}>
        <Badge variant="error">Quiz bulunamadı</Badge>
        <View style={styles.copy}>
          <Typography accessibilityRole="header" variant="h2">Bu quiz bağlantısı geçerli değil</Typography>
          <Typography color="textSecondary" style={styles.bodyLine}>
            Ders ve quiz eşleşmesi bulunamadı. Öğren bölümünden geçerli bir quiz seçebilirsin.
          </Typography>
        </View>
        <View style={styles.actionRow}>
          {lessonId ? (
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

function RetryUnavailable({ lessonId, quizId }: Props) {
  const resultPath = lessonId && quizId
    ? `/learn/${lessonId}/quiz/${quizId}/result` as Href
    : '/learn' as Href;

  return (
    <Screen contentContainerStyle={styles.centeredState} edges={['top', 'bottom']}>
      <Card accessibilityLiveRegion="polite" style={styles.stateCard}>
        <Badge variant="warning">Tekrar oturumu hazır değil</Badge>
        <View style={styles.copy}>
          <Typography accessibilityRole="header" variant="h2">Yanlış sorular bulunamadı</Typography>
          <Typography color="textSecondary" style={styles.bodyLine}>
            Seçilen denemede tekrar çözülebilecek geçerli bir yanlış soru yok.
          </Typography>
        </View>
        <Button onPress={() => router.replace(resultPath)} size="large">Sonuca Dön</Button>
      </Card>
    </Screen>
  );
}

function QuestionOption({
  checked,
  option,
  question,
  selected,
  onSelect,
}: {
  checked: boolean;
  option: QuizQuestion['options'][number];
  question: QuizQuestion;
  selected: boolean;
  onSelect: () => void;
}) {
  const [focused, setFocused] = useState(false);
  const correct = option.id === question.correctOptionId;
  const incorrectSelection = checked && selected && !correct;
  const showCorrect = checked && correct;

  return (
    <Pressable
      accessibilityLabel={option.label}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected, disabled: checked }}
      disabled={checked}
      onBlur={() => setFocused(false)}
      onFocus={() => setFocused(true)}
      onPress={onSelect}
      style={({ pressed }) => [
        styles.option,
        focused && styles.optionFocused,
        selected && styles.optionSelected,
        showCorrect && styles.optionCorrect,
        incorrectSelection && styles.optionIncorrect,
        !checked && pressed && styles.optionPressed,
      ]}
    >
      <View style={[
        styles.radio,
        selected && styles.radioSelected,
        showCorrect && styles.radioCorrect,
        incorrectSelection && styles.radioIncorrect,
      ]}>
        {selected ? <View style={styles.radioDot} /> : null}
      </View>
      <Typography style={styles.optionLabel} variant="bodyLarge">{option.label}</Typography>
      {showCorrect ? <Badge variant="success">Doğru cevap</Badge> : null}
      {incorrectSelection ? <Badge variant="error">Seçimin</Badge> : null}
    </Pressable>
  );
}

function QuestionFeedback({ question, selectedOptionId }: {
  question: QuizQuestion;
  selectedOptionId: string;
}) {
  const isCorrect = selectedOptionId === question.correctOptionId;

  return (
    <Card
      accessibilityLiveRegion="polite"
      style={[styles.feedbackCard, isCorrect ? styles.feedbackCorrect : styles.feedbackIncorrect]}
    >
      <Badge variant={isCorrect ? 'success' : 'warning'}>
        {isCorrect ? 'Doğru' : 'Yanlış'}
      </Badge>
      <Typography accessibilityRole="header" variant="h4">
        {isCorrect ? 'Cevabın doğru.' : 'Doğru cevap yukarıda gösterildi.'}
      </Typography>
      {question.explanation ? (
        <Typography color="textSecondary" style={styles.bodyLine}>{question.explanation}</Typography>
      ) : null}
    </Card>
  );
}

function answersFromMap(
  questions: readonly QuizQuestion[],
  answerMap: AnswerMap,
): QuizAnswer[] {
  return questions.flatMap((question) => {
    const selectedOptionId = answerMap[question.id];
    return selectedOptionId ? [{ questionId: question.id, selectedOptionId }] : [];
  });
}

export function QuizFlowScreen({ lessonId, quizId, retryAttemptAt }: Props) {
  const quiz = resolveQuiz(lessonId, quizId);
  const hasHydrated = useProgressStore((state) => state.hasHydrated);
  const savedProgress = useProgressStore((state) =>
    quiz ? state.quizzes.find((item) => item.quizId === quiz.id) : undefined,
  );
  const quizHistory = useProgressStore((state) => state.quizHistory);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [checkedQuestions, setCheckedQuestions] = useState<CheckedMap>({});
  const [sessionReady, setSessionReady] = useState(false);
  const initialized = useRef(false);
  const submitting = useRef(false);

  useEffect(() => {
    initialized.current = false;
    submitting.current = false;
    setSessionReady(false);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setCheckedQuestions({});
  }, [lessonId, quizId, retryAttemptAt]);

  const retryAttempt = useMemo(
    () => retryAttemptAt && quiz
      ? quizHistory.find((attempt) => (
        attempt.quizId === quiz.id && attempt.completedAt === retryAttemptAt
      )) ?? (
        savedProgress?.completedAt === retryAttemptAt
          ? createQuizAttempt(quiz, savedProgress.answers, savedProgress.completedAt)
          : undefined
      )
      : undefined,
    [quiz, quizHistory, retryAttemptAt, savedProgress],
  );
  const sessionQuestions = useMemo(
    () => quiz
      ? retryAttemptAt
        ? getQuizRetryQuestions(quiz, retryAttempt)
        : quiz.questions
      : [],
    [quiz, retryAttempt, retryAttemptAt],
  );

  useEffect(() => {
    if (!hasHydrated || !quiz || initialized.current) return;
    initialized.current = true;

    if (!retryAttemptAt && !savedProgress?.completedAt) {
      const validSavedAnswers = getValidQuizAnswers(quiz, savedProgress?.answers ?? []);
      const resumedAnswers = Object.fromEntries(
        validSavedAnswers.map((answer) => [answer.questionId, answer.selectedOptionId]),
      );
      const resumedChecked = Object.fromEntries(
        validSavedAnswers.map((answer) => [answer.questionId, true]),
      );
      const lastQuestionIndex = Math.max(0, sessionQuestions.length - 1);

      setAnswers(resumedAnswers);
      setCheckedQuestions(resumedChecked);
      setCurrentQuestionIndex(Math.min(savedProgress?.currentQuestionIndex ?? 0, lastQuestionIndex));
    }

    setSessionReady(true);
  }, [hasHydrated, quiz, retryAttemptAt, savedProgress, sessionQuestions.length]);

  const currentQuestion = sessionQuestions[currentQuestionIndex];
  const selectedOptionId = currentQuestion ? answers[currentQuestion.id] : undefined;
  const isChecked = currentQuestion ? Boolean(checkedQuestions[currentQuestion.id]) : false;
  const progressValue = sessionQuestions.length
    ? ((currentQuestionIndex + 1) / sessionQuestions.length) * 100
    : 0;
  const selectedAnswers = useMemo(
    () => answersFromMap(sessionQuestions, answers),
    [answers, sessionQuestions],
  );

  if (!quiz) return <QuizNotFound lessonId={lessonId} />;
  if (hasHydrated && retryAttemptAt && sessionQuestions.length === 0) {
    return <RetryUnavailable lessonId={lessonId} quizId={quizId} />;
  }
  if (!hasHydrated || !sessionReady || !currentQuestion) return <QuizLoading />;

  const saveDraft = (nextAnswers: readonly QuizAnswer[], nextIndex: number) => {
    if (retryAttemptAt || savedProgress?.completedAt) return;

    useProgressStore.getState().saveQuizResult({
      quizId: quiz.id,
      currentQuestionIndex: nextIndex,
      answers: nextAnswers,
      bestCorrectAnswerCount: savedProgress?.bestCorrectAnswerCount ?? 0,
    });
  };

  const handleCheck = () => {
    if (!selectedOptionId || isChecked) return;
    const nextChecked = { ...checkedQuestions, [currentQuestion.id]: true };
    setCheckedQuestions(nextChecked);
    saveDraft(selectedAnswers, currentQuestionIndex);
  };

  const handleNext = () => {
    if (!isChecked) return;

    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < sessionQuestions.length) {
      setCurrentQuestionIndex(nextIndex);
      saveDraft(selectedAnswers, nextIndex);
      return;
    }

    if (submitting.current || selectedAnswers.length !== sessionQuestions.length) return;
    submitting.current = true;

    const state = useProgressStore.getState();
    const attemptType = retryAttemptAt ? 'retry' : 'full';
    const lastAttemptAt = state.quizHistory
      .filter((attempt) => attempt.quizId === quiz.id)
      .at(-1)?.completedAt;
    const now = Date.now();
    const previousTime = lastAttemptAt ? Date.parse(lastAttemptAt) : Number.NaN;
    const completedAt = new Date(
      Number.isFinite(previousTime) ? Math.max(now, previousTime + 1) : now,
    ).toISOString();
    const attempt = createQuizAttempt(quiz, selectedAnswers, completedAt, attemptType);
    if (!attempt) {
      submitting.current = false;
      return;
    }

    state.saveQuizResult({
      quizId: quiz.id,
      currentQuestionIndex: quiz.questions.length - 1,
      answers: selectedAnswers,
      bestCorrectAnswerCount: attempt.correctAnswerCount,
      completedAt,
    }, attemptType);

    router.replace(`/learn/${quiz.lessonId}/quiz/${quiz.id}/result` as Href);
  };

  const handleBack = () => {
    const previousIndex = Math.max(0, currentQuestionIndex - 1);
    setCurrentQuestionIndex(previousIndex);
    saveDraft(selectedAnswers, previousIndex);
  };

  const isLastQuestion = currentQuestionIndex === sessionQuestions.length - 1;

  return (
    <Screen
      contentContainerStyle={[styles.readingColumn, styles.screen]}
      edges={['top', 'bottom']}
      scrollViewProps={{ contentInsetAdjustmentBehavior: 'automatic' }}
    >
      <View style={styles.header}>
        <View style={styles.metaRow}>
          <Badge variant="info">Mini Quiz</Badge>
          <Typography color="textMuted" variant="caption">
            {sessionQuestions.length} soru{retryAttemptAt ? ' · Yanlış tekrar' : ''}
          </Typography>
        </View>
        <View style={styles.copy}>
          <Typography accessibilityRole="header" variant="h1">{quiz.title}</Typography>
          <Typography color="textSecondary" style={styles.bodyLine} variant="bodyLarge">{quiz.summary}</Typography>
        </View>
      </View>

      <Card style={styles.progressCard}>
        <View style={styles.progressHeader}>
          <Typography variant="h4">Soru {currentQuestionIndex + 1}</Typography>
          <Typography color="textMuted" variant="caption">{currentQuestionIndex + 1} / {sessionQuestions.length}</Typography>
        </View>
        <Progress
          accessibilityLabel={`${quiz.title} ilerlemesi, ${sessionQuestions.length} sorudan ${currentQuestionIndex + 1}`}
          value={progressValue}
        />
      </Card>

      <Card accessibilityLabel={`Soru ${currentQuestionIndex + 1}`} raised style={styles.questionCard}>
        <View style={styles.copy}>
          <Typography color="primary" variant="caption">
            {currentQuestion.type === 'true-false' ? 'DOĞRU / YANLIŞ' : 'TEK SEÇİM'}
          </Typography>
          <Typography accessibilityRole="header" style={styles.questionPrompt} variant="h2">
            {currentQuestion.prompt}
          </Typography>
        </View>

        <View accessibilityRole="radiogroup" style={styles.options}>
          {currentQuestion.options.map((option) => (
            <QuestionOption
              checked={isChecked}
              key={option.id}
              onSelect={() => setAnswers((current) => ({ ...current, [currentQuestion.id]: option.id }))}
              option={option}
              question={currentQuestion}
              selected={selectedOptionId === option.id}
            />
          ))}
        </View>
      </Card>

      {isChecked && selectedOptionId ? (
        <QuestionFeedback question={currentQuestion} selectedOptionId={selectedOptionId} />
      ) : null}

      <View style={styles.navigation}>
        <Button
          accessibilityLabel="Önceki soruya dön"
          disabled={currentQuestionIndex === 0}
          onPress={handleBack}
          size="large"
          style={styles.navigationButton}
          variant="secondary"
        >
          Geri
        </Button>
        {isChecked ? (
          <Button
            accessibilityLabel={isLastQuestion ? 'Quizi tamamla ve sonucu gör' : 'Sonraki soruya geç'}
            onPress={handleNext}
            size="large"
            style={styles.navigationButton}
          >
            {isLastQuestion ? 'Sonucu Gör' : 'Sonraki Soru'}
          </Button>
        ) : (
          <Button
            accessibilityLabel="Seçili cevabı kontrol et"
            disabled={!selectedOptionId}
            onPress={handleCheck}
            size="large"
            style={styles.navigationButton}
          >
            Cevabı Kontrol Et
          </Button>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { gap: spacing.xl },
  readingColumn: { maxWidth: layout.readingWidth.min },
  header: { gap: spacing.lg },
  metaRow: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, justifyContent: 'space-between' },
  copy: { gap: spacing.xs },
  bodyLine: { lineHeight: spacing.lg },
  progressCard: { gap: spacing.md, padding: spacing.lg },
  progressHeader: { alignItems: 'center', flexDirection: 'row', gap: spacing.md, justifyContent: 'space-between' },
  questionCard: { gap: spacing.xl, padding: spacing.xl },
  questionPrompt: { lineHeight: spacing.xxl },
  options: { gap: spacing.sm },
  option: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: border.width,
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: sizing.touchTarget.minHeight,
    padding: spacing.md,
  },
  optionSelected: { borderColor: colors.primary },
  optionCorrect: { borderColor: colors.success },
  optionIncorrect: { borderColor: colors.error },
  optionPressed: { backgroundColor: colors.surfaceRaised },
  optionFocused: { borderColor: colors.primaryHover },
  optionLabel: { flex: 1, lineHeight: spacing.xl },
  radio: {
    alignItems: 'center',
    borderColor: colors.textMuted,
    borderRadius: radius.pill,
    borderWidth: border.width,
    height: spacing.lg,
    justifyContent: 'center',
    width: spacing.lg,
  },
  radioSelected: { borderColor: colors.primary },
  radioCorrect: { borderColor: colors.success },
  radioIncorrect: { borderColor: colors.error },
  radioDot: { backgroundColor: colors.primary, borderRadius: radius.pill, height: spacing.sm, width: spacing.sm },
  feedbackCard: { gap: spacing.sm, padding: spacing.lg },
  feedbackCorrect: { borderColor: colors.success },
  feedbackIncorrect: { borderColor: colors.warning },
  navigation: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  navigationButton: { flexGrow: 1 },
  centeredState: { justifyContent: 'center' },
  stateCard: { alignSelf: 'center', gap: spacing.xl, maxWidth: layout.readingWidth.min, padding: spacing.xl, width: '100%' },
  actionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  skeleton: { backgroundColor: colors.surfaceRaised, borderRadius: radius.md },
  loadingBadge: { height: spacing.xl, width: spacing.max + spacing.xxl },
  loadingTitle: { height: spacing.xxxxl, width: '75%' },
  loadingLine: { height: spacing.lg, width: '100%' },
  loadingProgress: { height: spacing.max, width: '100%' },
  loadingQuestion: { height: spacing.max, width: '85%' },
  loadingOption: { height: spacing.max, width: '100%' },
});
