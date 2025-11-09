import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  ScrollView,
} from "react-native";

const { width } = Dimensions.get("window");

interface OnboardingScreenProps {
  onSelectUserType: (userType: "civilian" | "organization") => void;
}

export default function OnboardingScreen({
  onSelectUserType,
}: OnboardingScreenProps) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>
        <View style={styles.content}>
          {/* <Text style={styles.logo}>🌆</Text> */}
          <Text style={styles.title}>Welcome to GoodSamaritan!</Text>
          <Text style={styles.subtitle}>
            Make a difference in your community through action
          </Text>

          <View style={styles.cardContainer}>
            <TouchableOpacity
              style={styles.card}
              onPress={() => onSelectUserType("civilian")}
              activeOpacity={0.8}
            >
              <View style={styles.iconContainer}>
                <Text style={styles.icon}>👤</Text>
              </View>
              <Text style={styles.cardTitle}>I'm a Samaritan!</Text>
              <Text style={styles.cardDescription}>
                Join quests, earn points, and make your city better
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.card}
              onPress={() => onSelectUserType("organization")}
              activeOpacity={0.8}
            >
              <View style={styles.iconContainer}>
                <Text style={styles.icon}>🏢</Text>
              </View>
              <Text style={styles.cardTitle}>I'm an Organization!</Text>
              <Text style={styles.cardDescription}>
                Create quests and engage your community
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF", // White background
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  logo: {
    fontSize: 80,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#10B981", // Green highlight
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#065F46", // darker green tone
    marginBottom: 48,
    textAlign: "center",
  },
  cardContainer: {
    gap: 16,
    width: "100%",
  },
  card: {
    backgroundColor: "#F9FAFB", // subtle off-white card background
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#10B981", // green highlight border
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  iconContainer: {
    width: 80,
    height: 80,
    backgroundColor: "#E6F9F2", // soft green tint
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  icon: {
    fontSize: 40,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A", // dark neutral
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: "#475569",
    textAlign: "center",
  },
});
