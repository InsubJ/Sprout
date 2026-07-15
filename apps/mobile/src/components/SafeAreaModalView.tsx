import type { PropsWithChildren } from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";
import { spacing } from "@sprout/design-tokens";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface SafeAreaModalViewProps extends PropsWithChildren {
  style?: StyleProp<ViewStyle>;
  minimumTopPadding?: number;
  minimumBottomPadding?: number;
}

export function SafeAreaModalView({
  children,
  style,
  minimumTopPadding = spacing.lg,
  minimumBottomPadding = spacing.lg,
}: SafeAreaModalViewProps): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const safePadding = {
    paddingTop: Math.max(minimumTopPadding, insets.top + spacing.md),
    paddingBottom: Math.max(minimumBottomPadding, insets.bottom + spacing.md),
  };

  return <View style={[style, safePadding]}>{children}</View>;
}
