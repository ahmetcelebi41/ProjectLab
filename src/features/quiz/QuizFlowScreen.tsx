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
import type { Quiz, QuizAnswer, QuizQuestion } from '@/types';

import { countCorrectAnswers, getValidQuizAnswers, resolveQuiz } from './quizUtils';

type Props = {
  lessonId?: string;
  quizId?: string;
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
      <Typography color="textSecondary" style={styles.bodyLine}>{question.explanation}</Typography>
    </Card>
  );
}

function answersFromMap(quiz: Quiz, answerMap: AnswerMap): QuizAnswer[] {
  return quiz.questions.flatMap((question) => {
    const selectedOptionId = answerMap[question.id];
    return selectedOptionId ? [{ questionId: question.id, selectedOptionId }] : [];
  });
}

export function QuizFlowScreen({ lessonId, quizId }: Props) {
  const quiz = resolveQuiz(lessonId, quizId);
  const hasHydrated = useProgressStore((state) => state.hasHydrated);
  const savedProgress = useProgressStore((state) =>
    quiz ? state.quizzes.find((item) => item.quizId === quiz.id) : undefined,
  );
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
  }, [lessonId, quizId]);

  useEffect(() => {
    if (!hasHydrated || !quiz || initialized.current) return;
    initialized.current = true;

    if (!savedProgress?.completedAt) {
      const validSavedAnswers = getValidQuizAnswers(quiz, savedProgress?.answers ?? []);
      const resumedAnswers = Object.fromEntries(
        validSavedAnswers.map((answer) => [answer.questionId, answer.selectedOptionId]),
      );
      const resumedChecked = Object.fromEntries(
        validSavedAnswers.map((answer) => [answer.questionId, true]),
      );
      const lastQuestionIndex = Math.max(0, quiz.questions.length - 1);

      setAnswers(resumedAnswers);
      setCheckedQuestions(resumedChecked);
      setCurrentQuestionIndex(Math.min(savedProgress?.currentQuestionIndex ?? 0, lastQuestionIndex));
    }

    setSessionReady(true);
  }, [hasHydrated, quiz, savedProgress]);

  const currentQuestion = quiz?.questions[currentQuestionIndex];
  const selectedOptionId = currentQuestion ? answers[currentQuestion.id] : undefined;
  const isChecked = currentQuestion ? Boolean(checkedQuestions[currentQuestion.id]) : false;
  const progressValue = quiz ? ((currentQuestionIndex + 1) / quiz.questions.length) * 100 : 0;
  const selectedAnswers = useMemo(
    () => (quiz ? answersFromMap(quiz, answers) : []),
    [answers, quiz],
  );

  if (!quiz) return <QuizNotFound lessonId={lessonId} />;
  if (!hasHydrated || !sessionReady || !currentQuestion) return <QuizLoading />;

  const saveDraft = (nextAnswers: readonly QuizAnswer[], nextIndex: number) => {
    if (savedProgress?.completedAt) return;

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
    if (nextIndex < quiz.questions.length) {
      setCurrentQuestionIndex(nextIndex);
      saveDraft(selectedAnswers, nextIndex);
      return;
    }

    if (submitting.current || selectedAnswers.length !== quiz.questions.length) return;
    submitting.current = true;

    const state = useProgressStore.getState();
    const correctAnswerCount = countCorrectAnswers(quiz, selectedAnswers);
    const completedAt = new Date().toISOString();

    state.saveQuizResult({
      quizId: quiz.id,
      currentQuestionIndex: quiz.questions.length - 1,
      answers: selectedAnswers,
      bestCorrectAnswerCount: correctAnswerCount,
      completedAt,
    });

    router.replace(`/learn/${quiz.lessonId}/quiz/${quiz.id}/result` as Href);
  };

  const handleBack = () => {
    const previousIndex = Math.max(0, currentQuestionIndex - 1);
    setCurrentQuestionIndex(previousIndex);
    saveDraft(selectedAnswers, previousIndex);
  };

  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;

  return (
    <Screen
      contentContainerStyle={[styles.readingColumn, styles.screen]}
      edges={['top', 'bottom']}
      scrollViewProps={{ contentInsetAdjustmentBehavior: 'automatic' }}
    >
      <View style={styles.header}>
        <View style={styles.metaRow}>
          <Badge variant="info">Mini Quiz</Badge>
          <Typography color="textMuted" variant="caption">{quiz.questions.length} soru · +{quiz.completionXp} XP</Typography>
        </View>
        <View style={styles.copy}>
          <Typography accessibilityRole="header" variant="h1">{quiz.title}</Typography>
          <Typography color="textSecondary" style={styles.bodyLine} variant="bodyLarge">{quiz.summary}</Typography>
        </View>
      </View>

      <Card style={styles.progressCard}>
        <View style={styles.progressHeader}>
          <Typography variant="h4">Soru {currentQuestionIndex + 1}</Typography>
          <Typography color="textMuted" variant="caption">{currentQuestionIndex + 1} / {quiz.questions.length}</Typography>
        </View>
        <Progress
          accessibilityLabel={`${quiz.title} ilerlemesi, ${quiz.questions.length} sorudan ${currentQuestionIndex + 1}`}
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
