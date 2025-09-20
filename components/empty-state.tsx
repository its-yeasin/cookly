import { useThemeColor } from "@/hooks/use-theme-color";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { ThemedText } from "./themed-text";
import { ThemedView } from "./themed-view";

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
  actionText?: string;
  onActionPress?: () => void;
  imageSource?: any;
}

export function EmptyState({
  icon = "folder-open-outline",
  title,
  description,
  actionText,
  onActionPress,
}: EmptyStateProps) {
  const tintColor = useThemeColor({}, "tint");
  const textColor = useThemeColor({}, "text");

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <Ionicons name={icon} size={64} color={tintColor} style={styles.icon} />

        <ThemedText style={[styles.title, { color: textColor }]}>
          {title}
        </ThemedText>

        {description && (
          <ThemedText style={[styles.description, { opacity: 0.7 }]}>
            {description}
          </ThemedText>
        )}

        {actionText && onActionPress && (
          <TouchableOpacity
            style={[styles.button, { backgroundColor: tintColor }]}
            onPress={onActionPress}
          >
            <ThemedText style={[styles.buttonText, { color: "white" }]}>
              {actionText}
            </ThemedText>
          </TouchableOpacity>
        )}
      </View>
    </ThemedView>
  );
}

// Specific empty states for common scenarios
export function NoRecipesFound({ onRefresh }: { onRefresh?: () => void }) {
  return (
    <EmptyState
      icon="restaurant-outline"
      title="No Recipes Found"
      description="We couldn't find any recipes matching your criteria. Try adjusting your search or filters."
      actionText={onRefresh ? "Refresh" : undefined}
      onActionPress={onRefresh}
    />
  );
}

export function NoSavedRecipes({ onExplore }: { onExplore?: () => void }) {
  return (
    <EmptyState
      icon="bookmark-outline"
      title="No Saved Recipes"
      description="You haven't saved any recipes yet. Start exploring to find recipes you love!"
      actionText="Explore Recipes"
      onActionPress={onExplore}
    />
  );
}

export function NetworkError({ onRetry }: { onRetry?: () => void }) {
  return (
    <EmptyState
      icon="cloud-offline-outline"
      title="Connection Problem"
      description="Please check your internet connection and try again."
      actionText="Try Again"
      onActionPress={onRetry}
    />
  );
}

export function ServerError({ onRetry }: { onRetry?: () => void }) {
  return (
    <EmptyState
      icon="warning-outline"
      title="Something Went Wrong"
      description="We're experiencing technical difficulties. Please try again later."
      actionText="Retry"
      onActionPress={onRetry}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  content: {
    alignItems: "center",
    maxWidth: 300,
  },
  icon: {
    marginBottom: 24,
    opacity: 0.6,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
