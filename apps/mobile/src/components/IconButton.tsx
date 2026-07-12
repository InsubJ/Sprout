import { Pressable, StyleSheet, Text, type PressableProps } from 'react-native'; import { colors } from '@sprout/design-tokens';
interface Props extends PressableProps { icon: string; label: string }
export function IconButton({ icon, label, ...props }: Props) { return <Pressable accessibilityRole="button" accessibilityLabel={label} {...props} style={({ pressed }) => [styles.button, pressed && styles.pressed]}><Text style={styles.icon}>{icon}</Text></Pressable>; }
const styles = StyleSheet.create({ button: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.leaf }, pressed: { opacity: .7 }, icon: { fontSize: 20 } });
