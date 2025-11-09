import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  LayoutAnimation,
  UIManager,
  Platform,
  Alert,
} from 'react-native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type TaskStatus = 'Unclaimed' | 'Claimed' | 'Completed';
type Evaluation = 'None' | 'Complete' | 'Incomplete';

type Task = {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  elo: number;
  claimedBy?: string;
  evaluation?: Evaluation;
};

export default function OrgDashboard() {
  const orgName = 'Org Name Here';
  const [selectedTab, setSelectedTab] = useState<TaskStatus>('Unclaimed');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Park Cleanup',
      description: 'Help clean up the local community park.',
      status: 'Unclaimed',
      elo: 120,
    },
    {
      id: '2',
      title: 'Food Drive',
      description: 'Collect and organize donated food items.',
      status: 'Unclaimed',
      elo: 100,
    },
    {
      id: '3',
      title: 'Toy Donation',
      description: 'Deliver donated toys to the children’s center.',
      status: 'Claimed',
      claimedBy: 'Alex Johnson',
      elo: 80,
      evaluation: 'None',
    },
    {
      id: '4',
      title: 'Community Garden',
      description: 'Assist in planting and maintaining the garden.',
      status: 'Completed',
      claimedBy: 'Taylor Lee',
      elo: 150,
      evaluation: 'Complete',
    },
    {
      id: '5',
      title: 'Book Sorting',
      description: 'Sort and categorize donated books for the library.',
      status: 'Completed',
      claimedBy: 'Jordan Smith',
      elo: 100,
      evaluation: 'Incomplete',
    },
  ]);

  const filteredTasks = tasks.filter((task) => task.status === selectedTab);

  const handleEvaluation = (id: string, result: Evaluation) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              evaluation: result,
              status:
                selectedTab === 'Claimed' && result !== 'None'
                  ? 'Completed'
                  : t.status,
            }
          : t
      )
    );
  };

  const confirmDelete = (id: string, title: string) => {
    Alert.alert(
      'Delete Task',
      `Are you sure you want to delete “${title}”? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => handleDelete(id),
        },
      ]
    );
  };

  const handleDelete = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const toggleExpand = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const renderTask = ({ item }: { item: Task }) => {
    const isExpanded = expandedIds.has(item.id);
    const isClaimedTab = selectedTab === 'Claimed';

    return (
      <View style={styles.taskWrapper}>
        <TouchableOpacity
          onPress={() => toggleExpand(item.id)}
          activeOpacity={0.8}
          style={styles.taskCard}
        >
          <View style={styles.taskHeader}>
            <Text style={styles.taskTitle}>{item.title}</Text>
            <View style={[styles.statusBadge, getStatusStyle(item.status)]}>
              <Text style={styles.statusText}>{item.status}</Text>
            </View>
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.expandedSection}>
            <Text style={styles.detailLabel}>Task Details</Text>
            <Text style={styles.detailText}>{item.description}</Text>

            {item.claimedBy && (
              <>
                <Text style={styles.detailLabel}>Claimed By</Text>
                <Text style={styles.detailText}>{item.claimedBy}</Text>
              </>
            )}

            <Text style={styles.detailLabel}>Elo Reward</Text>
            <Text style={styles.detailElo}>+{item.elo} pts</Text>

            {/* For Claimed tab — evaluation options */}
            {isClaimedTab && (
              <View style={styles.evaluationContainer}>
                {item.evaluation === 'None' ? (
                  <>
                    <TouchableOpacity
                      style={[styles.evalBtn, { backgroundColor: '#1bb998' }]}
                      onPress={() => handleEvaluation(item.id, 'Complete')}
                    >
                      <Text style={styles.evalBtnText}>Mark as Complete</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.evalBtn, { backgroundColor: '#E57373' }]}
                      onPress={() => handleEvaluation(item.id, 'Incomplete')}
                    >
                      <Text style={styles.evalBtnText}>Mark as Incomplete</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <View
                    style={[
                      styles.evaluationResult,
                      item.evaluation === 'Complete'
                        ? { backgroundColor: '#1bb998' }
                        : { backgroundColor: '#E57373' },
                    ]}
                  >
                    <Text style={styles.evaluationResultText}>
                      {item.evaluation === 'Complete'
                        ? 'Marked Complete'
                        : 'Marked Incomplete'}
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Delete option for Unclaimed tasks */}
            {item.status === 'Unclaimed' && (
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => confirmDelete(item.id, item.title)}
              >
                <Text style={styles.deleteBtnText}>Delete Task</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  };

  const getStatusStyle = (status: TaskStatus) => {
    switch (status) {
      case 'Completed':
        return { backgroundColor: '#1bb998' };
      case 'Claimed':
        return { backgroundColor: '#F6C947' };
      case 'Unclaimed':
      default:
        return { backgroundColor: '#9ca3af' };
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.welcomeTitle}>Welcome {orgName}</Text>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {(['Unclaimed', 'Claimed', 'Completed'] as TaskStatus[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setSelectedTab(tab)}
            style={[styles.tab, selectedTab === tab && styles.tabActive]}
          >
            <Text
              style={[styles.tabText, selectedTab === tab && styles.tabTextActive]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Task List */}
      <FlatList
        data={filteredTasks}
        renderItem={renderTask}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No tasks under this category.</Text>
        }
      />

      {/* Add Task button for Unclaimed */}
      {selectedTab === 'Unclaimed' && (
        <TouchableOpacity style={styles.bottomAddButton}>
          <Text style={styles.bottomAddButtonText}>+ Add New Task</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fbfaf2',
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#000',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: '#4b5563',
    marginBottom: 20,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#fff',
  },
  tabText: {
    color: '#6b7280',
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#000',
    fontWeight: '700',
  },
  taskWrapper: {
    marginBottom: 10,
  },
  taskCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 1,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#000',
  },
  statusBadge: {
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  statusText: {
    fontWeight: '600',
    color: '#fbfaf2',
  },
  expandedSection: {
    backgroundColor: '#fbfaf2',
    marginTop: 8,
    padding: 14,
    borderRadius: 12,
  },
  detailLabel: {
    fontWeight: '700',
    color: '#333',
    fontSize: 14,
    marginTop: 8,
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
  evaluationContainer: {
    marginTop: 12,
  },
  evalBtn: {
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
    marginBottom: 8,
  },
  evalBtnText: {
    color: '#fbfaf2',
    fontWeight: '700',
  },
  evaluationResult: {
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginTop: 6,
  },
  evaluationResultText: {
    color: '#fbfaf2',
    fontWeight: '700',
    textAlign: 'center',
  },
  deleteBtn: {
    backgroundColor: '#ef4444',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginTop: 14,
    alignItems: 'center',
  },
  deleteBtnText: {
    color: '#fbfaf2',
    fontWeight: '700',
  },
  bottomAddButton: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
    backgroundColor: '#1bb998',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  bottomAddButtonText: {
    color: '#fbfaf2',
    fontSize: 16,
    fontWeight: '700',
  },
  listContent: {
    paddingBottom: 100,
  },
  emptyText: {
    textAlign: 'center',
    color: '#9ca3af',
    marginTop: 30,
  },
});
