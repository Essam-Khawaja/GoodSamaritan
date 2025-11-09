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
} from 'react-native';
import { useRouter } from 'expo-router';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type CompletedTask = {
  id: string;
  title: string;
  organization: string;
  description: string;
  elo: number;
  completedAt: string;
};

type LeaderboardEntry = {
  id: string;
  name: string;
  score: number;
};

export default function UserImpactDashboard() {
  const router = useRouter();
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [showAllTasks, setShowAllTasks] = useState(false);
  const [showFullLeaderboard, setShowFullLeaderboard] = useState(false);
  const [samaritanScore, setSamaritanScore] = useState(3000);
  const [completedTasks, setCompletedTasks] = useState<CompletedTask[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userRankIndex, setUserRankIndex] = useState<number>(2);

  useEffect(() => {
    const fetchData = async () => {
      const mockCompleted = [
        {
          id: '1',
          title: 'Park Cleanup',
          organization: 'EcoVolunteers',
          description: 'Cleaned the local park with other volunteers.',
          elo: 120,
          completedAt: '2025-11-07T10:30:00',
        },
        {
          id: '2',
          title: 'Sort Donations',
          organization: 'Greenwood Shelter',
          description: 'Sorted donated clothes for families in need.',
          elo: 90,
          completedAt: '2025-11-06T14:00:00',
        },
        {
          id: '3',
          title: 'Help Seniors',
          organization: 'Lincoln Center',
          description: 'Assisted seniors with daily errands.',
          elo: 80,
          completedAt: '2025-11-05T09:00:00',
        },
        {
          id: '4',
          title: 'Organize Event',
          organization: 'Westside Gardeners',
          description: 'Helped organize a community planting event.',
          elo: 100,
          completedAt: '2025-10-31T12:00:00',
        },
      ];

      const mockLeaderboard = [
        { id: '1', name: 'Alice', score: 5000 },
        { id: '2', name: 'Bob', score: 4000 },
        { id: '3', name: 'You', score: 3000 },
        { id: '4', name: 'Charlie', score: 2000 },
        { id: '5', name: 'Diana', score: 1500 },
        { id: '6', name: 'Eve', score: 1000 },
      ];

      await new Promise((resolve) => setTimeout(resolve, 300));
      setCompletedTasks(mockCompleted.sort((a, b) => (a.completedAt < b.completedAt ? 1 : -1)));
      setLeaderboard(mockLeaderboard);
      setUserRankIndex(mockLeaderboard.findIndex((p) => p.name === 'You'));
    };

    fetchData();
  }, []);

  const toggleExpandTask = (taskId: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedTask(expandedTask === taskId ? null : taskId);
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

            <Text style={styles.detailLabel}>Elo Earned</Text>
            <Text style={styles.detailElo}>+{item.elo} pts</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const filteredLeaderboard = showFullLeaderboard
    ? leaderboard
    : leaderboard.slice(
        Math.max(0, userRankIndex - 2),
        Math.min(leaderboard.length, userRankIndex + 3)
      );

  const filteredTasks = showAllTasks ? completedTasks : completedTasks.slice(0, 3);

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <View style={styles.samaritanBox}>
        <Text style={styles.samaritanLabel}>Samaritan Score</Text>
        <Text style={styles.samaritanValue}>{samaritanScore.toLocaleString()}</Text>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Tasks Completed</Text>
        {completedTasks.length > 3 && (
          <TouchableOpacity onPress={() => setShowAllTasks(!showAllTasks)}>
            <Text style={styles.toggleText}>{showAllTasks ? 'Show Less' : 'Show All'}</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filteredTasks}
        renderItem={renderTask}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
      />

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Leaderboard</Text>
        {leaderboard.length > 5 && (
          <TouchableOpacity onPress={() => setShowFullLeaderboard(!showFullLeaderboard)}>
            <Text style={styles.toggleText}>{showFullLeaderboard ? 'Show Less' : 'Show All'}</Text>
          </TouchableOpacity>
        )}
      </View>

      {filteredLeaderboard.map((entry, index) => (
        <View
          key={entry.id}
          style={[
            styles.leaderRow,
            entry.name === 'You' && { backgroundColor: '#e6f9f3' },
          ]}
        >
          <Text
            style={[
              styles.leaderText,
              entry.name === 'You' && { color: '#1bb998', fontWeight: '700' },
            ]}
          >
            {entry.id}. {entry.name}
          </Text>
          <Text
            style={[
              styles.leaderScore,
              entry.name === 'You' && { color: '#1bb998', fontWeight: '700' },
            ]}
          >
            {entry.score.toLocaleString()}
          </Text>
        </View>
      ))}
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
  headerText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
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
