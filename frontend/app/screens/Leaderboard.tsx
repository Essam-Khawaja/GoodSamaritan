import { View, Text, ScrollView, StyleSheet, SafeAreaView } from "react-native";
import BottomNav from "../components/BottomNav";
import type { User } from "../types";
import React from "react";

const LEADERBOARD: User[] = [
  {
    userID: "user_1",
    name: "Sarah Johnson",
    email: "sarah@example.com",
    password: "",
    userStats: { elo: 3890, rank: 1, totalTasks: 45, monthTasks: 12 },
  },
  {
    userID: "user_2",
    name: "Michael Chen",
    email: "michael@example.com",
    password: "",
    userStats: { elo: 3625, rank: 2, totalTasks: 42, monthTasks: 10 },
  },
  {
    userID: "user_3",
    name: "Emma Davis",
    email: "emma@example.com",
    password: "",
    userStats: { elo: 3410, rank: 3, totalTasks: 38, monthTasks: 9 },
  },
  {
    userID: "user_4",
    name: "James Wilson",
    email: "james@example.com",
    password: "",
    userStats: { elo: 2980, rank: 4, totalTasks: 35, monthTasks: 8 },
  },
  {
    userID: "user_5",
    name: "Olivia Brown",
    email: "olivia@example.com",
    password: "",
    userStats: { elo: 2755, rank: 5, totalTasks: 32, monthTasks: 7 },
  },
  {
    userID: "user_current",
    name: "Alex Chen",
    email: "alex@example.com",
    password: "",
    userStats: { elo: 2450, rank: 12, totalTasks: 24, monthTasks: 5 },
  },
];

interface LeaderboardScreenProps {
  onNavigate: (
    screen: "home" | "profile" | "leaderboard" | "organization"
  ) => void;
  currentUser?: User;
}

export default function LeaderboardScreen({
  onNavigate,
  currentUser,
}: LeaderboardScreenProps) {
  const getAvatar = (userID: string): string => {
    const avatars = ["👩", "👨", "👧", "🧑", "👩‍🦰", "👤"];
    const index = Number.parseInt(userID.split("_")[1] || "0") % avatars.length;
    return avatars[index];
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Leaderboard</Text>
          <Text style={styles.headerSubtitle}>Top City Champions</Text>
        </View>

        {/* Top 3 Podium */}
        <View style={styles.podiumSection}>
          <View style={styles.podiumContainer}>
            {/* 2nd Place */}
            <View style={styles.podiumItem}>
              <View style={styles.podiumAvatar2}>
                <Text style={styles.podiumAvatarEmoji}>
                  {getAvatar(LEADERBOARD[1].userID)}
                </Text>
              </View>
              <View style={styles.podiumBase2}>
                <Text style={styles.podiumRank2}>2</Text>
              </View>
              <Text style={styles.podiumName2}>
                {LEADERBOARD[1].name.split(" ")[0]}
              </Text>
              <Text style={styles.podiumPoints}>
                {LEADERBOARD[1].userStats.elo} ELO
              </Text>
            </View>

            {/* 1st Place */}
            <View style={[styles.podiumItem, styles.podiumItemFirst]}>
              <View style={styles.podiumAvatar1}>
                <Text style={styles.podiumAvatarEmoji1}>
                  {getAvatar(LEADERBOARD[0].userID)}
                </Text>
              </View>
              <View style={styles.podiumBase1}>
                <Text style={styles.crownEmoji}>👑</Text>
                <Text style={styles.podiumRank1}>1</Text>
              </View>
              <Text style={styles.podiumName1}>
                {LEADERBOARD[0].name.split(" ")[0]}
              </Text>
              <Text style={styles.podiumPoints1}>
                {LEADERBOARD[0].userStats.elo} ELO
              </Text>
            </View>

            {/* 3rd Place */}
            <View style={styles.podiumItem}>
              <View style={styles.podiumAvatar3}>
                <Text style={styles.podiumAvatarEmoji}>
                  {getAvatar(LEADERBOARD[2].userID)}
                </Text>
              </View>
              <View style={styles.podiumBase3}>
                <Text style={styles.podiumRank3}>3</Text>
              </View>
              <Text style={styles.podiumName3}>
                {LEADERBOARD[2].name.split(" ")[0]}
              </Text>
              <Text style={styles.podiumPoints}>
                {LEADERBOARD[2].userStats.elo} ELO
              </Text>
            </View>
          </View>
        </View>

        {/* Rest of Leaderboard */}
        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.listContent}
        >
          <Text style={styles.listTitle}>All Rankings</Text>
          {LEADERBOARD.slice(3).map((user) => {
            const isCurrentUser = currentUser?.userID === user.userID;
            return (
              <View
                key={user.userID}
                style={[
                  styles.listItem,
                  isCurrentUser && styles.listItemCurrent,
                ]}
              >
                <Text style={styles.listRank}>#{user.userStats.rank}</Text>
                <View style={styles.listAvatar}>
                  <Text style={styles.listAvatarEmoji}>
                    {getAvatar(user.userID)}
                  </Text>
                </View>
                <View style={styles.listDetails}>
                  <Text style={styles.listName}>{user.name}</Text>
                  <Text style={styles.listPoints}>
                    {user.userStats.elo} ELO
                  </Text>
                </View>
                {isCurrentUser && (
                  <View style={styles.currentBadge}>
                    <Text style={styles.currentBadgeText}>You</Text>
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>

        <BottomNav currentScreen="leaderboard" onNavigate={onNavigate} />
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
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E4E4E7",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#18181B",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#71717A",
  },
  podiumSection: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    backgroundColor: "#F9FAFB",
  },
  podiumContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    gap: 16,
  },
  podiumItem: {
    alignItems: "center",
  },
  podiumItemFirst: {
    marginTop: -16,
  },
  podiumAvatar2: {
    width: 64,
    height: 64,
    backgroundColor: "#F4F4F5",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    borderWidth: 2,
    borderColor: "#71717A",
  },
  podiumAvatar1: {
    width: 80,
    height: 80,
    backgroundColor: "#4ADE80",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    borderWidth: 4,
    borderColor: "#FACC15",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  podiumAvatar3: {
    width: 64,
    height: 64,
    backgroundColor: "#F4F4F5",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    borderWidth: 2,
    borderColor: "rgba(250, 204, 21, 0.5)",
  },
  podiumAvatarEmoji: {
    fontSize: 32,
  },
  podiumAvatarEmoji1: {
    fontSize: 40,
  },
  podiumBase2: {
    width: 80,
    height: 80,
    backgroundColor: "#F4F4F5",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#71717A",
  },
  podiumBase1: {
    width: 96,
    height: 112,
    backgroundColor: "#4ADE80",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: "#FACC15",
  },
  podiumBase3: {
    width: 80,
    height: 64,
    backgroundColor: "#F4F4F5",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(250, 204, 21, 0.5)",
  },
  crownEmoji: {
    fontSize: 32,
  },
  podiumRank2: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#71717A",
  },
  podiumRank1: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  podiumRank3: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#71717A",
  },
  podiumName2: {
    fontSize: 12,
    fontWeight: "500",
    color: "#18181B",
    marginTop: 8,
    textAlign: "center",
  },
  podiumName1: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#18181B",
    marginTop: 8,
    textAlign: "center",
  },
  podiumName3: {
    fontSize: 12,
    fontWeight: "500",
    color: "#18181B",
    marginTop: 8,
    textAlign: "center",
  },
  podiumPoints: {
    fontSize: 12,
    color: "#4ADE80",
    fontWeight: "600",
  },
  podiumPoints1: {
    fontSize: 14,
    color: "#4ADE80",
    fontWeight: "bold",
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#18181B",
    marginBottom: 12,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E4E4E7",
    backgroundColor: "#FFFFFF",
    marginBottom: 8,
  },
  listItemCurrent: {
    backgroundColor: "rgba(74, 222, 128, 0.1)",
    borderColor: "#4ADE80",
  },
  listRank: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#71717A",
    width: 32,
  },
  listAvatar: {
    width: 48,
    height: 48,
    backgroundColor: "#F4F4F5",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E4E4E7",
  },
  listAvatarEmoji: {
    fontSize: 24,
  },
  listDetails: {
    flex: 1,
  },
  listName: {
    fontWeight: "600",
    color: "#18181B",
  },
  listPoints: {
    fontSize: 12,
    color: "#4ADE80",
    fontWeight: "500",
  },
  currentBadge: {
    backgroundColor: "#4ADE80",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  currentBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
