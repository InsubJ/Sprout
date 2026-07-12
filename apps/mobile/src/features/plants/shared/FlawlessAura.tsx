import { Circle } from 'react-native-svg';
export function FlawlessAura({ color = '#EAA89B' }: { color?: string }) { return <><Circle cx="200" cy="190" r="150" fill={color} opacity={.12} /><Circle cx="200" cy="190" r="130" fill="none" stroke={color} strokeWidth="1.5" strokeDasharray="3 5" opacity={.5} /></>; }
