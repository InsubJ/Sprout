import { useCallback, useMemo, useState } from "react";
import type { HabitFrequency } from "@sprout/shared";

export const habitWorkshopSteps = [
  "habit",
  "rhythm",
  "goal",
  "grace",
  "details",
  "review",
] as const;

export type HabitWorkshopStep = (typeof habitWorkshopSteps)[number];

export interface HabitWorkshopAnswers {
  name: string;
  target: string;
  frequency: HabitFrequency;
  daysRequired: string;
  daysTotal: string;
}

interface HabitWorkshopState {
  step: HabitWorkshopStep;
  stepIndex: number;
  questionNumber: number | null;
  totalQuestions: number;
  canContinue: boolean;
  isFirstStep: boolean;
  isReview: boolean;
  next(): void;
  back(): void;
  edit(step: Exclude<HabitWorkshopStep, "review">): void;
  reset(): void;
}

const totalQuestions = habitWorkshopSteps.length - 1;

export function canContinueHabitWorkshop(
  step: HabitWorkshopStep,
  answers: HabitWorkshopAnswers,
): boolean {
  if (step === "habit") return answers.name.trim().length > 0;
  if (step === "goal") {
    const target = Number(answers.target);
    return Number.isInteger(target) && target > 0;
  }
  if (step === "rhythm" && answers.frequency === "flexible") {
    const required = Number(answers.daysRequired);
    const total = Number(answers.daysTotal);
    return (
      Number.isInteger(required) &&
      Number.isInteger(total) &&
      required > 0 &&
      total > 0 &&
      required <= total
    );
  }
  return true;
}

export function getHabitFrequencySummary(
  frequency: HabitFrequency,
  daysRequired: string,
  daysTotal: string,
): string {
  const summaries: Record<Exclude<HabitFrequency, "flexible">, string> = {
    twice_daily: "twice each day",
    daily: "once each day",
    weekly: "once each week",
    fortnightly: "once each fortnight",
    monthly: "once each month",
    yearly: "once each year",
  };
  if (frequency === "flexible") return `${daysRequired} days out of every ${daysTotal}`;
  return summaries[frequency];
}

export function getHabitFrequencyPeriodLabel(frequency: HabitFrequency): string {
  const periods: Record<HabitFrequency, string> = {
    twice_daily: "day",
    daily: "day",
    weekly: "week",
    fortnightly: "fortnight",
    monthly: "month",
    yearly: "year",
    flexible: "cycle",
  };
  return periods[frequency];
}

export function useHabitWorkshop(answers: HabitWorkshopAnswers): HabitWorkshopState {
  const [stepIndex, setStepIndex] = useState(0);
  const [editingFromReview, setEditingFromReview] = useState(false);
  const step = habitWorkshopSteps[stepIndex];
  const canContinue = useMemo(() => canContinueHabitWorkshop(step, answers), [answers, step]);

  const next = useCallback((): void => {
    if (editingFromReview) {
      setEditingFromReview(false);
      setStepIndex(habitWorkshopSteps.length - 1);
      return;
    }
    setStepIndex((current) => Math.min(habitWorkshopSteps.length - 1, current + 1));
  }, [editingFromReview]);
  const back = useCallback((): void => {
    if (editingFromReview) {
      setEditingFromReview(false);
      setStepIndex(habitWorkshopSteps.length - 1);
      return;
    }
    setStepIndex((current) => Math.max(0, current - 1));
  }, [editingFromReview]);
  const edit = useCallback((nextStep: Exclude<HabitWorkshopStep, "review">): void => {
    setEditingFromReview(true);
    setStepIndex(habitWorkshopSteps.indexOf(nextStep));
  }, []);
  const reset = useCallback((): void => {
    setEditingFromReview(false);
    setStepIndex(0);
  }, []);

  return {
    step,
    stepIndex,
    questionNumber: step === "review" ? null : stepIndex + 1,
    totalQuestions,
    canContinue,
    isFirstStep: stepIndex === 0,
    isReview: step === "review",
    next,
    back,
    edit,
    reset,
  };
}
