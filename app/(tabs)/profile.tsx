import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useAuth } from "@/contexts/auth-context";
import { useThemeColor } from "@/hooks/use-theme-color";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function ProfileScreen() {
  const { user, logout, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [isLoading, setIsLoading] = useState(false);

  const textColor = useThemeColor({}, "text");
  const tintColor = useThemeColor({}, "tint");
  const backgroundColor = useThemeColor({}, "background");

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/auth/login");
        },
      },
    ]);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Name cannot be empty");
      return;
    }

    setIsLoading(true);
    try {
      await updateUser({ name: name.trim() });
      setIsEditing(false);
      Alert.alert("Success", "Profile updated successfully");
    } catch {
      Alert.alert("Error", "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setName(user?.name || "");
    setIsEditing(false);
  };

  if (!user) {
    return null;
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={backgroundColor}
        translucent={false}
      />
      <ThemedView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Image
                source={require("@/assets/images/icon.png")}
                style={styles.appIcon}
                resizeMode="contain"
              />
              <ThemedText type="title">Profile</ThemedText>
            </View>
          </View>

          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              <View style={[styles.avatar, { backgroundColor: tintColor }]}>
                <ThemedText style={styles.avatarText}>
                  {user.name.charAt(0).toUpperCase()}
                </ThemedText>
              </View>
            </View>

            <View style={styles.infoSection}>
              <View style={styles.infoItem}>
                <ThemedText style={styles.label}>Name</ThemedText>
                {isEditing ? (
                  <TextInput
                    style={[
                      styles.input,
                      { color: textColor, borderColor: tintColor },
                    ]}
                    value={name}
                    onChangeText={setName}
                    placeholder="Enter your name"
                    placeholderTextColor="#666"
                  />
                ) : (
                  <ThemedText style={styles.value}>{user.name}</ThemedText>
                )}
              </View>

              <View style={styles.infoItem}>
                <ThemedText style={styles.label}>Email</ThemedText>
                <ThemedText style={styles.value}>{user.email}</ThemedText>
              </View>

              <View style={styles.infoItem}>
                <ThemedText style={styles.label}>Member Since</ThemedText>
                <ThemedText style={styles.value}>
                  {new Date(user.createdAt).toLocaleDateString()}
                </ThemedText>
              </View>

              <View style={styles.infoItem}>
                <ThemedText style={styles.label}>Saved Recipes</ThemedText>
                <ThemedText style={styles.value}>
                  {user.savedRecipes.length}
                </ThemedText>
              </View>
            </View>

            {isEditing ? (
              <View style={styles.editButtons}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={handleCancel}
                >
                  <ThemedText style={styles.cancelButtonText}>
                    Cancel
                  </ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.saveButton,
                    { backgroundColor: tintColor },
                  ]}
                  onPress={handleSave}
                  disabled={isLoading}
                >
                  <ThemedText style={styles.saveButtonText}>
                    {isLoading ? "Saving..." : "Save"}
                  </ThemedText>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.editButton, { borderColor: tintColor }]}
                onPress={() => setIsEditing(true)}
              >
                <IconSymbol name="pencil" size={16} color={tintColor} />
                <ThemedText
                  style={[styles.editButtonText, { color: tintColor }]}
                >
                  Edit Profile
                </ThemedText>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.preferencesSection}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Preferences
            </ThemedText>

            <View style={styles.preferenceItem}>
              <ThemedText style={styles.label}>Dietary Restrictions</ThemedText>
              <ThemedText style={styles.value}>
                {user.preferences.dietaryRestrictions.length > 0
                  ? user.preferences.dietaryRestrictions.join(", ")
                  : "None"}
              </ThemedText>
            </View>

            <View style={styles.preferenceItem}>
              <ThemedText style={styles.label}>Default Portions</ThemedText>
              <ThemedText style={styles.value}>
                {user.preferences.defaultPortions}
              </ThemedText>
            </View>
          </View>

          <View style={styles.actionsSection}>
            <TouchableOpacity
              style={[styles.menuButton, { borderColor: tintColor }]}
              onPress={() => router.push("/change-password")}
            >
              <IconSymbol name="lock" size={16} color={tintColor} />
              <ThemedText style={[styles.menuButtonText, { color: tintColor }]}>
                Change Password
              </ThemedText>
              <IconSymbol name="chevron.right" size={16} color={tintColor} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuButton, { borderColor: tintColor }]}
              onPress={() => router.push("/about")}
            >
              <IconSymbol name="info.circle" size={16} color={tintColor} />
              <ThemedText style={[styles.menuButtonText, { color: tintColor }]}>
                About Cookly
              </ThemedText>
              <IconSymbol name="chevron.right" size={16} color={tintColor} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <IconSymbol name="arrow.left" size={16} color="#FF3B30" />
              <ThemedText style={styles.logoutText}>Logout</ThemedText>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 25,
  },
  header: {
    marginBottom: 32,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  appIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
  },
  profileSection: {
    marginBottom: 32,
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
  },
  infoSection: {
    marginBottom: 24,
  },
  infoItem: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
    opacity: 0.7,
  },
  value: {
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    gap: 8,
  },
  editButtonText: {
    fontWeight: "500",
  },
  editButtons: {
    flexDirection: "row",
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f0f0f0",
  },
  cancelButtonText: {
    color: "#666",
    fontWeight: "500",
  },
  saveButton: {
    // backgroundColor will be set dynamically
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "500",
  },
  preferencesSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  preferenceItem: {
    marginBottom: 12,
  },
  actionsSection: {
    marginTop: 32,
  },
  menuButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
    gap: 12,
  },
  menuButtonText: {
    flex: 1,
    fontWeight: "500",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    gap: 8,
  },
  logoutText: {
    color: "#FF3B30",
    fontWeight: "500",
  },
});
