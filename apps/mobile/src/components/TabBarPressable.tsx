import {
  Pressable,
  StyleSheet,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useTheme } from "../providers/ThemeProvider";

interface Props extends Omit<PressableProps, "style"> {
  containerStyle?: StyleProp<ViewStyle>;
}

export function TabBarPressable({ containerStyle, children, ...props }: Props): React.JSX.Element {
  const theme = useTheme();
  return (
    <Pressable
      {...props}
      android_ripple={{ color: theme.dark ? "#45604E" : "#C9DDC6", borderless: false }}
      style={({ pressed }) => [
        containerStyle,
        styles.root,
        pressed && {
          opacity: 0.76,
          backgroundColor: theme.dark ? "#2A4035" : "#DCEBD9",
          transform: [{ scale: 0.93 }],
        },
      ]}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    borderRadius: 14,
    marginHorizontal: 3,
    overflow: "hidden",
  },
});
