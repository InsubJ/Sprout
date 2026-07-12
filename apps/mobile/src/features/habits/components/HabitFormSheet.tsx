import { useEffect, useRef, useState } from "react";
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
import type { HabitFrequency, Profile } from "@sprout/shared";
import { colors, spacing } from "@sprout/design-tokens";
import { AppSwitch } from "../../../components/AppSwitch";
import { AppButton } from "../../../components/AppButton";
import { TextField } from "../../../components/TextField";
import { useTheme } from "../../../providers/ThemeProvider";
import { useAuth } from "../../../providers/AuthProvider";
import { useServices } from "../../../providers/ServicesProvider";
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
type FieldErrors = Partial<Record<"name" | "target" | "witherThreshold" | "daysRequired" | "daysTotal", string>>;
export function HabitFormSheet({
  visible,
  submitting,
  onClose,
  onSubmit,
}: Props) {
  const theme = useTheme();
  const { user } = useAuth();
  const { social, profiles } = useServices();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [target, setTarget] = useState("30");
  const [frequency, setFrequency] = useState<HabitFrequency>("daily");
  const [witherThreshold, setWitherThreshold] = useState("3");
  const [daysRequired, setDaysRequired] = useState("3");
  const [daysTotal, setDaysTotal] = useState("7");
  const [isPublic, setIsPublic] = useState(true);
  const [hideName, setHideName] = useState(false);
  const [hideDescription, setHideDescription] = useState(false);
  const [friends, setFriends] = useState<Profile[]>([]);
  const [shareNameFriends, setShareNameFriends] = useState<string[]>([]);
  const [shareDescFriends, setShareDescFriends] = useState<string[]>([]);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  const nameRef = useRef<TextInput>(null);
  const descriptionRef = useRef<TextInput>(null);
  const targetRef = useRef<TextInput>(null);
  const daysRequiredRef = useRef<TextInput>(null);
  const daysTotalRef = useRef<TextInput>(null);
  const witherRef = useRef<TextInput>(null);
  useEffect(() => {
    if (!visible || !user || !social || !profiles) { setFriends([]); return; }
    void social.getFriendships(user.id).then(async (items) => {
      const ids = items.filter((item) => item.status === "accepted").map((item) => item.user_id === user.id ? item.friend_id : item.user_id);
      const resolved = await Promise.all(ids.map((id) => profiles.getById(id)));
      setFriends(resolved.filter((profile): profile is Profile => Boolean(profile)));
    }).catch(() => setFriends([]));
  }, [profiles, social, user, visible]);
  const submit = async () => {
    const trimmed = name.trim();
    const parsedTarget = Number(target);
    const parsedWither = Number(witherThreshold);
    const nextErrors: FieldErrors = {};
    const required = Number(daysRequired);
    const total = Number(daysTotal);
    if (!trimmed) nextErrors.name = "Give your new habit a name";
    if (!Number.isInteger(parsedTarget) || parsedTarget < 1) nextErrors.target = "Enter a positive whole number";
    if (!Number.isInteger(parsedWither) || parsedWither < 1) nextErrors.witherThreshold = "Enter a positive whole number";
    if (frequency === "flexible") {
      if (!Number.isInteger(required) || required < 1) nextErrors.daysRequired = "Enter at least 1 day";
      if (!Number.isInteger(total) || total < 1) nextErrors.daysTotal = "Enter at least 1 day";
      if (!nextErrors.daysRequired && !nextErrors.daysTotal && required > total) nextErrors.daysRequired = "Must not exceed total days";
    }
    setFieldErrors(nextErrors);
    setSubmitError(null);
    const firstError = Object.keys(nextErrors)[0] as keyof FieldErrors | undefined;
    if (firstError) {
      const refs = { name: nameRef, target: targetRef, daysRequired: daysRequiredRef, daysTotal: daysTotalRef, witherThreshold: witherRef };
      const offsets = { name: 0, target: 420, daysRequired: 650, daysTotal: 650, witherThreshold: 790 };
      scrollRef.current?.scrollTo({ y: offsets[firstError], animated: true });
      refs[firstError].current?.focus();
      return;
    }
    try {
      await onSubmit({
        name: trimmed,
        description: description.trim(),
        frequency,
        target_waterings: parsedTarget,
        wither_threshold: parsedWither,
        is_public: isPublic,
        hide_name: hideName,
        hide_description: hideDescription,
        share_name_friends: shareNameFriends,
        share_desc_friends: shareDescFriends,
        flexible_rules: frequency === "flexible" ? { days_required: required, days_total: total } : null,
      });
      setName("");
      setDescription("");
      setTarget("30");
      onClose();
    } catch (cause) {
      setSubmitError(
        cause instanceof Error ? cause.message : "Unable to create habit",
      );
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
          <Text accessibilityRole="header" style={[styles.title, { color: theme.text }]}>Plant New Seed</Text>
          <Text style={[styles.subtitle, { color: theme.muted }]}> 
            Choose one small action you want to grow consistently.
          </Text>
          <TextField
            ref={nameRef}
            label="Habit name"
            value={name}
            onChangeText={(value) => { setName(value); setFieldErrors((current) => ({ ...current, name: undefined })); }}
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
          <View style={styles.frequencyList}>{(["twice_daily", "daily", "weekly", "monthly", "yearly", "flexible"] as const).map(value => <Pressable key={value} accessibilityRole="button" accessibilityLabel={`${value.replace("_", " ")} frequency`} accessibilityState={{ selected: frequency === value }} onPress={() => setFrequency(value)} style={[styles.frequencyChip, { borderColor: theme.border }, frequency === value && styles.frequencySelected]}><Text style={[styles.frequencyText, { color: theme.muted }, frequency === value && styles.frequencyTextSelected]}>{value.replace("_", " ")}</Text></Pressable>)}</View>
          <TextField ref={targetRef} label="Target waterings" value={target} onChangeText={(value) => { setTarget(value.replace(/\D/g, "")); setFieldErrors((current) => ({ ...current, target: undefined })); }} error={fieldErrors.target} keyboardType="number-pad" />
          <TextField ref={witherRef} label="Misses before withering" value={witherThreshold} onChangeText={(value) => { setWitherThreshold(value.replace(/\D/g, "")); setFieldErrors((current) => ({ ...current, witherThreshold: undefined })); }} error={fieldErrors.witherThreshold} keyboardType="number-pad" />
          {frequency === "flexible" ? <View style={styles.flexibleRow}><View style={styles.flexibleField}><TextField ref={daysRequiredRef} label="Days required" value={daysRequired} onChangeText={(value) => { setDaysRequired(value.replace(/\D/g, "")); setFieldErrors((current) => ({ ...current, daysRequired: undefined })); }} error={fieldErrors.daysRequired} keyboardType="number-pad" /></View><View style={styles.flexibleField}><TextField ref={daysTotalRef} label="Days total" value={daysTotal} onChangeText={(value) => { setDaysTotal(value.replace(/\D/g, "")); setFieldErrors((current) => ({ ...current, daysTotal: undefined })); }} error={fieldErrors.daysTotal} keyboardType="number-pad" /></View></View> : null}
          <View style={[styles.privacy, { backgroundColor: theme.elevated, borderColor: theme.border }]}>
            <Text style={[styles.privacyTitle, { color: theme.text }]}>Privacy and sharing</Text>
            <PreferenceRow label="Visible to connected buds" value={isPublic} onChange={setIsPublic} />
            {isPublic ? <PreferenceRow label="Hide habit name" value={hideName} onChange={setHideName} /> : null}
            {isPublic ? <PreferenceRow label="Hide description" value={hideDescription} onChange={setHideDescription} /> : null}
            {isPublic && hideName && friends.length ? <FriendExceptions label="Share hidden name with" friends={friends} selected={shareNameFriends} onChange={setShareNameFriends} /> : null}
            {isPublic && hideDescription && friends.length ? <FriendExceptions label="Share hidden description with" friends={friends} selected={shareDescFriends} onChange={setShareDescFriends} /> : null}
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
function PreferenceRow({ label, value, onChange }: { label: string; value: boolean; onChange(value: boolean): void }) { const theme = useTheme(); return <View style={[styles.preference, { backgroundColor: theme.surface }]}><Text style={[styles.preferenceLabel, { color: theme.text }]}>{label}</Text><AppSwitch accessibilityLabel={label} value={value} onValueChange={onChange} /></View>; }
function FriendExceptions({label,friends,selected,onChange}:{label:string;friends:Profile[];selected:string[];onChange(value:string[]):void}){const theme=useTheme();return <View style={[styles.exceptions,{backgroundColor:theme.surface}]}><Text style={[styles.fieldLabel,{color:theme.text}]}>{label}</Text><View style={styles.frequencyList}>{friends.map(friend=>{const active=selected.includes(friend.id);return <Pressable key={friend.id} accessibilityRole="checkbox" accessibilityState={{checked:active}} onPress={()=>onChange(active?selected.filter(id=>id!==friend.id):[...selected,friend.id])} style={[styles.friendChip,{borderColor:theme.border},active&&styles.frequencySelected]}><Text style={[{color:theme.muted},active&&styles.frequencyTextSelected]}>@{friend.username}</Text></Pressable>})}</View></View>}
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
  preference: { flexDirection: "row", alignItems: "center", backgroundColor: colors.paper, padding: spacing.md, borderRadius: 14 },
  privacy: { borderWidth: 1, borderRadius: 18, padding: spacing.md, gap: spacing.sm },
  privacyTitle: { fontFamily: "Outfit_700Bold", fontSize: 17 },
  preferenceLabel: { flex: 1, color: colors.ink },
  fieldLabel: { color: colors.ink, fontFamily: "Outfit_600SemiBold" },
  frequencyList: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  frequencyChip: { borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: 999 },
  frequencySelected: { backgroundColor: colors.forest, borderColor: colors.forest },
  frequencyText: { color: colors.muted, textTransform: "capitalize" },
  frequencyTextSelected: { color: colors.paper },
  flexibleRow: { flexDirection: "row", gap: spacing.sm },
  flexibleField: { flex: 1 },
  exceptions: { padding: spacing.md, borderRadius: 14, gap: spacing.sm },
  friendChip: { borderWidth: 1, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: 999 },
});
