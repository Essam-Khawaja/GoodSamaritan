import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from "react-native";
import BottomNav from "../components/BottomNav";
import type { Org, Task } from "../types";
import React, { useState, useEffect } from "react";
import { getUserData } from "../storage";

const API_BASE_URL = process.env.EXPO_PUBLIC_AWS_BASE_URL;

interface OrgProfileScreenProps {
  onNavigate: (
    screen: "home" | "profile" | "leaderboard" | "organization"
  ) => void;
  userType?: "user" | "org" | null;
}

export default function OrgProfileScreen({
  onNavigate,
  userType,
}: OrgProfileScreenProps) {
  const [orgData, setOrgData] = useState<Org | null>(null);
  const [createdTasks, setCreatedTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrgData();
  }, []);

  const loadOrgData = async () => {
    try {
      setLoading(true);
      const storedOrg = await getUserData();

      if (storedOrg && storedOrg.type === "org") {
        setOrgData(storedOrg as Org);
        await fetchCreatedTasks(storedOrg.orgID!);
      }
    } catch (error) {
      console.error("Error loading org data:", error);
      Alert.alert("Error", "Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const fetchCreatedTasks = async (orgID: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/org-getTasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orgID: orgID,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch tasks");
      }

      const responseBody = await response.json();
      const data = JSON.parse(responseBody.body);

      setCreatedTasks(data.tasks || []);
    } catch (error) {
      console.error("Error fetching created tasks:", error);
    }
  };

  const getStatusInfo = (status: number) => {
    switch (status) {
      case 0:
        return { text: "Incomplete", color: "#EF4444", icon: "❌" };
      case 1:
        return { text: "In Progress", color: "#FACC15", icon: "🔄" };
      case 2:
        return { text: "Complete", color: "#4ADE80", icon: "✅" };
      case 3:
        return { text: "Available", color: "#3B82F6", icon: "📋" };
      default:
        return { text: "Unknown", color: "#71717A", icon: "❓" };
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

  if (!orgData) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.container, styles.centerContent]}>
          <Text style={styles.errorText}>Failed to load profile</Text>
        </View>
      </SafeAreaView>
    );
  }

  const availableTasks = createdTasks.filter((t) => t.status === 3);
  const inProgressTasks = createdTasks.filter((t) => t.status === 1);
  const completedTasks = createdTasks.filter((t) => t.status === 2);
  const incompleteTasks = createdTasks.filter((t) => t.status === 0);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.profileSection}>
              <View style={styles.avatar}>
                <Text style={styles.avatarEmoji}>🏢</Text>
              </View>
              <View>
                <Text style={styles.orgName}>{orgData.name}</Text>
                <Text style={styles.orgTitle}>Verified Organization</Text>
              </View>
            </View>
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedIcon}>✓</Text>
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{createdTasks.length}</Text>
              <Text style={styles.statLabel}>Total Quests</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{completedTasks.length}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{inProgressTasks.length}</Text>
              <Text style={styles.statLabel}>Active</Text>
            </View>
          </View>
        </View>

        {/* Content */}
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
        >
          {/* Quick Stats */}
          <View style={styles.statsCard}>
            <View style={styles.statsHeader}>
              <Text style={styles.statsEmoji}>📊</Text>
              <Text style={styles.statsTitle}>Quest Overview</Text>
            </View>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statItemValue}>
                  {availableTasks.length}
                </Text>
                <Text style={styles.statItemLabel}>Available</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statItemValue}>
                  {inProgressTasks.length}
                </Text>
                <Text style={styles.statItemLabel}>In Progress</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statItemValue}>
                  {completedTasks.length}
                </Text>
                <Text style={styles.statItemLabel}>Completed</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statItemValue}>
                  {incompleteTasks.length}
                </Text>
                <Text style={styles.statItemLabel}>Incomplete</Text>
              </View>
            </View>
          </View>

          {/* Created Tasks Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>My Created Quests</Text>

            {createdTasks.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>📝</Text>
                <Text style={styles.emptyText}>No quests created yet</Text>
                <Text style={styles.emptySubtext}>
                  Go to Organize tab to create your first quest!
                </Text>
              </View>
            ) : (
              <>
                {availableTasks.length > 0 && (
                  <>
                    <Text style={styles.subsectionTitle}>
                      Available ({availableTasks.length})
                    </Text>
                    {availableTasks.map((task) => {
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
                            <Text style={styles.taskLocation}>
                              📍 {task.latitude.toFixed(4)},{" "}
                              {task.longitude.toFixed(4)}
                            </Text>
                          </View>
                        </View>
                      );
                    })}
                  </>
                )}

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
                            <Text style={styles.taskInfo}>
                              👤 User: {task.userID.substring(0, 8)}...
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

                {incompleteTasks.length > 0 && (
                  <>
                    <Text style={styles.subsectionTitle}>
                      Incomplete ({incompleteTasks.length})
                    </Text>
                    {incompleteTasks.map((task) => {
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

          {/* Impact Summary */}
          <View style={styles.impactCard}>
            <View style={styles.impactHeader}>
              <Text style={styles.impactEmoji}>🌟</Text>
              <Text style={styles.impactTitle}>Organization Impact</Text>
            </View>
            <Text style={styles.impactText}>
              Your organization has created {createdTasks.length} quests, with{" "}
              {completedTasks.length} successfully completed. Thank you for
              making our community better!
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
    backgroundColor: "#3B82F6",
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
  orgName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  orgTitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
  },
  verifiedBadge: {
    width: 32,
    height: 32,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  verifiedIcon: {
    fontSize: 18,
    color: "#FFFFFF",
    fontWeight: "bold",
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
    color: "#3B82F6",
    marginBottom: 4,
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
  statsCard: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E4E4E7",
    marginBottom: 24,
  },
  statsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  statsEmoji: {
    fontSize: 24,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#18181B",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statItem: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "#F9FAFB",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  statItemValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#18181B",
    marginBottom: 4,
  },
  statItemLabel: {
    fontSize: 12,
    color: "#71717A",
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
    marginTop: 16,
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
  taskLocation: {
    fontSize: 10,
    color: "#71717A",
  },
  taskInfo: {
    fontSize: 12,
    color: "#71717A",
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
  impactCard: {
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.2)",
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
