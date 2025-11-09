import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import type { User, Task } from "../types";
import React, { useState, useEffect } from "react";
import { getUserData, getUserId } from "../storage";

const API_BASE_URL = process.env.EXPO_PUBLIC_AWS_BASE_URL;

interface UserProfileScreenProps {
  onNavigate: (
    screen: "home" | "profile" | "leaderboard" | "organization"
  ) => void;
  userType?: "user" | "org" | null;
}

// Level system configuration
const ELO_PER_LEVEL = 100; // Changed from 300 to 100 for more frequent level ups
const calculateLevel = (elo: number): number => {
  return Math.floor(elo / ELO_PER_LEVEL) + 1; // Start at level 1
};

const getEloForLevel = (level: number): number => {
  return (level - 1) * ELO_PER_LEVEL;
};

export default function UserProfileScreen({
  onNavigate,
  userType,
}: UserProfileScreenProps) {
  const [userData, setUserData] = useState<User | null>(null);
  const [acceptedTasks, setAcceptedTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const storedUser = await getUserData();

      if (storedUser && storedUser.type === "user") {
        setUserData(storedUser as User);
        await fetchAcceptedTasks(storedUser.userID!);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      Alert.alert("Error", "Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const fetchAcceptedTasks = async (userID: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/user-getAcceptedTasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userID: userID,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch tasks");
      }

      const responseBody = await response.json();

      let parsed: any;
      if (responseBody && typeof responseBody.body === "string") {
        try {
          parsed = JSON.parse(responseBody.body);
        } catch (e) {
          console.error(
            "Failed to parse responseBody.body:",
            e,
            responseBody.body
          );
          parsed = {};
        }
      } else {
        parsed = responseBody;
      }

      const tasksArray: any[] = Array.isArray(parsed.tasks) ? parsed.tasks : [];

      const normalized = tasksArray.map((t) => ({
        ...t,
        status: Number(t.status),
        latitude: Number(t.latitude),
        longitude: Number(t.longitude),
        elo: Number(t.elo),
      }));

      setAcceptedTasks(normalized);
    } catch (error) {
      console.error("Error fetching accepted tasks:", error);
    }
  };

  const getStatusInfo = (status: number) => {
    switch (status) {
      case 1:
        return { text: "In Progress", color: "#FACC15", icon: "🔄" };
      case 2:
        return { text: "Complete", color: "#4ADE80", icon: "✅" };
      default:
        return { text: "Available", color: "#71717A", icon: "📋" };
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.container, styles.centerContent]}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!userData) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.container, styles.centerContent]}>
          <Text style={styles.errorText}>Failed to load profile</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Calculate level and progress
  console.log("User ELO:", userData.elo);
  const currentElo = userData.elo || 0;
  const level = calculateLevel(currentElo);
  const currentLevelElo = getEloForLevel(level);
  const nextLevelElo = getEloForLevel(level + 1);
  const eloProgress = currentElo - currentLevelElo;
  const eloNeeded = nextLevelElo - currentLevelElo;
  const progressPercentage = Math.min((eloProgress / eloNeeded) * 100, 100);

  const inProgressTasks = acceptedTasks.filter((t) => t.status === 1);
  const completedTasks = acceptedTasks.filter((t) => t.status === 2);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.profileSection}>
              <View style={styles.avatar}>
                <Text style={styles.avatarEmoji}>👤</Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.userName}>{userData.name}</Text>
                <Text style={styles.userEmail}>{userData.email}</Text>
              </View>
            </View>
            <View style={styles.rankBadge}>
              <Text style={styles.rankText}>
                #{userData.userStats.rank || "N/A"}
              </Text>
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{currentElo}</Text>
              <Text style={styles.statLabel}>ELO Points</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {userData.userStats.totalTasks || 0}
              </Text>
              <Text style={styles.statLabel}>Total Quests</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {userData.userStats.monthTasks || 0}
              </Text>
              <Text style={styles.statLabel}>This Month</Text>
            </View>
          </View>
        </View>

        {/* Content */}
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
        >
          {/* Level Progress */}
          <View style={styles.levelCard}>
            <View style={styles.levelHeader}>
              <View style={styles.levelInfo}>
                <Text style={styles.levelTitle}>Level {level}</Text>
                <Text style={styles.levelSubtitle}>
                  {eloNeeded - eloProgress} ELO to Level {level + 1}
                </Text>
              </View>
              <View style={styles.levelBadge}>
                <Text style={styles.levelBadgeText}>{level}</Text>
              </View>
            </View>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${progressPercentage}%` },
                ]}
              />
            </View>
            <View style={styles.progressFooter}>
              <Text style={styles.progressText}>
                {eloProgress} / {eloNeeded} ELO
              </Text>
              <Text style={styles.progressPercent}>
                {Math.round(progressPercentage)}%
              </Text>
            </View>
          </View>

          {/* Quick Stats Card */}
          {currentElo > 0 && (
            <View style={styles.quickStatsCard}>
              <View style={styles.quickStatsRow}>
                <View style={styles.quickStatItem}>
                  <Text style={styles.quickStatLabel}>Current Level</Text>
                  <Text style={styles.quickStatValue}>{level}</Text>
                </View>
                <View style={styles.quickStatDivider} />
                <View style={styles.quickStatItem}>
                  <Text style={styles.quickStatLabel}>Total ELO</Text>
                  <Text style={styles.quickStatValue}>{currentElo}</Text>
                </View>
                <View style={styles.quickStatDivider} />
                <View style={styles.quickStatItem}>
                  <Text style={styles.quickStatLabel}>Rank</Text>
                  <Text style={styles.quickStatValue}>
                    #{userData.userStats.rank || "N/A"}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Accepted Tasks Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>My Quests</Text>
              <Text style={styles.sectionCount}>
                {acceptedTasks.length} total
              </Text>
            </View>

            {acceptedTasks.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>📝</Text>
                <Text style={styles.emptyText}>No active quests</Text>
                <Text style={styles.emptySubtext}>
                  Visit the Home tab to find quests near you
                </Text>
              </View>
            ) : (
              <>
                {inProgressTasks.length > 0 && (
                  <>
                    <Text style={styles.subsectionTitle}>
                      In Progress ({inProgressTasks.length})
                    </Text>
                    {inProgressTasks.map((task) => {
                      const statusInfo = getStatusInfo(task.status);
                      return (
                        <View key={task.taskID} style={styles.taskCard}>
                          <View style={styles.taskHeader}>
                            <Text style={styles.taskTitle}>{task.title}</Text>
                            <View
                              style={[
                                styles.statusBadge,
                                { backgroundColor: `${statusInfo.color}20` },
                              ]}
                            >
                              <Text style={styles.statusIcon}>
                                {statusInfo.icon}
                              </Text>
                              <Text
                                style={[
                                  styles.statusText,
                                  { color: statusInfo.color },
                                ]}
                              >
                                {statusInfo.text}
                              </Text>
                            </View>
                          </View>
                          <Text style={styles.taskDescription}>
                            {task.description}
                          </Text>
                          <View style={styles.taskFooter}>
                            <Text style={styles.taskElo}>
                              🎯 +{task.elo} ELO
                            </Text>
                            <Text style={styles.taskTime}>
                              📅 {new Date(task.time).toLocaleDateString()}
                            </Text>
                          </View>
                        </View>
                      );
                    })}
                  </>
                )}

                {completedTasks.length > 0 && (
                  <>
                    <Text style={styles.subsectionTitle}>
                      Completed ({completedTasks.length})
                    </Text>
                    {completedTasks.map((task) => {
                      const statusInfo = getStatusInfo(task.status);
                      return (
                        <View key={task.taskID} style={styles.taskCard}>
                          <View style={styles.taskHeader}>
                            <Text style={styles.taskTitle}>{task.title}</Text>
                            <View
                              style={[
                                styles.statusBadge,
                                { backgroundColor: `${statusInfo.color}20` },
                              ]}
                            >
                              <Text style={styles.statusIcon}>
                                {statusInfo.icon}
                              </Text>
                              <Text
                                style={[
                                  styles.statusText,
                                  { color: statusInfo.color },
                                ]}
                              >
                                {statusInfo.text}
                              </Text>
                            </View>
                          </View>
                          <Text style={styles.taskDescription}>
                            {task.description}
                          </Text>
                          <View style={styles.taskFooter}>
                            <Text style={styles.taskElo}>
                              🎯 +{task.elo} ELO
                            </Text>
                            <Text style={styles.taskTime}>
                              ✅ {new Date(task.time).toLocaleDateString()}
                            </Text>
                          </View>
                        </View>
                      );
                    })}
                  </>
                )}
              </>
            )}
          </View>

          {/* Impact Summary */}
          {userData.userStats.totalTasks > 0 && (
            <View style={styles.impactCard}>
              <View style={styles.impactHeader}>
                <Text style={styles.impactEmoji}>🏆</Text>
                <Text style={styles.impactTitle}>Your Impact</Text>
              </View>
              <Text style={styles.impactText}>
                You've completed {userData.userStats.totalTasks}{" "}
                {userData.userStats.totalTasks === 1 ? "quest" : "quests"} and
                earned {currentElo} ELO points. You're currently ranked #
                {userData.userStats.rank || "N/A"} in your area! Keep up the
                great work!
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingBottom: 80,
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#71717A",
  },
  errorText: {
    fontSize: 16,
    color: "#71717A",
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    backgroundColor: "#4ADE80",
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    flex: 1,
  },
  avatar: {
    width: 64,
    height: 64,
    backgroundColor: "#FFFFFF",
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarEmoji: {
    fontSize: 32,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
  },
  rankBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    borderRadius: 20,
  },
  rankText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4ADE80",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#71717A",
    textAlign: "center",
  },
  content: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  levelCard: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  levelHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  levelInfo: {
    flex: 1,
  },
  levelTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#18181B",
    marginBottom: 4,
  },
  levelSubtitle: {
    fontSize: 14,
    color: "#71717A",
  },
  levelBadge: {
    width: 56,
    height: 56,
    backgroundColor: "#4ADE80",
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  levelBadgeText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  progressBarBg: {
    height: 12,
    backgroundColor: "#F4F4F5",
    borderRadius: 6,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#4ADE80",
    borderRadius: 6,
  },
  progressFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressText: {
    fontSize: 12,
    color: "#71717A",
  },
  progressPercent: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4ADE80",
  },
  quickStatsCard: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  quickStatsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  quickStatItem: {
    flex: 1,
    alignItems: "center",
  },
  quickStatLabel: {
    fontSize: 12,
    color: "#71717A",
    marginBottom: 4,
  },
  quickStatValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#18181B",
  },
  quickStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#E4E4E7",
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#18181B",
  },
  sectionCount: {
    fontSize: 14,
    color: "#71717A",
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#18181B",
    marginTop: 8,
    marginBottom: 12,
  },
  taskCard: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  taskHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  taskTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#18181B",
    marginRight: 8,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  statusIcon: {
    fontSize: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  taskDescription: {
    fontSize: 14,
    color: "#71717A",
    marginBottom: 12,
    lineHeight: 20,
  },
  taskFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  taskElo: {
    fontSize: 13,
    fontWeight: "600",
    color: "#4ADE80",
  },
  taskTime: {
    fontSize: 12,
    color: "#71717A",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 48,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#18181B",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#71717A",
    textAlign: "center",
  },
  impactCard: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  impactHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  impactEmoji: {
    fontSize: 28,
  },
  impactTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#18181B",
  },
  impactText: {
    fontSize: 15,
    color: "#52525B",
    lineHeight: 22,
  },
});
