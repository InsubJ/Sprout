import { useRef } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import type { HabitFrequency } from "@sprout/shared";
import { colors, spacing } from "@sprout/design-tokens";
import { PreferenceSwitchRow } from "../../../components/PreferenceSwitchRow";
import { AppButton } from "../../../components/AppButton";
import { TextField } from "../../../components/TextField";
import { useTheme } from "../../../providers/ThemeProvider";
import { useAcceptedFriends } from "../../social/useAcceptedFriends";
import { useHabitForm, type HabitFormErrors } from "../hooks/useHabitForm";
import { FriendExceptionPicker } from "./FriendExceptionPicker";
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
export function HabitFormSheet({ visible, submitting, onClose, onSubmit }: Props) {
  const theme = useTheme();
  const form = useHabitForm();
  const {
    name,
    setName,
    description,
    setDescription,
    target,
    setTarget,
    frequency,
    setFrequency,
    witherThreshold,
    setWitherThreshold,
    daysRequired,
    setDaysRequired,
    daysTotal,
    setDaysTotal,
    isPublic,
    setIsPublic,
    hideName,
    setHideName,
    hideDescription,
    setHideDescription,
    shareNameFriends,
    setShareNameFriends,
    shareDescFriends,
    setShareDescFriends,
    fieldErrors,
    submitError,
    setSubmitError,
  } = form;
  const friends = useAcceptedFriends(visible);
  const scrollRef = useRef<ScrollView>(null);
  const nameRef = useRef<TextInput>(null);
  const descriptionRef = useRef<TextInput>(null);
  const targetRef = useRef<TextInput>(null);
  const daysRequiredRef = useRef<TextInput>(null);
  const daysTotalRef = useRef<TextInput>(null);
  const witherRef = useRef<TextInput>(null);
  const submit = async () => {
    const { input, errors } = form.validate();
    if (!input) {
      const nextFirstError = Object.keys(errors)[0] as keyof HabitFormErrors | undefined;
      if (!nextFirstError) return;
      const refs = {
        name: nameRef,
        target: targetRef,
        daysRequired: daysRequiredRef,
        daysTotal: daysTotalRef,
        witherThreshold: witherRef,
      };
      const offsets = {
        name: 0,
        target: 420,
        daysRequired: 650,
        daysTotal: 650,
        witherThreshold: 790,
      };
      scrollRef.current?.scrollTo({ y: offsets[nextFirstError], animated: true });
      refs[nextFirstError].current?.focus();
      return;
    }
    try {
      await onSubmit(input);
      form.reset();
      onClose();
    } catch (cause) {
      setSubmitError(cause instanceof Error ? cause.message : "Unable to create habit");
    }
  };
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={[styles.root, { backgroundColor: theme.background }]}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          ref={scrollRef}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.content}
        >
          <Text accessibilityRole="header" style={[styles.title, { color: theme.text }]}>
            Plant New Seed
          </Text>
          <Text style={[styles.subtitle, { color: theme.muted }]}>
            Choose one small action you want to grow consistently.
          </Text>
          <TextField
            ref={nameRef}
            label="Habit name"
            value={name}
            onChangeText={(value) => {
              setName(value);
              form.clearError("name");
            }}
            error={fieldErrors.name}
            autoFocus
            returnKeyType="next"
            onSubmitEditing={() => descriptionRef.current?.focus()}
            maxLength={100}
          />
          <TextField
            ref={descriptionRef}
            label="Description"
            value={description}
            onChangeText={setDescription}
            multiline
            blurOnSubmit
            returnKeyType="next"
            onSubmitEditing={() => targetRef.current?.focus()}
            maxLength={300}
          />
          <Text style={[styles.fieldLabel, { color: theme.text }]}>Frequency</Text>
          <View style={styles.frequencyList}>
            {(["twice_daily", "daily", "weekly", "monthly", "yearly", "flexible"] as const).map(
              (value) => (
                <Pressable
                  key={value}
                  accessibilityRole="button"
                  accessibilityLabel={`${value.replace("_", " ")} frequency`}
                  accessibilityState={{ selected: frequency === value }}
                  onPress={() => setFrequency(value)}
                  style={[
                    styles.frequencyChip,
                    { borderColor: theme.border },
                    frequency === value && styles.frequencySelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.frequencyText,
                      { color: theme.muted },
                      frequency === value && styles.frequencyTextSelected,
                    ]}
                  >
                    {value.replace("_", " ")}
                  </Text>
                </Pressable>
              ),
            )}
          </View>
          <TextField
            ref={targetRef}
            label="Target waterings"
            value={target}
            onChangeText={(value) => {
              setTarget(value.replace(/\D/g, ""));
              form.clearError("target");
            }}
            error={fieldErrors.target}
            keyboardType="number-pad"
          />
          <TextField
            ref={witherRef}
            label="Misses before withering"
            value={witherThreshold}
            onChangeText={(value) => {
              setWitherThreshold(value.replace(/\D/g, ""));
              form.clearError("witherThreshold");
            }}
            error={fieldErrors.witherThreshold}
            keyboardType="number-pad"
          />
          {frequency === "flexible" ? (
            <View style={styles.flexibleRow}>
              <View style={styles.flexibleField}>
                <TextField
                  ref={daysRequiredRef}
                  label="Days required"
                  value={daysRequired}
                  onChangeText={(value) => {
                    setDaysRequired(value.replace(/\D/g, ""));
                    form.clearError("daysRequired");
                  }}
                  error={fieldErrors.daysRequired}
                  keyboardType="number-pad"
                />
              </View>
              <View style={styles.flexibleField}>
                <TextField
                  ref={daysTotalRef}
                  label="Days total"
                  value={daysTotal}
                  onChangeText={(value) => {
                    setDaysTotal(value.replace(/\D/g, ""));
                    form.clearError("daysTotal");
                  }}
                  error={fieldErrors.daysTotal}
                  keyboardType="number-pad"
                />
              </View>
            </View>
          ) : null}
          <View
            style={[styles.privacy, { backgroundColor: theme.elevated, borderColor: theme.border }]}
          >
            <Text style={[styles.privacyTitle, { color: theme.text }]}>Privacy and sharing</Text>
            <PreferenceSwitchRow
              label="Visible to connected buds"
              value={isPublic}
              onChange={setIsPublic}
            />
            {isPublic ? (
              <>
                <PreferenceSwitchRow
                  label="Hide habit name"
                  value={hideName}
                  onChange={setHideName}
                />
                {hideName && friends.length ? (
                  <FriendExceptionPicker
                    label="Share hidden name with"
                    friends={friends}
                    selected={shareNameFriends}
                    onChange={setShareNameFriends}
                  />
                ) : null}
              </>
            ) : null}
            {isPublic ? (
              <>
                <PreferenceSwitchRow
                  label="Hide description"
                  value={hideDescription}
                  onChange={setHideDescription}
                />
                {hideDescription && friends.length ? (
                  <FriendExceptionPicker
                    label="Share hidden description with"
                    friends={friends}
                    selected={shareDescFriends}
                    onChange={setShareDescFriends}
                  />
                ) : null}
              </>
            ) : null}
          </View>
          {submitError ? <Text style={styles.error}>{submitError}</Text> : null}
          <View style={styles.actions}>
            <AppButton label="Cancel" tone="quiet" onPress={onClose} />
            <AppButton
              label={submitting ? "Planting…" : "Plant seed"}
              disabled={submitting}
              onPress={() => void submit()}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.sand },
  content: { padding: spacing.lg, gap: spacing.md },
  title: {
    color: colors.ink,
    fontSize: 30,
    fontFamily: "Outfit_700Bold",
    marginTop: spacing.lg,
  },
  subtitle: { color: colors.muted, marginBottom: spacing.md },
  error: { color: colors.danger },
  actions: { gap: spacing.sm, marginTop: spacing.md },
  privacy: { borderWidth: 1, borderRadius: 18, padding: spacing.md, gap: spacing.sm },
  privacyTitle: { fontFamily: "Outfit_700Bold", fontSize: 17 },
  fieldLabel: { color: colors.ink, fontFamily: "Outfit_600SemiBold" },
  frequencyList: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  frequencyChip: {
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 999,
  },
  frequencySelected: { backgroundColor: colors.forest, borderColor: colors.forest },
  frequencyText: { color: colors.muted, textTransform: "capitalize" },
  frequencyTextSelected: { color: colors.paper },
  flexibleRow: { flexDirection: "row", gap: spacing.sm },
  flexibleField: { flex: 1 },
});
