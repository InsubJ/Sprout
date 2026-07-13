import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import type { User } from "@supabase/supabase-js";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { useServices } from "./ServicesProvider";

WebBrowser.maybeCompleteAuthSession();

export interface DemoIdentity {
  id: string;
  email: string;
  username: string;
  displayName: string;
}
export const demoIdentities: DemoIdentity[] = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    email: "admin@sprout.demo",
    username: "admin",
    displayName: "Admin Gardener",
  },
  {
    id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    email: "alice@sprout.demo",
    username: "alice",
    displayName: "Alice",
  },
  {
    id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
    email: "bob@sprout.demo",
    username: "bob",
    displayName: "Bob",
  },
  {
    id: "cccccccc-cccc-cccc-cccc-cccccccccccc",
    email: "charlie@sprout.demo",
    username: "charlie",
    displayName: "Charlie",
  },
];
type CurrentUser = User | DemoIdentity | null;
interface AuthValue {
  user: CurrentUser;
  loading: boolean;
  signIn(email: string, password: string): Promise<void>;
  signUp(email: string, password: string): Promise<void>;
  signInDemo(identity: DemoIdentity): Promise<void>;
  signInWithOAuth(provider: "google" | "apple"): Promise<void>;
  signOut(): Promise<void>;
}
const AuthContext = createContext<AuthValue | null>(null);
const demoKey = "sprout_demo_identity";
export function AuthProvider({ children }: PropsWithChildren) {
  const { client, isDemo } = useServices();
  const [user, setUser] = useState<CurrentUser>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!client) {
      AsyncStorage.getItem(demoKey)
        .then((raw) => {
          if (raw) {
            const parsed = JSON.parse(raw) as DemoIdentity;
            setUser(demoIdentities.find((item) => item.id === parsed.id) ?? null);
          }
        })
        .finally(() => setLoading(false));
      return;
    }
    client.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLoading(false);
    });
    const { data } = client.auth.onAuthStateChange((_event, session) =>
      setUser(session?.user ?? null),
    );
    return () => data.subscription.unsubscribe();
  }, [client]);
  const signInDemo = useCallback(async (identity: DemoIdentity) => {
    await AsyncStorage.setItem(demoKey, JSON.stringify(identity));
    setUser(identity);
  }, []);
  const signIn = useCallback(
    async (email: string, password: string) => {
      if (!email.trim() || password.length < 6)
        throw new Error("Enter an email and a password of at least 6 characters");
      if (!client) {
        const match =
          demoIdentities.find((item) => item.email === email.trim().toLowerCase()) ??
          demoIdentities[0];
        await signInDemo(match);
        return;
      }
      const { error } = await client.auth.signInWithPassword({ email: email.trim(), password });
      if (error) throw error;
    },
    [client, signInDemo],
  );
  const signUp = useCallback(
    async (email: string, password: string) => {
      if (!client) return signIn(email, password);
      const { error } = await client.auth.signUp({ email: email.trim(), password });
      if (error) throw error;
    },
    [client, signIn],
  );
  const signInWithOAuth = useCallback(
    async (provider: "google" | "apple") => {
      if (!client)
        throw new Error(
          "Google login is not configured. Add the mobile Supabase URL and publishable key first.",
        );
      const redirectTo = Linking.createURL("auth/callback");
      const { data, error } = await client.auth.signInWithOAuth({
        provider,
        options: { redirectTo, skipBrowserRedirect: true },
      });
      if (error) throw error;
      if (!data.url) throw new Error("OAuth provider did not return a login URL");
      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
      if (result.type !== "success") return;
      const callbackUrl = new URL(result.url);
      const callbackError =
        callbackUrl.searchParams.get("error_description") ?? callbackUrl.searchParams.get("error");
      if (callbackError) throw new Error(callbackError);
      const code = callbackUrl.searchParams.get("code");
      if (!code)
        throw new Error(
          `OAuth callback did not include an authorization code. Confirm ${redirectTo} is allowed in Supabase Auth.`,
        );
      const { error: sessionError } = await client.auth.exchangeCodeForSession(code);
      if (sessionError) throw sessionError;
    },
    [client],
  );
  const signOut = useCallback(async () => {
    if (client) {
      const { error } = await client.auth.signOut();
      if (error) throw error;
    } else await AsyncStorage.removeItem(demoKey);
    setUser(null);
  }, [client]);
  const value = useMemo(
    () => ({ user, loading, signIn, signUp, signInDemo, signInWithOAuth, signOut }),
    [loading, signIn, signInDemo, signInWithOAuth, signOut, signUp, user],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth(): AuthValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used within AuthProvider");
  return value;
}
