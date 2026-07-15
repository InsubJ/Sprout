import "react-native-gesture-handler";
import "react-native-url-polyfill/auto";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "../src/providers/AuthProvider";
import { AppLockProvider } from "../src/providers/AppLockProvider";
import { ServicesProvider } from "../src/providers/ServicesProvider";
import { ThemeProvider } from "../src/providers/ThemeProvider";
import { SyncProvider } from "../src/providers/SyncProvider";
import { DataProvider } from "../src/providers/DataProvider";
import { CarouselPositionProvider } from "../src/providers/CarouselPositionProvider";
import { AppErrorBoundary } from "../src/components/AppErrorBoundary";
import { AppRoutePersistence } from "../src/providers/AppRoutePersistence";
import {
  Outfit_300Light,
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
  Outfit_700Bold,
  useFonts,
} from "@expo-google-fonts/outfit";
export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Outfit_300Light,
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
  });
  if (!fontsLoaded) return null;
  return (
    <AppErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <ThemeProvider>
            <ServicesProvider>
              <DataProvider>
                <SyncProvider>
                  <AuthProvider>
                    <CarouselPositionProvider>
                      <AppLockProvider>
                        <AppRoutePersistence />
                        <Stack screenOptions={{ headerShown: false }} />
                        <StatusBar style="auto" />
                      </AppLockProvider>
                    </CarouselPositionProvider>
                  </AuthProvider>
                </SyncProvider>
              </DataProvider>
            </ServicesProvider>
          </ThemeProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </AppErrorBoundary>
  );
}
