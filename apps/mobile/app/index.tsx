import { Redirect, type Href } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useRestoredAppRoute } from "../src/hooks/useRestoredAppRoute";
import { useAuth } from "../src/providers/AuthProvider";
export default function Index() {
  const { user, loading } = useAuth();
  const restored = useRestoredAppRoute(user?.id);
  if (loading || (user && restored.loading))
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  const destination = user ? (restored.route ?? "/(tabs)/forest") : "/(auth)/login";
  return <Redirect href={destination as Href} />;
}
