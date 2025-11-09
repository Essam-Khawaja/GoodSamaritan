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
import BottomNav from "../components/BottomNav";
import type { User, Task } from "../types";
import React, { useState, useEffect } from "react";
import { getUserData, getUserId } from "../storage";

const API_BASE_URL = process.env.EXPO_PUBLIC_AWS_BASE_URL;

const BADGES = [
  { id: 1, name: "First Quest", icon: "🎯", earned: true },
  { id: 2, name: "Clean Sweep", icon: "🧹", earned: true },
  { id: 3, name: "Helper Hero", icon: "💪", earned: true },
  { id: 4, name: "Week Warrior", icon: "⚡", earned: true },
  { id: 5, name: "Community Champion", icon: "👑", earned: false },
  { id: 6, name: "Master Quester", icon: "🏆", earned: false },
];

interface UserProfileScreenProps {
  onNavigate: (
    screen: "home" | "profile" | "leaderboard" | "organization"
  ) => void;
  userType?: "user" | "org" | null;
}

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

      const myTasks = normalized;

      setAcceptedTasks(myTasks);
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

  const level = Math.floor(userData.userStats.elo / 300);
  const currentLevelElo = level * 300;
  const nextLevelElo = (level + 1) * 300;
  const eloProgress = userData.userStats.elo - currentLevelElo;
  const eloNeeded = nextLevelElo - currentLevelElo;
  const progressPercentage = (eloProgress / eloNeeded) * 100;

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
              <View>
                <Text style={styles.userName}>{userData.name}</Text>
                <Text style={styles.userTitle}>City Champion</Text>
              </View>
            </View>
            <View style={styles.rankBadge}>
              <Text style={styles.rankText}>
                Rank #{userData.userStats.rank}
              </Text>
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{userData.userStats.elo}</Text>
              <Text style={styles.statLabel}>Total ELO</Text>
            </View>
            <View style={styles.statCard}>
              <View style={styles.streakValue}>
                <Text style={styles.streakEmoji}>🔥</Text>
                <Text style={styles.statValue}>12</Text>
              </View>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {userData.userStats.totalTasks}
              </Text>
              <Text style={styles.statLabel}>Quests</Text>
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
              <View>
                <Text style={styles.levelTitle}>Level {level}</Text>
                <Text style={styles.levelSubtitle}>
                  {eloNeeded - eloProgress} ELO to Level {level + 1}
                </Text>
              </View>
              <View style={styles.levelIcon}>
                <Text style={styles.levelEmoji}>📈</Text>
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
          </View>

          {/* Month Stats */}
          <View style={styles.monthCard}>
            <Text style={styles.monthTitle}>This Month</Text>
            <Text style={styles.monthValue}>
              {userData.userStats.monthTasks} Quests Completed
            </Text>
          </View>

          {/* Accepted Tasks Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>My Quests</Text>

            {acceptedTasks.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>📝</Text>
                <Text style={styles.emptyText}>No accepted quests yet</Text>
                <Text style={styles.emptySubtext}>
                  Go to Home to find quests near you!
                </Text>
              </View>
            ) : (
              <>
                {inProgressTasks.length > 0 && (
                  <>
                    <Text style={styles.subsectionTitle}>In Progress</Text>
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
                    <Text style={styles.subsectionTitle}>Completed</Text>
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
                              📅 {new Date(task.time).toLocaleDateString()}
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

          {/* Badges */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Badges & Achievements</Text>
            <View style={styles.badgesGrid}>
              {BADGES.map((badge) => (
                <View
                  key={badge.id}
                  style={[
                    styles.badgeCard,
                    !badge.earned && styles.badgeCardLocked,
                  ]}
                >
                  <Text style={styles.badgeEmoji}>{badge.icon}</Text>
                  <Text style={styles.badgeName}>{badge.name}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Impact Summary */}
          <View style={styles.impactCard}>
            <View style={styles.impactHeader}>
              <Text style={styles.impactEmoji}>🏆</Text>
              <Text style={styles.impactTitle}>Your Impact</Text>
            </View>
            <Text style={styles.impactText}>
              You've completed {userData.userStats.totalTasks} quests and are
              ranked #{userData.userStats.rank} in your city. Keep up the
              amazing work!
            </Text>
          </View>
        </ScrollView>

        <BottomNav
          currentScreen="organization"
          onNavigate={onNavigate}
          userType={userType}
        />
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
  },
  avatar: {
    width: 64,
    height: 64,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarEmoji: {
    fontSize: 32,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  userTitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
  },
  rankBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 16,
  },
  rankText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: 16,
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4ADE80",
    marginBottom: 4,
  },
  streakValue: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 4,
  },
  streakEmoji: {
    fontSize: 20,
  },
  statLabel: {
    fontSize: 12,
    color: "#71717A",
  },
  content: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  levelCard: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E4E4E7",
    marginBottom: 24,
  },
  levelHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  levelTitle: {
    fontWeight: "600",
    color: "#18181B",
  },
  levelSubtitle: {
    fontSize: 14,
    color: "#71717A",
  },
  levelIcon: {
    width: 48,
    height: 48,
    backgroundColor: "rgba(74, 222, 128, 0.1)",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  levelEmoji: {
    fontSize: 24,
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
  monthCard: {
    backgroundColor: "rgba(74, 222, 128, 0.1)",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(74, 222, 128, 0.2)",
    marginBottom: 24,
  },
  monthTitle: {
    fontSize: 14,
    color: "#71717A",
    marginBottom: 4,
  },
  monthValue: {
    fontSize: 18,
    fontWeight: "600",
    color: "#18181B",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#18181B",
    marginBottom: 12,
  },
  subsectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#71717A",
    marginTop: 8,
    marginBottom: 12,
  },
  taskCard: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E4E4E7",
    marginBottom: 12,
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
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
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
    fontSize: 12,
    fontWeight: "600",
    color: "#4ADE80",
  },
  taskTime: {
    fontSize: 12,
    color: "#71717A",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#18181B",
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#71717A",
  },
  badgesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  badgeCard: {
    width: "30%",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E4E4E7",
    alignItems: "center",
  },
  badgeCardLocked: {
    opacity: 0.5,
  },
  badgeEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  badgeName: {
    fontSize: 12,
    fontWeight: "500",
    color: "#18181B",
    textAlign: "center",
  },
  impactCard: {
    backgroundColor: "rgba(74, 222, 128, 0.1)",
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(74, 222, 128, 0.2)",
    marginBottom: 24,
  },
  impactHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  impactEmoji: {
    fontSize: 24,
  },
  impactTitle: {
    fontWeight: "600",
    color: "#18181B",
  },
  impactText: {
    fontSize: 14,
    color: "#71717A",
    lineHeight: 20,
  },
});
