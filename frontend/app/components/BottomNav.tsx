import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

interface BottomNavProps {
  currentScreen: "home" | "profile" | "leaderboard" | "organization";
  onNavigate: (
    screen: "home" | "profile" | "leaderboard" | "organization"
  ) => void;
}

export default function BottomNav({
  currentScreen,
  onNavigate,
}: BottomNavProps) {
  return (
    <View style={styles.container}>
      <View style={styles.nav}>
        <TouchableOpacity
          onPress={() => onNavigate("home")}
          style={[
            styles.navButton,
            currentScreen === "home" && styles.navButtonActive,
          ]}
          activeOpacity={0.7}
        >
          <Text style={styles.navIcon}>🏠</Text>
          <Text
            style={[
              styles.navLabel,
              currentScreen === "home" && styles.navLabelActive,
            ]}
          >
            Home
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onNavigate("leaderboard")}
          style={[
            styles.navButton,
            currentScreen === "leaderboard" && styles.navButtonActive,
          ]}
          activeOpacity={0.7}
        >
          <Text style={styles.navIcon}>🏆</Text>
          <Text
            style={[
              styles.navLabel,
              currentScreen === "leaderboard" && styles.navLabelActive,
            ]}
          >
            Leaderboard
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onNavigate("organization")}
          style={[
            styles.navButton,
            currentScreen === "organization" && styles.navButtonActive,
          ]}
          activeOpacity={0.7}
        >
          <Text style={styles.navIcon}>🏢</Text>
          <Text
            style={[
              styles.navLabel,
              currentScreen === "organization" && styles.navLabelActive,
            ]}
          >
            Organize
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onNavigate("profile")}
          style={[
            styles.navButton,
            currentScreen === "profile" && styles.navButtonActive,
          ]}
          activeOpacity={0.7}
        >
          <Text style={styles.navIcon}>👤</Text>
          <Text
            style={[
              styles.navLabel,
              currentScreen === "profile" && styles.navLabelActive,
            ]}
          >
            Profile
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E4E4E7",
  },
  nav: {
    flexDirection: "row",
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  navButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
    borderRadius: 16,
  },
  navButtonActive: {
    backgroundColor: "#4ADE80",
  },
  navIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  navLabel: {
    fontSize: 12,
    color: "#71717A",
  },
  navLabelActive: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
