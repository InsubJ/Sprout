import AsyncStorage from "@react-native-async-storage/async-storage";
const key = (userId: string) => `sprout_plant_god_active_v1:${userId}`;
export async function readPlantGodActive(userId: string): Promise<boolean> {
  return (await AsyncStorage.getItem(key(userId))) === "true";
}
export async function writePlantGodActive(userId: string, active: boolean): Promise<void> {
  await AsyncStorage.setItem(key(userId), String(active));
}
