import { StyleSheet, View, type ViewProps } from 'react-native'; import { colors, radii, spacing } from '@sprout/design-tokens';
export function Card(props: ViewProps) { return <View {...props} style={[styles.card, props.style]} />; }
const styles = StyleSheet.create({ card: { backgroundColor: colors.paper, borderRadius: radii.lg, padding: spacing.md, borderWidth: 1, borderColor: colors.border } });
