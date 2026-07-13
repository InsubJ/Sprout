import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import { useColorScheme } from "react-native";
import { colors } from "@sprout/design-tokens";
interface Theme {
  dark: boolean;
  background: string;
  surface: string;
  elevated: string;
  text: string;
  muted: string;
  border: string;
  setDarkMode(enabled: boolean): Promise<void>;
}
const ThemeContext = createContext<Theme | null>(null);
const key = "sprout_theme";
export function ThemeProvider({ children }: PropsWithChildren) {
  const systemDark = useColorScheme() === "dark";
  const [preference, setPreference] = useState<"system" | "light" | "dark">("system");
  useEffect(() => {
    AsyncStorage.getItem(key).then((value) => {
      if (value === "light" || value === "dark") setPreference(value);
    });
  }, []);
  const dark = preference === "system" ? systemDark : preference === "dark";
  const setDarkMode = useCallback(async (enabled: boolean) => {
    const value = enabled ? "dark" : "light";
    await AsyncStorage.setItem(key, value);
    setPreference(value);
  }, []);
  const value = useMemo(
    () => ({
      dark,
      background: dark ? "#0D1729" : colors.sand,
      surface: dark ? "#172238" : colors.paper,
      elevated: dark ? "#1F2D45" : colors.paper,
      text: dark ? "#F5F7F5" : colors.ink,
      muted: dark ? "#AAB6AE" : colors.muted,
      border: dark ? "#334155" : colors.border,
      setDarkMode,
    }),
    [dark, setDarkMode],
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
export function useTheme(): Theme {
  const value = useContext(ThemeContext);
  if (!value) throw new Error("useTheme must be used within ThemeProvider");
  return value;
}
