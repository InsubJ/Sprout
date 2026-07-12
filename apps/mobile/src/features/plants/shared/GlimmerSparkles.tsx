import { Circle, G } from 'react-native-svg'; import type { GlimmerSparkle } from '@sprout/shared';
export function GlimmerSparkles({ sparkles, color = '#F5D97A' }: { sparkles: GlimmerSparkle[]; color?: string }) { return <G fill={color}>{sparkles.map((item, index) => <Circle key={index} cx={item.cx} cy={item.cy} r={item.r} opacity={item.opacity} />)}</G>; }
