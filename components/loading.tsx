import { useThemeColor } from "@/hooks/use-theme-color";
import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { ThemedText } from "./themed-text";
import { ThemedView } from "./themed-view";

interface LoadingSpinnerProps {
  message?: string;
  size?: "small" | "large";
  color?: string;
}

export function LoadingSpinner({
  message = "Loading...",
  size = "large",
  color,
}: LoadingSpinnerProps) {
  const tintColor = useThemeColor({}, "tint");
  const spinnerColor = color || tintColor;

  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={spinnerColor} />
      {message && <ThemedText style={styles.message}>{message}</ThemedText>}
    </View>
  );
}

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
  children: React.ReactNode;
}

export function LoadingOverlay({
  visible,
  message = "Loading...",
  children,
}: LoadingOverlayProps) {
  if (!visible) {
    return <>{children}</>;
  }

  return (
    <View style={styles.overlayContainer}>
      {children}
      <View style={styles.overlay}>
        <View style={styles.overlayContent}>
          <LoadingSpinner message={message} />
        </View>
      </View>
    </View>
  );
}

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message = "Loading..." }: LoadingScreenProps) {
  return (
    <ThemedView style={styles.fullScreen}>
      <LoadingSpinner message={message} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  message: {
    marginTop: 12,
    textAlign: "center",
    opacity: 0.7,
  },
  overlayContainer: {
    flex: 1,
    position: "relative",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  overlayContent: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 12,
    padding: 24,
    minWidth: 120,
  },
  fullScreen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
