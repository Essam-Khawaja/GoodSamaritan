import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from "react-native";
import type { Org, Task } from "../types";
import React, { useState, useEffect } from "react";
import { getUserData } from "../storage";
import OrgTaskDetailsModal from "../components/OrgTaskDetailsModal";

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
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
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

  const handleCompleteTask = async (taskID: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/completeTask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          taskID: taskID,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success !== false) {
        Alert.alert("Success", "Quest marked as complete!");
        // Refresh tasks after completing
        if (orgData?.orgID) {
          await fetchCreatedTasks(orgData.orgID);
        }
      } else {
        Alert.alert("Error", data.message || "Failed to complete quest");
      }
    } catch (error) {
      console.error("Error completing quest:", error);
      Alert.alert("Error", "Failed to complete quest. Please try again.");
    }
  };

  const handleTaskSelect = (task: Task) => {
    setSelectedTask(task);
  };

  const handleCloseModal = () => {
    setSelectedTask(null);
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
              <View style={styles.profileInfo}>
                <Text style={styles.orgName}>{orgData.name}</Text>
                <Text style={styles.orgEmail}>{orgData.email}</Text>
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
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>My Created Quests</Text>
              <Text style={styles.sectionCount}>
                {createdTasks.length} total
              </Text>
            </View>

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
                        <TouchableOpacity
                          key={task.taskID}
                          style={styles.taskCard}
                          onPress={() => handleTaskSelect(task)}
                          activeOpacity={0.7}
                        >
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
                        </TouchableOpacity>
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
                        <TouchableOpacity
                          key={task.taskID}
                          style={styles.taskCard}
                          onPress={() => handleTaskSelect(task)}
                          activeOpacity={0.7}
                        >
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
                        </TouchableOpacity>
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
                        <TouchableOpacity
                          key={task.taskID}
                          style={styles.taskCard}
                          onPress={() => handleTaskSelect(task)}
                          activeOpacity={0.7}
                        >
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
                        </TouchableOpacity>
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
                        <TouchableOpacity
                          key={task.taskID}
                          style={styles.taskCard}
                          onPress={() => handleTaskSelect(task)}
                          activeOpacity={0.7}
                        >
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
                        </TouchableOpacity>
                      );
                    })}
                  </>
                )}
              </>
            )}
          </View>

          {/* Impact Summary */}
          {createdTasks.length > 0 && (
            <View style={styles.impactCard}>
              <View style={styles.impactHeader}>
                <Text style={styles.impactEmoji}>🌟</Text>
                <Text style={styles.impactTitle}>Organization Impact</Text>
              </View>
              <Text style={styles.impactText}>
                Your organization has created {createdTasks.length}{" "}
                {createdTasks.length === 1 ? "quest" : "quests"}, with{" "}
                {completedTasks.length} successfully completed. Thank you for
                making our community better!
              </Text>
            </View>
          )}
        </ScrollView>

        {selectedTask && (
          <OrgTaskDetailsModal
            task={selectedTask}
            onClose={handleCloseModal}
            onComplete={handleCompleteTask}
          />
        )}
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
  orgName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  orgEmail: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
  },
  verifiedBadge: {
    width: 40,
    height: 40,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  verifiedIcon: {
    fontSize: 20,
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
    padding: 16,
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
  statsCard: {
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
    fontSize: 18,
    fontWeight: "bold",
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
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  statItemValue: {
    fontSize: 24,
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
  taskLocation: {
    fontSize: 11,
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
