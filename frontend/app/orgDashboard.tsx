import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
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
  ActivityIndicator,
} from 'react-native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

/**
 * UI enums
 */
type TaskStatus = 'Unclaimed' | 'Claimed' | 'Completed' | 'Incomplete';
type Evaluation = 'None' | 'Complete' | 'Incomplete';

/**
 * Backend shapes (adjust to match your API exactly)
 */
type BackendTask = {
  taskId: string;
  title: string;
  description: string;
  samaritanScore: number; // base magnitude of Samaritan Score for this task
  orgId: string;
  userId?: string | null; // user who claimed/completed
  claimedByFullName?: string | null;
  taskStatus: number; // int status from backend (e.g. 0,1,2,3)
};

type BackendOrgDashboard = {
  orgId: string;
  orgName: string;
  tasks: BackendTask[];
};

// UI Task type for this screen
type Task = {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  samaritanScoreImpact: number; // can be positive or negative
  claimedBy?: string;
  evaluation: Evaluation;
};

// Replace with your real org ID from auth
const CURRENT_ORG_ID = 'TODO_CURRENT_ORG_ID';

/**
 * Map backend int taskStatus → UI TaskStatus
 * Adjust mapping to match your backend enum.
 */
function mapTaskStatus(status: number): TaskStatus {
  // Example:
  // 0 = unclaimed, 1 = claimed, 2 = completed, 3 = incomplete
  switch (status) {
    case 0:
      return 'Unclaimed';
    case 1:
      return 'Claimed';
    case 3:
      return 'Incomplete';
    case 2:
    default:
      return 'Completed';
  }
}

/**
 * Convert BackendTask → Task used in the UI
 */
function mapBackendTaskToUiTask(t: BackendTask): Task {
  const status = mapTaskStatus(t.taskStatus);

  // Base impact is positive magnitude from backend.
  // If backend already knows it's incomplete and wants penalty, you could send negative.
  // Here we assume backend sends positive, and we flip sign for incomplete.
  const base = t.samaritanScore;
  const impact =
    status === 'Incomplete'
      ? -Math.abs(base)
      : Math.abs(base);

  let evaluation: Evaluation = 'None';
  if (status === 'Completed') evaluation = 'Complete';
  if (status === 'Incomplete') evaluation = 'Incomplete';

  return {
    id: t.taskId,
    title: t.title,
    description: t.description,
    status,
    samaritanScoreImpact: impact,
    claimedBy: t.claimedByFullName ?? undefined,
    evaluation,
  };
}

/**
 * Placeholder API call to fetch all org dashboard data in one shot.
 * Wire this to your Python backend.
 */
async function fetchOrgDashboard(orgId: string): Promise<BackendOrgDashboard> {
  // TODO: Replace this with real network request, e.g.:
  //
  // const res = await fetch(`https://api.yourapp.com/orgs/${orgId}/dashboard`);
  // if (!res.ok) throw new Error('Failed to load org dashboard');
  // return await res.json();
  //
  return {
    orgId,
    orgName: 'Your Organization Name',
    tasks: [],
  };
}

/**
 * Placeholder API call to persist evaluation + penalty.
 * You can call your backend here to update task status & user stats.
 */
async function updateTaskEvaluation(
  orgId: string,
  taskId: string,
  evaluation: Evaluation
): Promise<void> {
  // TODO: POST to /orgs/{orgId}/tasks/{taskId}/evaluation with { evaluation }
  // Backend can compute and store the samaritan score impact, and update taskStatus.
  return;
}

export default function OrgDashboard() {
  const router = useRouter();
  const [orgName, setOrgName] = useState<string>('Organization');
  const [selectedTab, setSelectedTab] = useState<TaskStatus>('Unclaimed');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const loadOrgDashboard = async () => {
      try {
        setLoading(true);
        const data = await fetchOrgDashboard(CURRENT_ORG_ID);
        setOrgName(data.orgName);
        setTasks(data.tasks.map(mapBackendTaskToUiTask));
      } catch (err) {
        console.error('Failed to load org dashboard', err);
        // Optional: show Alert here
      } finally {
        setLoading(false);
      }
    };

    loadOrgDashboard();
  }, []);

  // Tab filter: Completed tab shows both Completed and Incomplete
  const filteredTasks = tasks.filter((task) =>
    selectedTab === 'Completed'
      ? task.status === 'Completed' || task.status === 'Incomplete'
      : task.status === selectedTab
  );

  const handleEvaluation = async (id: string, result: Evaluation) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;

        if (result === 'None') {
          return { ...t, evaluation: result };
        }

        const baseMagnitude = Math.abs(t.samaritanScoreImpact || 0) || 0;
        const impact =
          result === 'Complete' ? baseMagnitude : -baseMagnitude;

        return {
          ...t,
          evaluation: result,
          status: result === 'Complete' ? 'Completed' : 'Incomplete',
          samaritanScoreImpact: impact,
        };
      })
    );

    // Persist to backend
    try {
      await updateTaskEvaluation(CURRENT_ORG_ID, id, result);
    } catch (err) {
      console.error('Failed to update task evaluation', err);
      // Optional: rollback or show Alert
    }
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

    // TODO: call backend to delete task:
    // await deleteOrgTask(CURRENT_ORG_ID, id)
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
              <Text
                style={[
                  styles.statusText,
                  item.status === 'Unclaimed' && { color: '#fbfaf2' },
                ]}
              >
                {item.status}
              </Text>
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

            <Text style={styles.detailLabel}>Samaritan Score Impact</Text>
            <Text
              style={[
                styles.detailElo,
                item.samaritanScoreImpact < 0 && { color: '#E57373' },
              ]}
            >
              {item.samaritanScoreImpact >= 0
                ? `+${item.samaritanScoreImpact} pts`
                : `${item.samaritanScoreImpact} pts`}
            </Text>

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
                        : 'Marked Incomplete (Samaritan Score Penalty Applied)'}
                    </Text>
                  </View>
                )}
              </View>
            )}

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
      case 'Incomplete':
        return { backgroundColor: '#E57373' };
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

      {loading ? (
        <View style={{ marginTop: 20, alignItems: 'center' }}>
          <ActivityIndicator />
        </View>
      ) : (
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
      )}

      {selectedTab === 'Unclaimed' && (
        <TouchableOpacity
          style={styles.bottomAddButton}
          onPress={() => router.push('/addOrgTask')}
        >
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
