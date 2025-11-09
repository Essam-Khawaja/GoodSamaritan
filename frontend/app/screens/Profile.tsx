import { View, Text, ScrollView, StyleSheet, SafeAreaView } from "react-native";
import BottomNav from "../components/BottomNav";
import type { User } from "../types";
import React from "react";

const BADGES = [
  { id: 1, name: "First Quest", icon: "🎯", earned: true },
  { id: 2, name: "Clean Sweep", icon: "🧹", earned: true },
  { id: 3, name: "Helper Hero", icon: "💪", earned: true },
  { id: 4, name: "Week Warrior", icon: "⚡", earned: true },
  { id: 5, name: "Community Champion", icon: "👑", earned: false },
  { id: 6, name: "Master Quester", icon: "🏆", earned: false },
];

interface ProfileScreenProps {
  onNavigate: (
    screen: "home" | "profile" | "leaderboard" | "organization"
  ) => void;
  user?: User;
}

export default function ProfileScreen({
  onNavigate,
  user,
}: ProfileScreenProps) {
  const userData = user || {
    name: "Alex Chen",
    userStats: {
      elo: 2450,
      rank: 12,
      totalTasks: 24,
      monthTasks: 8,
    },
  };

  const level = Math.floor(userData.userStats.elo / 300);
  const currentLevelElo = level * 300;
  const nextLevelElo = (level + 1) * 300;
  const eloProgress = userData.userStats.elo - currentLevelElo;
  const eloNeeded = nextLevelElo - currentLevelElo;
  const progressPercentage = (eloProgress / eloNeeded) * 100;

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

        <BottomNav currentScreen="profile" onNavigate={onNavigate} />
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
  header: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    backgroundColor: "#6ff19fff",
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#18181B",
    marginBottom: 12,
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
});
