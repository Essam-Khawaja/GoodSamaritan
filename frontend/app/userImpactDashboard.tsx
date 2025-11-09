import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ==== BACKEND TYPES (shape of your API responses) ====

type CompletionStatus = 'Completed' | 'Incomplete';

type BackendCompletedTask = {
  taskId: string;
  title: string;
  orgName: string;
  description: string;
  samaritanScoreDelta: number; // positive for completed, negative for penalty
  taskStatus: number;          // e.g. 2 = done, 3 = incomplete
};

type BackendLeaderboardEntry = {
  userId: string;
  fullName: string;
  samaritanScore: number;
  rank: number;
};

type BackendUserImpact = {
  userStats: {
    samaritanScore: number;
    // tasksCompleted?: number;
    // tasksInProgress?: number;
    // rank?: number;
  };
  completedTasks: BackendCompletedTask[];
  leaderboard: BackendLeaderboardEntry[];
};


type CompletedTask = {
  id: string;
  title: string;
  organization: string;
  description: string;
  elo: number; // can be positive or negative
  status: CompletionStatus;
};

type LeaderboardEntry = {
  userId: string;
  name: string;
  score: number;
  rank: number;
};

const CURRENT_USER_ID = 'TODO_CURRENT_USER_ID';

function mapTaskStatusToCompletionStatus(taskStatus: number): CompletionStatus {
  if (taskStatus === 3) return 'Incomplete';
  return 'Completed';
}

function mapBackendCompletedTask(t: BackendCompletedTask): CompletedTask {
  return {
    id: t.taskId,
    title: t.title,
    organization: t.orgName,
    description: t.description,
    elo: t.samaritanScoreDelta,
    status: mapTaskStatusToCompletionStatus(t.taskStatus),
  };
}

function mapBackendLeaderboardEntry(e: BackendLeaderboardEntry): LeaderboardEntry {
  return {
    userId: e.userId,
    name: e.fullName,
    score: e.samaritanScore,
    rank: e.rank,
  };
}

// Placeholder API call – just hook your backend here
async function fetchUserImpact(userId: string): Promise<BackendUserImpact> {
  // TODO: replace with real fetch, e.g.:
  //
  // const res = await fetch(`https://api.yourapp.com/users/${userId}/impact`);
  // if (!res.ok) throw new Error('Failed to fetch impact');
  // return await res.json();
  //
  // For now, return empty data so the screen still renders.

  return {
    userStats: {
      samaritanScore: 0,
    },
    completedTasks: [],
    leaderboard: [],
  };
}

export default function UserImpactDashboard() {
  const router = useRouter();
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [showAllTasks, setShowAllTasks] = useState(false);
  const [showFullLeaderboard, setShowFullLeaderboard] = useState(false);

  const [samaritanScore, setSamaritanScore] = useState(0);
  const [completedTasks, setCompletedTasks] = useState<CompletedTask[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userRankIndex, setUserRankIndex] = useState<number>(-1);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const loadImpact = async () => {
      try {
        setLoading(true);
        const data = await fetchUserImpact(CURRENT_USER_ID);

        setSamaritanScore(data.userStats.samaritanScore ?? 0);

        const completedUi = data.completedTasks.map(mapBackendCompletedTask);
        setCompletedTasks(completedUi);

        const leaderboardUi = data.leaderboard.map(mapBackendLeaderboardEntry);
        setLeaderboard(leaderboardUi);

        const idx = leaderboardUi.findIndex((e) => e.userId === CURRENT_USER_ID);
        setUserRankIndex(idx);
      } catch (err) {
        console.error('Failed to load user impact dashboard', err);
        // Optional: show an error toast / Alert here.
      } finally {
        setLoading(false);
      }
    };

    loadImpact();
  }, []);

  const toggleExpandTask = (taskId: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedTask((prev) => (prev === taskId ? null : taskId));
  };

  const renderTask = ({ item }: { item: CompletedTask }) => {
    const isExpanded = expandedTask === item.id;
    return (
      <TouchableOpacity onPress={() => toggleExpandTask(item.id)} activeOpacity={0.8}>
        <View style={styles.taskCard}>
          <Text style={styles.taskTitle}>{item.title}</Text>
          <Text style={styles.taskSubtitle}>{item.organization}</Text>
        </View>
        {isExpanded && (
          <View style={styles.expandedCard}>
            <Text style={styles.detailLabel}>Description</Text>
            <Text style={styles.detailText}>{item.description}</Text>

            <Text style={styles.detailLabel}>Status</Text>
            <Text
              style={[
                styles.detailStatus,
                item.status === 'Incomplete' && { color: '#E57373' },
              ]}
            >
              {item.status}
            </Text>

            <Text style={styles.detailLabel}>Samaritan Score Impact</Text>
            <Text
              style={[
                styles.detailElo,
                item.elo < 0 && { color: '#E57373' },
              ]}
            >
              {item.elo >= 0 ? `+${item.elo} pts` : `${item.elo} pts`}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const filteredTasks = showAllTasks
    ? completedTasks
    : completedTasks.slice(0, 3);

  const filteredLeaderboard =
    showFullLeaderboard
      ? leaderboard
      : userRankIndex === -1
      ? leaderboard.slice(0, 5)
      : leaderboard.slice(
          Math.max(0, userRankIndex - 2),
          Math.min(leaderboard.length, userRankIndex + 3)
        );

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <View style={styles.samaritanBox}>
        <Text style={styles.samaritanLabel}>Samaritan Score</Text>
        <Text style={styles.samaritanValue}>{samaritanScore.toLocaleString()}</Text>
      </View>

      {loading && (
        <View style={{ marginBottom: 16, alignItems: 'center' }}>
          <ActivityIndicator />
        </View>
      )}

      {/* Completed Tasks */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Tasks Completed</Text>
        {completedTasks.length > 3 && (
          <TouchableOpacity onPress={() => setShowAllTasks(!showAllTasks)}>
            <Text style={styles.toggleText}>
              {showAllTasks ? 'Show Less' : 'Show All'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {completedTasks.length === 0 && !loading ? (
        <Text style={{ marginBottom: 16, color: '#666' }}>
          You have not completed any tasks yet.
        </Text>
      ) : (
        <FlatList
          data={filteredTasks}
          renderItem={renderTask}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
      )}

      {/* Leaderboard */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Leaderboard</Text>
        {leaderboard.length > 5 && (
          <TouchableOpacity
            onPress={() => setShowFullLeaderboard(!showFullLeaderboard)}
          >
            <Text style={styles.toggleText}>
              {showFullLeaderboard ? 'Show Less' : 'Show All'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {filteredLeaderboard.map((entry) => {
        const isCurrentUser = entry.userId === CURRENT_USER_ID;
        return (
          <View
            key={entry.userId}
            style={[
              styles.leaderRow,
              isCurrentUser && { backgroundColor: '#e6f9f3' },
            ]}
          >
            <Text
              style={[
                styles.leaderText,
                isCurrentUser && { color: '#1bb998', fontWeight: '700' },
              ]}
            >
              {entry.rank}. {isCurrentUser ? 'You' : entry.name}
            </Text>
            <Text
              style={[
                styles.leaderScore,
                isCurrentUser && { color: '#1bb998', fontWeight: '700' },
              ]}
            >
              {entry.score.toLocaleString()}
            </Text>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fbfaf2',
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  backButton: {
    marginBottom: 10,
  },
  backText: {
    color: '#1bb998',
    fontSize: 16,
    fontWeight: '600',
  },
  samaritanBox: {
    backgroundColor: '#1bb998',
    borderRadius: 20,
    paddingVertical: 30,
    alignItems: 'center',
    marginBottom: 30,
  },
  samaritanLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 1,
  },
  samaritanValue: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleText: {
    color: '#1bb998',
    fontWeight: '600',
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginVertical: 10,
  },
  taskCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  taskSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  expandedCard: {
    backgroundColor: '#f6f6f6',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    marginTop: -6,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 6,
  },
  detailText: {
    fontSize: 14,
    color: '#444',
    marginTop: 2,
  },
  detailStatus: {
    fontSize: 14,
    color: '#1bb998',
    fontWeight: '700',
    marginTop: 2,
  },
  detailElo: {
    fontSize: 15,
    color: '#1bb998',
    fontWeight: '700',
    marginTop: 2,
  },
  leaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  leaderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  leaderScore: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
});
