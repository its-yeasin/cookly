import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useThemeColor } from "@/hooks/use-theme-color";
import { apiService } from "@/lib/api";
import { router } from "expo-router";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
}

export default function ChangePasswordScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const textColor = useThemeColor({}, "text");
  const tintColor = useThemeColor({}, "tint");
  const backgroundColor = useThemeColor({}, "background");

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PasswordFormData>({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
    },
  });

  const onSubmit = async (data: PasswordFormData) => {
    if (data.newPassword.length < 6) {
      Alert.alert("Error", "New password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);
    try {
      await apiService.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });

      Alert.alert("Success", "Password changed successfully", [
        {
          text: "OK",
          onPress: () => {
            reset();
            router.back();
          },
        },
      ]);
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Failed to change password";
      Alert.alert("Error", message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={backgroundColor}
        translucent={false}
      />
      <ThemedView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          {/* <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <IconSymbol name="chevron.left" size={24} color={tintColor} />
            </TouchableOpacity>
            <ThemedText type="title">Change Password</ThemedText>
          </View> */}

          <View style={styles.form}>
            <ThemedText style={styles.description}>
              Enter your current password and choose a new secure password. Make
              sure to follow the security tips below.
            </ThemedText>

            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>Current Password</ThemedText>
              <View style={styles.passwordInput}>
                <Controller
                  control={control}
                  name="currentPassword"
                  rules={{
                    required: "Current password is required",
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={[
                        styles.input,
                        {
                          color: textColor,
                          borderColor: errors.currentPassword
                            ? "#FF3B30"
                            : tintColor,
                        },
                      ]}
                      secureTextEntry={!showCurrentPassword}
                      placeholder="Enter current password"
                      placeholderTextColor="#666"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      autoCapitalize="none"
                    />
                  )}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  <IconSymbol
                    name={showCurrentPassword ? "eye.slash" : "eye"}
                    size={20}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>
              {errors.currentPassword && (
                <ThemedText style={styles.errorText}>
                  {errors.currentPassword.message}
                </ThemedText>
              )}
            </View>

            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>New Password</ThemedText>
              <View style={styles.passwordInput}>
                <Controller
                  control={control}
                  name="newPassword"
                  rules={{
                    required: "New password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={[
                        styles.input,
                        {
                          color: textColor,
                          borderColor: errors.newPassword
                            ? "#FF3B30"
                            : tintColor,
                        },
                      ]}
                      secureTextEntry={!showNewPassword}
                      placeholder="Enter new password"
                      placeholderTextColor="#666"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      autoCapitalize="none"
                    />
                  )}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowNewPassword(!showNewPassword)}
                >
                  <IconSymbol
                    name={showNewPassword ? "eye.slash" : "eye"}
                    size={20}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>
              {errors.newPassword && (
                <ThemedText style={styles.errorText}>
                  {errors.newPassword.message}
                </ThemedText>
              )}
            </View>

            <View style={styles.securityTips}>
              <ThemedText style={styles.tipsTitle}>
                Password Security Tips:
              </ThemedText>
              <ThemedText style={styles.tipItem}>
                • Use at least 8 characters
              </ThemedText>
              <ThemedText style={styles.tipItem}>
                • Include uppercase and lowercase letters
              </ThemedText>
              <ThemedText style={styles.tipItem}>
                • Include numbers and symbols
              </ThemedText>
              <ThemedText style={styles.tipItem}>
                • Avoid common passwords
              </ThemedText>
            </View>

            <TouchableOpacity
              style={[
                styles.submitButton,
                { backgroundColor: tintColor },
                isLoading && styles.disabledButton,
              ]}
              onPress={handleSubmit(onSubmit)}
              disabled={isLoading}
            >
              <ThemedText style={styles.submitButtonText}>
                {isLoading ? "Changing Password..." : "Change Password"}
              </ThemedText>
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
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 32,
    gap: 16,
  },
  backButton: {
    padding: 8,
  },
  form: {
    flex: 1,
    paddingTop: 10,
  },
  description: {
    fontSize: 18,
    marginBottom: 32,
    opacity: 0.7,
    lineHeight: 22,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  passwordInput: {
    position: "relative",
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    paddingRight: 50,
  },
  eyeButton: {
    position: "absolute",
    right: 16,
    top: 16,
    padding: 4,
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 14,
    marginTop: 4,
  },
  securityTips: {
    backgroundColor: "#f8f9fa",
    padding: 16,
    borderRadius: 12,
    marginBottom: 32,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  tipItem: {
    fontSize: 14,
    marginBottom: 4,
    opacity: 0.8,
  },
  submitButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 16,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  disabledButton: {
    opacity: 0.6,
  },
});
