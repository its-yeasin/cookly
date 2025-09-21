import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useThemeColor } from "@/hooks/use-theme-color";
import { router } from "expo-router";
import React from "react";
import {
  Alert,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

export default function AboutScreen() {
  const tintColor = useThemeColor({}, "tint");

  const openExternalLink = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert("Error", "Unable to open link");
      }
    } catch {
      Alert.alert("Error", "Something went wrong while opening the link");
    }
  };

  const handleBackPress = () => {
    router.back();
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header with Back Button */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <IconSymbol name="chevron.left" size={24} color={tintColor} />
          </TouchableOpacity>
          <ThemedText type="title" style={styles.headerTitle}>
            About Cookly
          </ThemedText>
        </View>

        {/* App Icon and Description */}
        <View style={styles.appSection}>
          <Image
            source={require("@/assets/images/icon.png")}
            style={styles.appIcon}
            resizeMode="contain"
          />
          <ThemedText type="subtitle" style={styles.appTitle}>
            Cookly
          </ThemedText>
          <ThemedText style={styles.version}>Version 1.0.0</ThemedText>
        </View>

        {/* App Description */}
        <View style={styles.section}>
          <ThemedText style={styles.description}>
            Welcome to Cookly, your ultimate culinary companion! We&apos;re
            passionate about bringing delicious recipes and cooking inspiration
            right to your fingertips.
          </ThemedText>

          <ThemedText style={styles.description}>
            Our mission is to make cooking accessible, enjoyable, and rewarding
            for everyone, whether you&apos;re a beginner in the kitchen or a
            seasoned chef looking for new ideas.
          </ThemedText>
        </View>

        {/* Features Section */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            What We Offer
          </ThemedText>

          <View style={styles.featuresList}>
            {[
              "AI-powered recipe generation from your ingredients",
              "Personalized recipe recommendations",
              "Step-by-step cooking instructions",
              "Save and organize your favorite recipes",
              "Dietary restriction support",
              "Nutritional information",
            ].map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <IconSymbol
                  name="checkmark.circle.fill"
                  size={20}
                  color={tintColor}
                />
                <ThemedText style={styles.featureText}>{feature}</ThemedText>
              </View>
            ))}
          </View>
        </View>

        {/* App Information */}
        <View style={[styles.section, styles.infoSection]}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            App Information
          </ThemedText>

          <View style={styles.infoItem}>
            <ThemedText style={styles.infoLabel}>Version:</ThemedText>
            <ThemedText style={styles.infoValue}>1.0.0</ThemedText>
          </View>

          <View style={styles.infoItem}>
            <ThemedText style={styles.infoLabel}>Last Updated:</ThemedText>
            <ThemedText style={styles.infoValue}>September 2025</ThemedText>
          </View>

          <View style={styles.infoItem}>
            <ThemedText style={styles.infoLabel}>Developer:</ThemedText>
            <ThemedText style={styles.infoValue}>MD Jamal</ThemedText>
          </View>
        </View>

        {/* Legal Links */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Legal Information
          </ThemedText>

          <TouchableOpacity
            style={[styles.legalButton, { borderColor: tintColor }]}
            onPress={() =>
              openExternalLink(
                "https://dynamic-frangollo-066108.netlify.app/privacy"
              )
            }
          >
            <IconSymbol
              name="shield.lefthalf.filled"
              size={20}
              color={tintColor}
            />
            <ThemedText style={[styles.legalButtonText, { color: tintColor }]}>
              Privacy Policy
            </ThemedText>
            <IconSymbol name="arrow.up.right" size={16} color={tintColor} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.legalButton, { borderColor: tintColor }]}
            onPress={() =>
              openExternalLink(
                "https://dynamic-frangollo-066108.netlify.app/terms"
              )
            }
          >
            <IconSymbol name="doc.text" size={20} color={tintColor} />
            <ThemedText style={[styles.legalButtonText, { color: tintColor }]}>
              Terms & Conditions
            </ThemedText>
            <IconSymbol name="arrow.up.right" size={16} color={tintColor} />
          </TouchableOpacity>
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Contact Us
          </ThemedText>

          <ThemedText style={styles.contactDescription}>
            Have questions or feedback? We&apos;d love to hear from you!
          </ThemedText>

          <TouchableOpacity
            style={[styles.contactButton, { backgroundColor: tintColor }]}
            onPress={() => openExternalLink("mailto:mdjamal0763@gmail.com")}
          >
            <IconSymbol name="envelope.fill" size={20} color="#fff" />
            <ThemedText style={styles.contactButtonText}>
              mdjamal0763@gmail.com
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <ThemedText style={styles.footerText}>
            Made with ❤️ for food lovers everywhere
          </ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 32,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    flex: 1,
  },
  appSection: {
    alignItems: "center",
    marginBottom: 40,
  },
  appIcon: {
    width: 100,
    height: 100,
    borderRadius: 20,
    marginBottom: 16,
  },
  appTitle: {
    marginBottom: 8,
  },
  version: {
    fontSize: 16,
    opacity: 0.7,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
    opacity: 0.8,
  },
  featuresList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  featureText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
  },
  infoSection: {
    backgroundColor: "rgba(0,0,0,0.05)",
    padding: 20,
    borderRadius: 12,
  },
  infoItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 16,
    opacity: 0.7,
  },
  legalButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
  },
  legalButtonText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
  },
  contactDescription: {
    fontSize: 16,
    marginBottom: 16,
    opacity: 0.8,
  },
  contactButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  contactButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    alignItems: "center",
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  footerText: {
    fontSize: 16,
    opacity: 0.6,
    textAlign: "center",
  },
});
