import { Redirect } from "expo-router";

export default function SignupRoute(): React.JSX.Element {
  return <Redirect href="/(auth)/login" />;
}
