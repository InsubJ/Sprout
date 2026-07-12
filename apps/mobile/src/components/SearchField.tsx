import { TextField } from './TextField'; import type { TextInputProps } from 'react-native';
export function SearchField(props: Omit<TextInputProps, 'accessibilityRole'>) { return <TextField label="Search" placeholder="Search your forest" returnKeyType="search" {...props} />; }
