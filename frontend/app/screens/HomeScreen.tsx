import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import BottomNav from "../components/BottomNav";
import type { Task } from "../types";
import React from "react";

const MOCK_TASKS: Task[] = [
  {
    taskID: "1",
    title: "Park Clean-Up Drive",
    description:
      "Help clean up Central Park and make it beautiful for everyone",
    latitude: 51.0447,
    longitude: -114.0719,
    elo: 150,
    orgID: "org_123",
    userID: "",
    time: new Date().toISOString(),
    status: 3, // Available
  },
  {
    taskID: "2",
    title: "Food Bank Donation Drop",
    description: "Donate non-perishable items to the community food bank",
    latitude: 51.0486,
    longitude: -114.0708,
    elo: 100,
    orgID: "org_456",
    userID: "",
    time: new Date().toISOString(),
    status: 3, // Available
  },
  {
    taskID: "3",
    title: "Report Street Hazard",
    description: "Broken sidewalk at Main St & 5th Ave needs attention",
    latitude: 51.0445,
    longitude: -114.0625,
    elo: 75,
    orgID: "org_789",
    userID: "",
    time: new Date().toISOString(),
    status: 3, // Available
  },
  {
    taskID: "4",
    title: "Help Elderly with Groceries",
    description:
      "Assist seniors in the neighborhood with their grocery shopping",
    latitude: 51.0465,
    longitude: -114.068,
    elo: 200,
    orgID: "org_321",
    userID: "",
    time: new Date().toISOString(),
    status: 3, // Available
  },
];

interface HomeScreenProps {
  onQuestSelect: (task: Task) => void;
  onNavigate: (
    screen: "home" | "profile" | "leaderboard" | "organization"
  ) => void;
}

export default function HomeScreen({
  onQuestSelect,
  onNavigate,
}: HomeScreenProps) {
  const calculateDistance = (lat: number, lng: number): string => {
    const distance = Math.random() * 2 + 0.1;
    return `${distance.toFixed(1)} km`;
  };

  const getCategory = (title: string): string => {
    if (
      title.toLowerCase().includes("clean") ||
      title.toLowerCase().includes("park")
    )
      return "Environment";
    if (
      title.toLowerCase().includes("food") ||
      title.toLowerCase().includes("help")
    )
      return "Community";
    if (
      title.toLowerCase().includes("report") ||
      title.toLowerCase().includes("hazard")
    )
      return "Safety";
    return "General";
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Environment":
        return {
          backgroundColor: "rgba(74, 222, 128, 0.1)",
          borderColor: "rgba(74, 222, 128, 0.2)",
        };
      case "Community":
        return {
          backgroundColor: "rgba(250, 204, 21, 0.1)",
          borderColor: "rgba(250, 204, 21, 0.2)",
        };
      case "Safety":
        return {
          backgroundColor: "rgba(239, 68, 68, 0.1)",
          borderColor: "rgba(239, 68, 68, 0.2)",
        };
      default:
        return { backgroundColor: "#F4F4F5", borderColor: "#E4E4E7" };
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerTitle}>Explore Quests</Text>
              <Text style={styles.headerSubtitle}>
                Find ways to help your city
              </Text>
            </View>
            <View style={styles.headerIcon}>
              <Text style={styles.headerEmoji}>🎯</Text>
            </View>
          </View>

          {/* XP Progress bar */}
          {/* <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Daily Goal</Text>
              <Text style={styles.progressValue}>475 / 500 XP</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: "95%" }]} />
            </View>
          </View> */}
        </View>

        {/* Map Preview */}
        <View style={styles.mapPreview}>
          <View style={styles.mapContent}>
            <Text style={styles.mapEmoji}>📍</Text>
            <Text style={styles.mapTitle}>Map View</Text>
            <Text style={styles.mapSubtitle}>
              {MOCK_TASKS.length} quests nearby
            </Text>
          </View>
          {/* Mock map pins */}
          <View
            style={[
              styles.mapPin,
              { top: 32, left: 48, backgroundColor: "#4ADE80" },
            ]}
          />
          <View
            style={[
              styles.mapPin,
              { top: 64, right: 64, backgroundColor: "#FACC15" },
            ]}
          />
          <View
            style={[
              styles.mapPin,
              { bottom: 48, left: 80, backgroundColor: "#FACC15" },
            ]}
          />
        </View>

        {/* Quest Cards */}
        <ScrollView
          style={styles.questList}
          contentContainerStyle={styles.questListContent}
        >
          <Text style={styles.questListTitle}>Nearby Quests</Text>
          {MOCK_TASKS.map((task) => {
            const category = getCategory(task.title);
            const categoryColors = getCategoryColor(category);
            const distance = calculateDistance(task.latitude, task.longitude);
            const icon =
              category === "Environment"
                ? "🗑️"
                : category === "Community"
                ? "❤️"
                : "⚠️";
            const participants = Math.floor(Math.random() * 15) + 1;

            return (
              <TouchableOpacity
                key={task.taskID}
                onPress={() => onQuestSelect(task)}
                style={styles.questCard}
                activeOpacity={0.7}
              >
                <View style={styles.questCardContent}>
                  {/* Icon */}
                  <View style={styles.questIcon}>
                    <Text style={styles.questEmoji}>{icon}</Text>
                  </View>

                  {/* Content */}
                  <View style={styles.questDetails}>
                    <View style={styles.questHeader}>
                      <Text style={styles.questTitle}>{task.title}</Text>
                      <View style={[styles.categoryBadge, categoryColors]}>
                        <Text style={styles.categoryText}>{category}</Text>
                      </View>
                    </View>
                    <Text style={styles.questDescription}>
                      {task.description}
                    </Text>

                    {/* Meta info */}
                    <View style={styles.questMeta}>
                      <Text style={styles.metaText}>📍 {distance}</Text>
                      <Text style={styles.metaText}>
                        👥 {participants} joined
                      </Text>
                      <Text style={styles.metaPoints}>🎯 +{task.elo} ELO</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <BottomNav currentScreen="home" onNavigate={onNavigate} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#10B981",
  },
  container: {
    flex: 1,
    paddingBottom: 80,
    backgroundColor: "#F9FAFB",
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E4E4E7",
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#18181B",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#71717A",
  },
  headerIcon: {
    width: 40,
    height: 40,
    backgroundColor: "#4ADE80",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  headerEmoji: {
    fontSize: 24,
  },
  progressSection: {
    gap: 8,
  },
  progressHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  progressLabel: {
    fontSize: 14,
    color: "#71717A",
  },
  progressValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4ADE80",
  },
  progressBarBg: {
    height: 12,
    backgroundColor: "#F4F4F5",
    borderRadius: 6,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#4ADE80",
    borderRadius: 6,
  },
  mapPreview: {
    height: 192,
    backgroundColor: "rgba(244, 244, 245, 0.3)",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  mapContent: {
    alignItems: "center",
    gap: 8,
  },
  mapEmoji: {
    fontSize: 48,
  },
  mapTitle: {
    fontSize: 14,
    color: "#71717A",
  },
  mapSubtitle: {
    fontSize: 12,
    color: "#71717A",
  },
  mapPin: {
    position: "absolute",
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 4,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  questList: {
    flex: 1,
  },
  questListContent: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  questListTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#18181B",
    marginBottom: 16,
  },
  questCard: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#E4E4E7",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  questCardContent: {
    flexDirection: "row",
    gap: 16,
  },
  questIcon: {
    width: 48,
    height: 48,
    backgroundColor: "#4ADE80",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  questEmoji: {
    fontSize: 24,
  },
  questDetails: {
    flex: 1,
  },
  questHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 4,
  },
  questTitle: {
    fontWeight: "600",
    color: "#18181B",
    flex: 1,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "500",
  },
  questDescription: {
    fontSize: 14,
    color: "#71717A",
    marginBottom: 12,
    lineHeight: 20,
  },
  questMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  metaText: {
    fontSize: 12,
    color: "#71717A",
  },
  metaPoints: {
    fontSize: 12,
    fontWeight: "600",
    color: "#18181B",
  },
});
