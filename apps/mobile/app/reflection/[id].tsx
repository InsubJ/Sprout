import { useLocalSearchParams } from "expo-router";
import { ReflectionDetailScreen } from "../../src/features/habits/screens/ReflectionDetailScreen";

export default function ReflectionRoute(): React.JSX.Element {
  const { id } = useLocalSearchParams<{ id?: string }>();
  return <ReflectionDetailScreen id={id} />;
}
