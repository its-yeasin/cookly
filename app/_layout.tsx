import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { Colors } from "@/constants/theme";
import { AuthProvider } from "@/contexts/auth-context";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  // Create custom theme with unified background color
  const customTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: Colors.light.background, // Use unified white background
    },
  };

  return (
    <AuthProvider>
      <ThemeProvider value={DefaultTheme}>
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
            options={{
              title: "Recipe Details",
              headerBackVisible: false,
              headerShown: false,
            }}
          />
          <Stack.Screen name="about" options={{ title: "About Cookly" }} />
          <Stack.Screen
            name="modal"
            options={{ presentation: "modal", title: "Modal" }}
          />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}
