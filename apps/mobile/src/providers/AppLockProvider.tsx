import AsyncStorage from "@react-native-async-storage/async-storage";
import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import { useAuth } from "./AuthProvider";
interface AppLockValue {
  locked: boolean;
  checking: boolean;
  biometricsEnabled: boolean;
  pinEnabled: boolean;
  setBiometricsEnabled(enabled: boolean): Promise<void>;
  setPin(pin: string | null): Promise<void>;
  unlockWithPin(pin: string): Promise<boolean>;
  unlock(): Promise<boolean>;
}
const AppLockContext = createContext<AppLockValue | null>(null);
const pinKey = "sprout_pin";
const getStoredPin = () => Platform.OS === "web" ? AsyncStorage.getItem(pinKey) : SecureStore.getItemAsync(pinKey);
const storePin = (pin: string) => Platform.OS === "web" ? AsyncStorage.setItem(pinKey, pin) : SecureStore.setItemAsync(pinKey, pin);
const deletePin = () => Platform.OS === "web" ? AsyncStorage.removeItem(pinKey) : SecureStore.deleteItemAsync(pinKey);
export function AppLockProvider({ children }: PropsWithChildren) {
  const { user } = useAuth();
  const [locked, setLocked] = useState(false);
  const [checking, setChecking] = useState(true);
  const [biometricsEnabled, setBiometricsEnabledState] = useState(false);
  const [pinEnabled, setPinEnabled] = useState(false);
  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem("sprout_biometrics_enabled"),
      getStoredPin(),
    ])
      .then(([enabled, pin]) => {
        const biometricActive = enabled === "true";
        setBiometricsEnabledState(biometricActive);
        setPinEnabled(Boolean(pin));
        setLocked(Boolean(user) && (biometricActive || Boolean(pin)));
      })
      .finally(() => setChecking(false));
  }, [user]);
  const setBiometricsEnabled = useCallback(async (enabled: boolean) => {
    if (enabled) {
      const hardware = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      if (!hardware || !enrolled)
        throw new Error("No device biometrics are enrolled");
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Enable Sprout app lock",
      });
      if (!result.success) throw new Error("Authentication was cancelled");
    }
    await AsyncStorage.setItem("sprout_biometrics_enabled", String(enabled));
    setBiometricsEnabledState(enabled);
  }, []);
  const setPin = useCallback(async (pin: string | null) => {
    if (pin !== null && !/^\d{4}$/.test(pin))
      throw new Error("PIN must be exactly four digits");
    if (pin) await storePin(pin);
    else await deletePin();
    setPinEnabled(Boolean(pin));
  }, []);
  const unlockWithPin = useCallback(async (pin: string) => {
    const stored = await getStoredPin();
    const success = Boolean(stored && pin === stored);
    if (success) setLocked(false);
    return success;
  }, []);
  const unlock = useCallback(async () => {
    const hardware = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    if (!hardware || !enrolled) {
      return false;
    }
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: "Unlock your Sprout forest",
      fallbackLabel: "Use device passcode",
    });
    if (result.success) setLocked(false);
    return result.success;
  }, []);
  return (
    <AppLockContext.Provider
      value={useMemo(
        () => ({
          locked,
          checking,
          biometricsEnabled,
          pinEnabled,
          setBiometricsEnabled,
          setPin,
          unlockWithPin,
          unlock,
        }),
        [
          locked,
          checking,
          biometricsEnabled,
          pinEnabled,
          setBiometricsEnabled,
          setPin,
          unlockWithPin,
          unlock,
        ],
      )}
    >
      {children}
    </AppLockContext.Provider>
  );
}
export function useAppLock(): AppLockValue {
  const value = useContext(AppLockContext);
  if (!value) throw new Error("useAppLock must be used within AppLockProvider");
  return value;
}
