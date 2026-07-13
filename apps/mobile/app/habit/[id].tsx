import { useLocalSearchParams } from "expo-router";
import { HabitDetailScreen } from "../../src/features/habits/screens/HabitDetailScreen";

export default function HabitRoute(): React.JSX.Element {
  const { id } = useLocalSearchParams<{ id?: string }>();
  return <HabitDetailScreen id={id} />;
}
