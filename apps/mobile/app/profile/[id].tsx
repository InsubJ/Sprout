import { useLocalSearchParams } from "expo-router";
import { ProfileDetailScreen } from "../../src/features/profile/ProfileDetailScreen";

export default function ProfileRoute(): React.JSX.Element {
  const { id } = useLocalSearchParams<{ id?: string }>();
  return <ProfileDetailScreen id={id} />;
}
