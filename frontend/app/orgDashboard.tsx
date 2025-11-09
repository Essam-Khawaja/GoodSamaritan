import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
} from 'react-native';

type TaskStatus = 'Unclaiamed' | 'Claimed' | 'Completed';
type Evaluation = 'None' | 'Complete' | 'Incomplete';

type Task = {
  id: string;
  title: string;
  status: TaskStatus;
  evaluation?: Evaluation;
};

export default function OrgDashboard() {
  const orgName = 'Org Name Here'; 
  const [selectedTab, setSelectedTab] = useState<TaskStatus>('Unclaimed');

  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: 'Park Cleanup', status: 'Unclaimed' },
    { id: '2', title: 'Food Drive', status: 'Unclaimed' },
    { id: '3', title: 'Toy Donation', status: 'Claimed' },
    { id: '4', title: 'Community Garden', status: 'Completed', evaluation: 'None' },
    { id: '5', title: 'Book Sorting', status: 'Completed', evaluation: 'None' },
  ]);

  const filteredTasks = tasks.filter((task) => task.status === selectedTab);

  const handleEvaluation = (id: string, result: Evaluation) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, evaluation: result } : t))
    );
  };

  const renderTask = ({ item }: { item: Task }) => {
    const isCompletedTab = selectedTab === 'Completed';
    return (
      <View style={styles.taskCard}>
        <View style={{ flex: 1 }}>
          <Text style={styles.taskTitle}>{item.title}</Text>
        </View>

        <View style={[styles.statusBadge, getStatusStyle(item.status)]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>

        {/* Evaluation buttons for completed tasks */}
        {isCompletedTab && (
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
        return { backgroundColor: '#e5e7eb' };
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeTitle}>Welcome {orgName}</Text>
          <Text style={styles.subtitle}>
            View, add, and manage your organization’s volunteer tasks.
          </Text>
        </View>
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>+ Add Task</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {(['Unclaimed', 'Claimed', 'Completed'] as TaskStatus[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setSelectedTab(tab)}
            style={[
              styles.tab,
              selectedTab === tab && styles.tabActive,
            ]}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === tab && styles.tabTextActive,
              ]}
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
    </SafeAreaView>
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
    alignItems: 'flex-start',
    marginBottom: 25,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#000',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: '#4b5563',
    lineHeight: 20,
    width: 260,
  },
  addButton: {
    backgroundColor: '#1bb998',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 16,
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
  taskCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 1,
  },
  taskTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#000',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 12,
    marginTop: 6,
  },
  statusText: {
    fontWeight: '600',
    color: '#000',
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
    color: '#fff',
    fontWeight: '700',
  },
  evaluationResult: {
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginTop: 6,
  },
  evaluationResultText: {
    color: '#fff',
    fontWeight: '700',
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: 40,
  },
  emptyText: {
    textAlign: 'center',
    color: '#9ca3af',
    marginTop: 30,
  },
});
