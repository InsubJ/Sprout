import AsyncStorage from "@react-native-async-storage/async-storage";
export interface HabitNotificationPreference {
  habitId: string;
  enabled: boolean;
  hour: number;
  minute: number;
}
const key = "sprout_habit_notification_preferences";
export async function getHabitNotificationPreferences(): Promise<HabitNotificationPreference[]> {
  const raw = await AsyncStorage.getItem(key);
  return raw ? (JSON.parse(raw) as HabitNotificationPreference[]) : [];
}
export async function setHabitNotificationPreference(
  preference: HabitNotificationPreference,
): Promise<void> {
  if (!preference.habitId.trim()) throw new Error("Habit ID is required");
  if (
    !Number.isInteger(preference.hour) ||
    preference.hour < 0 ||
    preference.hour > 23 ||
    !Number.isInteger(preference.minute) ||
    preference.minute < 0 ||
    preference.minute > 59
  )
    throw new RangeError("Notification time is invalid");
  const current = await getHabitNotificationPreferences();
  const next = [...current.filter((item) => item.habitId !== preference.habitId), preference];
  await AsyncStorage.setItem(key, JSON.stringify(next));
}
