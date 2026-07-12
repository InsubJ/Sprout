import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '@sprout/design-tokens';
export function PlaceholderScreen({ icon, title, description }: { icon: string; title: string; description: string }) { return <View style={styles.root}><Text style={styles.icon}>{icon}</Text><Text style={styles.title}>{title}</Text><Text style={styles.description}>{description}</Text></View>; }
const styles = StyleSheet.create({ root: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, backgroundColor: colors.sand }, icon: { fontSize: 56 }, title: { color: colors.ink, fontWeight: '900', fontSize: 28, marginTop: spacing.md }, description: { color: colors.muted, textAlign: 'center', marginTop: spacing.sm } });
