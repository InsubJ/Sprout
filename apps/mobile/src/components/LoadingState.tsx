import { ScreenState } from './ScreenState';
export function LoadingState({ message = 'Loading…' }: { message?: string }) { return <ScreenState message={message} />; }
