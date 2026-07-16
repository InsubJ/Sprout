import { useRef } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import type { HabitFrequency } from "@sprout/shared";
import { colors, spacing } from "@sprout/design-tokens";
import { AppButton } from "../../../components/AppButton";
import { DropdownField, type DropdownOption } from "../../../components/DropdownField";
import { PreferenceSwitchRow } from "../../../components/PreferenceSwitchRow";
import { TextField } from "../../../components/TextField";
import { useTheme } from "../../../providers/ThemeProvider";
import { useHabitForm } from "../hooks/useHabitForm";
import {
  getHabitFrequencyPeriodLabel,
  getHabitFrequencySummary,
  useHabitWorkshop,
} from "../hooks/useHabitWorkshop";
import { HabitWorkshopProgress } from "./HabitWorkshopProgress";
import { HabitWorkshopQuestion } from "./HabitWorkshopQuestion";
import { HabitWorkshopReview } from "./HabitWorkshopReview";

interface Props {
  visible: boolean;
  submitting: boolean;
  onClose(): void;
  onSubmit(input: {
    name: string;
    description: string;
    frequency: HabitFrequency;
    target_waterings: number;
    wither_threshold: number;
    is_public: boolean;
    hide_name: boolean;
    hide_description: boolean;
    share_name_friends: string[];
    share_desc_friends: string[];
    flexible_rules?: { days_required: number; days_total: number } | null;
  }): Promise<void>;
}

const frequencyChoices: ReadonlyArray<DropdownOption<HabitFrequency>> = [
  { value: "daily", label: "Day" },
  { value: "weekly", label: "Week" },
  { value: "fortnightly", label: "Fortnight" },
  { value: "monthly", label: "Month" },
  { value: "yearly", label: "Year" },
];

const graceChoices: ReadonlyArray<DropdownOption<string>> = [
  { value: "5", label: "Gentle", description: "Five missed check-ins before withering" },
  { value: "3", label: "Balanced", description: "Three missed check-ins before withering" },
  { value: "1", label: "Focused", description: "One missed check-in before withering" },
];

export function HabitFormSheet({ visible, submitting, onClose, onSubmit }: Props) {
  const theme = useTheme();
  const form = useHabitForm();
  const nameRef = useRef<TextInput>(null);
  const targetRef = useRef<TextInput>(null);
  const workshop = useHabitWorkshop({
    name: form.name,
    target: form.target,
    frequency: form.frequency,
    daysRequired: form.daysRequired,
    daysTotal: form.daysTotal,
  });

  const close = (): void => {
    workshop.reset();
    onClose();
  };

  const submit = async (): Promise<void> => {
    const { input } = form.validate();
    if (!input) return;
    try {
      await onSubmit(input);
      form.reset();
      workshop.reset();
      onClose();
    } catch (cause) {
      form.setSubmitError(cause instanceof Error ? cause.message : "Unable to create habit");
    }
  };

  const reviewItems = [
    { step: "habit" as const, label: "Habit", value: form.name.trim() },
    {
      step: "rhythm" as const,
      label: "Rhythm",
      value: getHabitFrequencySummary(form.frequency, form.daysRequired, form.daysTotal),
    },
    {
      step: "goal" as const,
      label: "Goal",
      value: `${form.target} time${form.target === "1" ? "" : "s"} a ${getHabitFrequencyPeriodLabel(form.frequency)}`,
    },
    {
      step: "grace" as const,
      label: "Breathing room",
      value: `${form.witherThreshold} missed check-in${form.witherThreshold === "1" ? "" : "s"} before withering`,
    },
    {
      step: "details" as const,
      label: "Description",
      value: form.description.trim() || "No description",
    },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={close}
    >
      <KeyboardAvoidingView
        style={[styles.root, { backgroundColor: theme.background }]}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
          <View style={styles.intro}>
            <Text style={[styles.eyebrow, { color: theme.muted }]}>Habit workshop</Text>
            <HabitWorkshopProgress
              currentQuestion={workshop.questionNumber}
              totalQuestions={workshop.totalQuestions}
            />
          </View>

          {workshop.step === "habit" ? (
            <HabitWorkshopQuestion
              title="What habit do you want to keep?"
              helper="Give it a short name that will still feel clear when you see it tomorrow."
            >
              <TextField
                ref={nameRef}
                label="Habit"
                placeholder="For example, read before bed"
                value={form.name}
                onChangeText={(value) => {
                  form.setName(value);
                  form.clearError("name");
                }}
                error={form.fieldErrors.name}
                autoFocus
                returnKeyType="done"
                maxLength={100}
              />
            </HabitWorkshopQuestion>
          ) : null}

          {workshop.step === "goal" ? (
            <HabitWorkshopQuestion
              title={`How many times a ${getHabitFrequencyPeriodLabel(form.frequency)}?`}
              helper="Each completed check-in waters your plant once."
            >
              <TextField
                ref={targetRef}
                label="Number of check-ins"
                placeholder="30"
                value={form.target}
                onChangeText={(value) => {
                  form.setTarget(value.replace(/\D/g, ""));
                  form.clearError("target");
                }}
                error={form.fieldErrors.target}
                keyboardType="number-pad"
                maxLength={4}
              />
            </HabitWorkshopQuestion>
          ) : null}

          {workshop.step === "rhythm" ? (
            <HabitWorkshopQuestion
              title="How often would you like to do it?"
              helper="Choose a rhythm that feels repeatable, even on a busy week."
            >
              <DropdownField<HabitFrequency>
                label="Time period"
                value={form.frequency}
                options={frequencyChoices}
                onChange={form.setFrequency}
              />
            </HabitWorkshopQuestion>
          ) : null}

          {workshop.step === "grace" ? (
            <HabitWorkshopQuestion
              title="How much breathing room should your plant have?"
              helper="This controls how many expected check-ins you can miss before the plant withers."
            >
              <DropdownField<string>
                label="Breathing room"
                value={form.witherThreshold}
                options={graceChoices}
                onChange={form.setWitherThreshold}
              />
            </HabitWorkshopQuestion>
          ) : null}

          {workshop.step === "details" ? (
            <HabitWorkshopQuestion
              title="Add a description?"
              helper="Add any extra details about your habit, or leave this blank."
            >
              <TextField
                label="Description (optional)"
                placeholder="For example, read at least five pages"
                value={form.description}
                onChangeText={form.setDescription}
                multiline
                maxLength={300}
              />
            </HabitWorkshopQuestion>
          ) : null}

          {workshop.isReview ? (
            <>
              <HabitWorkshopReview items={reviewItems} onEdit={workshop.edit} />
              <PreferenceSwitchRow
                label="Private"
                description={
                  form.isPublic ? "Your buds can see this habit" : "Only you can see this habit"
                }
                value={!form.isPublic}
                onChange={(isPrivate) => form.setIsPublic(!isPrivate)}
              />
            </>
          ) : null}

          {form.submitError ? <Text style={styles.error}>{form.submitError}</Text> : null}
          <View style={styles.actions}>
            <AppButton
              label={workshop.isFirstStep ? "Not now" : "Back"}
              tone="quiet"
              disabled={submitting}
              onPress={workshop.isFirstStep ? close : workshop.back}
              style={styles.action}
            />
            <AppButton
              label={workshop.isReview ? (submitting ? "Planting…" : "Plant seed") : "Continue"}
              disabled={submitting || (!workshop.isReview && !workshop.canContinue)}
              onPress={workshop.isReview ? () => void submit() : workshop.next}
              style={styles.action}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.sand },
  content: {
    width: "100%",
    maxWidth: 620,
    alignSelf: "center",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.xl,
  },
  intro: { gap: spacing.md },
  eyebrow: {
    fontSize: 13,
    fontFamily: "Outfit_700Bold",
    textTransform: "uppercase",
    letterSpacing: 1.1,
  },
  error: { color: colors.danger, fontFamily: "Outfit_500Medium" },
  actions: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.sm },
  action: { flex: 1 },
});
