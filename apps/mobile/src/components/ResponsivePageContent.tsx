import {
  StyleSheet,
  View,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import type { PropsWithChildren } from "react";

export const PAGE_CONTENT_MAX_WIDTH = 1120;

interface ResponsivePageContentProps extends PropsWithChildren {
  style?: StyleProp<ViewStyle>;
  onLayout?(event: LayoutChangeEvent): void;
}

export function ResponsivePageContent({
  children,
  style,
  onLayout,
}: ResponsivePageContentProps): React.JSX.Element {
  return (
    <View style={[styles.content, style]} onLayout={onLayout}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    alignSelf: "center",
    width: "100%",
    maxWidth: PAGE_CONTENT_MAX_WIDTH,
  },
});
