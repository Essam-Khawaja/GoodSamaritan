import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type TaskStatus = 'Done' | 'Pending' | 'Incomplete' | 'Available';

type Task = {
  id: string;
  title: string;
  organization: string;
  location: string;
  description: string;
  elo: number;
  status: TaskStatus;
};

type DashboardData = {
  username: string;
  impactScore: number;
  myTasks: Task[];
  availableTasks: Task[];
};

export default function UserDashboard() {
  const [username, setUsername] = useState<string>('Loading...');
  const [impactScore, setImpactScore] = useState<number>(0);
  const [myTasks, setMyTasks] = useState<Task[]>([]);
  const [availableTasks, setAvailableTasks] = useState<Task[]>([]);
  const [expandedTask, setExpandedTask] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const sampleData: DashboardData = {
        username: 'Admin',
        impactScore: 1234,
        myTasks: [
          {
            id: '1',
            title: 'Park Cleanup',
            organization: 'EcoVolunteers',
            location: 'Central Park',
            description: 'Help clean up trash and debris from the park area to make it safe for the community.',
            elo: 120,
            status: 'Done',
          },
          {
            id: '2',
            title: 'Sort Donations',
            organization: 'Greenwood Shelter',
            location: 'Greenwood Community Center',
            description: 'Assist in organizing and labeling incoming donation boxes for distribution.',
            elo: 90,
            status: 'Pending',
          },
        ],
        availableTasks: [
          {
            id: '3',
            title: 'Help Seniors',
            organization: 'Lincoln Community Center',
            location: 'Lincoln Neighborhood',
            description: 'Spend time with elderly residents, helping them with light chores or technology setup.',
            elo: 150,
            status: 'Available',
          },
          {
            id: '4',
            title: 'Organize Event',
            organization: 'Westside Gardeners',
            location: 'Westside Community Garden',
            description: 'Assist in planning the spring planting event for community members.',
            elo: 100,
            status: 'Available',
          },
        ],
      };

      await new Promise((resolve) => setTimeout(resolve, 1000));
      setUsername(sampleData.username);
      setImpactScore(sampleData.impactScore);
      setMyTasks(sampleData.myTasks);
      setAvailableTasks(sampleData.availableTasks);
    };

    fetchDashboardData();
  }, []);

  const toggleExpand = (taskId: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedTask(expandedTask === taskId ? null : taskId);
  };

  const renderTask = ({ item }: { item: Task }) => {
    const isExpanded = expandedTask === item.id;

    return (
      <TouchableOpacity onPress={() => toggleExpand(item.id)} activeOpacity={0.8}>
        <View style={styles.taskCard}>
          <View style={styles.taskTextContainer}>
            <Text style={styles.taskTitle}>{item.title}</Text>
            <Text style={styles.taskSubtitle}>{item.location}</Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              item.status === 'Done' && { backgroundColor: '#1bb998' },
              item.status === 'Pending' && { backgroundColor: '#F6C947' },
              item.status === 'Incomplete' && { backgroundColor: '#E57373' },
              item.status === 'Available' && { backgroundColor: '#d9d9d9' },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                item.status === 'Available' && { color: '#000' },
              ]}
            >
              {item.status}
            </Text>
          </View>
        </View>

        {isExpanded && (
          <View style={styles.expandedCard}>
            <Text style={styles.detailLabel}>Organization</Text>
            <Text style={styles.detailText}>{item.organization}</Text>

            <Text style={styles.detailLabel}>Location</Text>
            <Text style={styles.detailText}>{item.location}</Text>

            <Text style={styles.detailLabel}>Description</Text>
            <Text style={styles.detailText}>{item.description}</Text>

            <Text style={styles.detailLabel}>Elo Reward</Text>
            <Text style={styles.detailElo}>+{item.elo} pts</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello,</Text>
          <Text style={styles.username}>{username}</Text>
        </View>
        <View style={styles.scoreBox}>
          <Text style={styles.scoreLabel}>Impact Score</Text>
          <Text style={styles.scoreValue}>{impactScore}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>My Tasks</Text>
      {myTasks.length === 0 ? (
        <Text style={styles.emptyText}>You have no tasks yet.</Text>
      ) : (
        <FlatList
          data={myTasks}
          renderItem={renderTask}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
      )}

      <Text style={styles.sectionTitle}>Tasks Available</Text>
      {availableTasks.length === 0 ? (
        <Text style={styles.emptyText}>No available tasks right now.</Text>
      ) : (
        <FlatList
          data={availableTasks}
          renderItem={renderTask}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
      )}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '600',
    color: '#000',
  },
  username: {
    fontSize: 26,
    fontWeight: '700',
    color: '#000',
  },
  scoreBox: {
    backgroundColor: '#fbfaf2',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    elevation: 2,
  },
  scoreLabel: {
    fontSize: 14,
    color: '#444',
  },
  scoreValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1bb998',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
    marginTop: 10,
  },
  taskCard: {
    backgroundColor: '#fbfaf2',
    borderRadius: 15,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  taskTextContainer: {
    flex: 1,
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
  statusBadge: {
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: '#fbfaf2',
    fontWeight: '600',
  },
  expandedCard: {
    backgroundColor: '#fbfaf2',
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
  emptyText: {
    textAlign: 'center',
    color: '#888',
    marginBottom: 20,
  },
});
