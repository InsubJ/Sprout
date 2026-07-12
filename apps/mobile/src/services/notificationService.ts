import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
const preferenceKey = 'sprout_notifications_enabled';
export async function getNotificationsEnabled(): Promise<boolean> { return (await AsyncStorage.getItem(preferenceKey)) === 'true'; }
export async function setNotificationsEnabled(enabled: boolean): Promise<void> {
  if (!enabled) { await Notifications.cancelAllScheduledNotificationsAsync(); await AsyncStorage.setItem(preferenceKey, 'false'); return; }
  const permission = await Notifications.requestPermissionsAsync(); if (!permission.granted) throw new Error('Notification permission was not granted');
  await Notifications.cancelAllScheduledNotificationsAsync();
  await Notifications.scheduleNotificationAsync({ content: { title: 'Your forest is waiting 🌱', body: 'A small act of care keeps a habit growing.' }, trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: 19, minute: 0 } });
  await AsyncStorage.setItem(preferenceKey, 'true');
}
