import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";

import { ErrorBoundary } from "@/components/error-boundary";
import { AuthProvider } from "@/contexts/auth-context";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { setupGlobalErrorHandler } from "@/lib/error-config";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    // Setup global error handling
    setupGlobalErrorHandler();
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="auth/login"
              options={{ title: "Login", headerShown: false }}
            />
            <Stack.Screen
              name="auth/register"
              options={{ title: "Register", headerShown: false }}
            />
            <Stack.Screen
              name="recipe/[id]"
              options={{ title: "Recipe Details" }}
            />
            <Stack.Screen
              name="modal"
              options={{ presentation: "modal", title: "Modal" }}
            />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
