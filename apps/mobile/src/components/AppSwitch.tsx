import { Switch, type SwitchProps } from "react-native";
import { colors } from "@sprout/design-tokens";
import { useTheme } from "../providers/ThemeProvider";

export function AppSwitch(props: SwitchProps) {
  const theme = useTheme();
  return <Switch {...props} ios_backgroundColor={theme.dark ? "#46515B" : "#AEBBA9"} trackColor={{ false: theme.dark ? "#46515B" : "#AEBBA9", true: colors.moss }} thumbColor={props.value ? "#FFFFFF" : theme.dark ? "#E5E7EB" : "#FFFFFF"} />;
}
