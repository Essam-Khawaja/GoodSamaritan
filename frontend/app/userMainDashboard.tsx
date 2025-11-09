// app/mapDash.tsx
import * as Location from 'expo-location';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Easing,
  FlatList,
  LayoutAnimation,
  PanResponder,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  UIManager,
  View,
} from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import { useRouter } from 'expo-router';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

/**
 * BACKEND-SIDE TYPES (shape of your API responses)
 */
type UserStats = {
  samaritanScore: number;
  // tasksCompleted?: number;
  // tasksInProgress?: number;
  // rank?: number;
};

type UserProfile = {
  userId: string;
  email: string;
  fullName: string;
  userStats: UserStats;
};

type BackendTask = {
  taskId: string;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  samaritanScore: number;
  orgId: string;
  orgEmail: string;
  orgName: string;
  userId: string | null; // null if unclaimed
  taskStatus: number;    // e.g. 0=Available, 1=Pending, 2=Done, 3=Incomplete
};

/**
 * FRONTEND-SIDE TYPES (what the screen uses)
 */
type TaskStatus = 'Done' | 'Pending' | 'Incomplete' | 'Available';
type LatLng = { latitude: number; longitude: number };

type Task = {
  id: string;              // maps from taskId
  title: string;
  organization: string;    // orgName
  description: string;
  elo: number;             // samaritanScore for this task
  status: TaskStatus;
  coords: LatLng;          // from latitude / longitude
};

type Coords = Location.LocationObjectCoords;

const STATUS_PIN_COLORS: Record<TaskStatus, string> = {
  Done: '#1bb998',
  Pending: '#F6C947',
  Incomplete: '#E57373',
  Available: '#9ca3af',
};

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

// Replace this with however you store the logged-in user
const CURRENT_USER_ID = 'TODO_CURRENT_USER_ID';

/**
 * Helpers to map backend → UI
 */
function mapBackendStatusToTaskStatus(taskStatus: number): TaskStatus {
  // Adjust this mapping to match your actual enum on the backend
  // Example: 0=Available, 1=Pending, 2=Done, 3=Incomplete
  switch (taskStatus) {
    case 2:
      return 'Done';
    case 1:
      return 'Pending';
    case 3:
      return 'Incomplete';
    case 0:
    default:
      return 'Available';
  }
}

function mapBackendTaskToTask(t: BackendTask): Task {
  return {
    id: t.taskId,
    title: t.title,
    organization: t.orgName,
    description: t.description,
    elo: t.samaritanScore,
    status: mapBackendStatusToTaskStatus(t.taskStatus),
    coords: {
      latitude: t.latitude,
      longitude: t.longitude,
    },
  };
}

/**
 * Placeholder API functions – plug your real backend here.
 * These are intentionally simple so you only need to swap out the internals.
 */

async function fetchUserProfile(userId: string): Promise<UserProfile> {
  // TODO: Replace with real backend call, e.g.:
  // const res = await fetch(`https://api.yourapp.com/users/${userId}`);
  // if (!res.ok) throw new Error('Failed to fetch user');
  // return await res.json();

  // Temporary placeholder so the screen renders:
  return {
    userId,
    email: 'user@example.com',
    fullName: 'User',
    userStats: {
      samaritanScore: 0,
    },
  };
}

async function fetchUserTasks(userId: string): Promise<BackendTask[]> {
  // TODO: Replace with real backend call, e.g.:
  // const res = await fetch(`https://api.yourapp.com/users/${userId}/tasks`);
  // if (!res.ok) throw new Error('Failed to fetch user tasks');
  // return await res.json();

  // Temporary: no tasks until backend is wired
  return [];
}

async function fetchAvailableTasks(
  latitude: number,
  longitude: number
): Promise<BackendTask[]> {
  // TODO: Replace with real backend call, e.g.:
  // const res = await fetch(
  //   `https://api.yourapp.com/tasks/available?lat=${latitude}&lon=${longitude}`
  // );
  // if (!res.ok) throw new Error('Failed to fetch available tasks');
  // return await res.json();

  // Temporary: no tasks until backend is wired
  return [];
}

async function claimTaskOnBackend(taskId: string, userId: string): Promise<void> {
  // TODO: Replace with real backend call, e.g.:
  // await fetch(`https://api.yourapp.com/tasks/${taskId}/claim`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ userId }),
  // });
}

/**
 * Component
 */
export default function UserDashboard() {
  const router = useRouter();
  const screenH = Dimensions.get('window').height;

  const MAP_COLLAPSED = Math.round(screenH * 0.7);
  const MAP_EXPANDED = Math.round(screenH * 0.3);

  const [username, setUsername] = useState<string>('User');
  const [samaritanScore, setSamaritanScore] = useState<number>(0);
  const [myTasks, setMyTasks] = useState<Task[]>([]);
  const [availableTasks, setAvailableTasks] = useState<Task[]>([]);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const [coords, setCoords] = useState<Coords | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [loadingData, setLoadingData] = useState(false);

  const mapRef = useRef<MapView | null>(null);
  const subRef = useRef<Location.LocationSubscription | null>(null);

  const mapHeight = useRef(new Animated.Value(MAP_COLLAPSED)).current;
  const startHeightRef = useRef(MAP_COLLAPSED);
  const [sheetExpanded, setSheetExpanded] = useState(false);

  const dragRAF = useRef<number | null>(null);
  const dyRef = useRef(0);

  const scrollRef = useRef<ScrollView>(null);
  const layoutYs = useRef<Record<string, number>>({});

  const setMapHeight = (to: number, animate = true) => {
    const clamped = clamp(to, MAP_EXPANDED, MAP_COLLAPSED);
    startHeightRef.current = clamped;
    if (animate) {
      Animated.timing(mapHeight, {
        toValue: clamped,
        duration: 280,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();
    } else {
      mapHeight.setValue(clamped);
    }
    setSheetExpanded(clamped === MAP_EXPANDED);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 4,
      onPanResponderGrant: () => {
        mapHeight.stopAnimation((val: number) => {
          startHeightRef.current = val ?? startHeightRef.current;
        });
        if (dragRAF.current) {
          cancelAnimationFrame(dragRAF.current);
          dragRAF.current = null;
        }
      },
      onPanResponderMove: (_, g) => {
        dyRef.current = g.dy;
        if (dragRAF.current == null) {
          dragRAF.current = requestAnimationFrame(() => {
            const next = clamp(
              startHeightRef.current - dyRef.current,
              MAP_EXPANDED,
              MAP_COLLAPSED
            );
            mapHeight.setValue(next);
            dragRAF.current = null;
          });
        }
      },
      onPanResponderRelease: (_, g) => {
        if (dragRAF.current) {
          cancelAnimationFrame(dragRAF.current);
          dragRAF.current = null;
        }
        const predicted = startHeightRef.current - (g.dy + 0.25 * g.vy * 100);
        const toExpanded =
          predicted < (MAP_COLLAPSED + MAP_EXPANDED) / 2 || g.vy < -0.5;
        const target = toExpanded ? MAP_EXPANDED : MAP_COLLAPSED;

        Animated.spring(mapHeight, {
          toValue: target,
          tension: 140,
          friction: 18,
          useNativeDriver: false,
        }).start(() => {
          startHeightRef.current = target;
          setSheetExpanded(target === MAP_EXPANDED);
        });
      },
      onPanResponderTerminate: () => {
        const current = (mapHeight as any)._value ?? startHeightRef.current;
        const target =
          current < (MAP_COLLAPSED + MAP_EXPANDED) / 2 ? MAP_EXPANDED : MAP_COLLAPSED;
        Animated.spring(mapHeight, {
          toValue: target,
          tension: 140,
          friction: 18,
          useNativeDriver: false,
        }).start(() => {
          startHeightRef.current = target;
          setSheetExpanded(target === MAP_EXPANDED);
        });
      },
    })
  ).current;

  /**
   * Location subscription
   */
  useEffect(() => {
    let mounted = true;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission needed',
          'Enable Location access in Settings to show your position.'
        );
        setLoadingLocation(false);
        return;
      }

      const last = await Location.getLastKnownPositionAsync();
      if (mounted && last?.coords) {
        setCoords(last.coords);
      }

      subRef.current = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Balanced, timeInterval: 3000, distanceInterval: 5 },
        (loc) => {
          if (!mounted) return;
          setCoords(loc.coords);
        }
      );

      setLoadingLocation(false);
    })();

    return () => {
      mounted = false;
      subRef.current?.remove();
    };
  }, []);

  /**
   * Fetch user + tasks once we have coordinates
   */
  useEffect(() => {
    if (!coords) return;

    const loadData = async () => {
      try {
        setLoadingData(true);

        const [userProfile, myTasksBackend, availableTasksBackend] = await Promise.all([
          fetchUserProfile(CURRENT_USER_ID),
          fetchUserTasks(CURRENT_USER_ID),
          fetchAvailableTasks(coords.latitude, coords.longitude),
        ]);

        setUsername(userProfile.fullName);
        setSamaritanScore(userProfile.userStats.samaritanScore);

        setMyTasks(myTasksBackend.map(mapBackendTaskToTask));
        setAvailableTasks(availableTasksBackend.map(mapBackendTaskToTask));
      } catch (err) {
        console.error('Failed to load dashboard data', err);
        Alert.alert('Error', 'Unable to load your tasks right now. Please try again later.');
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, [coords]);

  const initialRegion: Region = {
    latitude: coords?.latitude ?? 51.078365,
    longitude: coords?.longitude ?? -114.128307,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  const allTasks: Task[] = [...myTasks, ...availableTasks];

  const toggleTask = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const claimTask = async (id: string) => {
    const task = availableTasks.find((t) => t.id === id);
    if (!task) return;

    // Optimistic UI update
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setAvailableTasks((prev) => prev.filter((t) => t.id !== id));
    setMyTasks((prev) => [{ ...task, status: 'Pending' }, ...prev]);
    setExpandedIds(new Set([id]));

    try {
      await claimTaskOnBackend(id, CURRENT_USER_ID);
      // Optionally refetch user profile / tasks here if you want fresh scores
    } catch (err) {
      console.error('Failed to claim task', err);
      Alert.alert('Error', 'Could not claim this task. Please try again.');
      // Roll back optimistic change
      setMyTasks((prev) => prev.filter((t) => t.id !== id));
      setAvailableTasks((prev) => [task, ...prev]);
    }
  };

  const focusTask = (id: string) => {
    const t = allTasks.find((x) => x.id === id);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedIds(new Set([id]));

    if (t?.coords) {
      mapRef.current?.animateCamera(
        { center: { latitude: t.coords.latitude, longitude: t.coords.longitude }, zoom: 16 },
        { duration: 500 }
      );
    }
    setMapHeight(MAP_EXPANDED, true);
    setSheetExpanded(true);

    requestAnimationFrame(() => {
      setTimeout(() => {
        const y = layoutYs.current[id] ?? 0;
        scrollRef.current?.scrollTo({ y: Math.max(0, y - 80), animated: true });
      }, 320);
    });
  };

  const renderTask = useCallback(
    ({ item }: { item: Task }) => {
      const isExpanded = expandedIds.has(item.id);
      return (
        <View
          onLayout={(e) => {
            layoutYs.current[item.id] = e.nativeEvent.layout.y;
          }}
        >
          <Pressable onPress={() => toggleTask(item.id)} style={styles.taskCard}>
            <View style={styles.taskTextContainer}>
              <Text style={styles.taskTitle}>{item.title}</Text>
              <Text style={styles.taskSubtitle}>{item.organization}</Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: STATUS_PIN_COLORS[item.status] },
              ]}
            >
              <Text style={styles.statusText}>{item.status}</Text>
            </View>
          </Pressable>

          {isExpanded && (
            <View style={styles.expandedCard}>
              <Text style={styles.detailLabel}>Organization</Text>
              <Text style={styles.detailText}>{item.organization}</Text>

              <Text style={styles.detailLabel}>Description</Text>
              <Text style={styles.detailText}>{item.description}</Text>

              <Text style={styles.detailLabel}>Samaritan Score</Text>
              <Text style={styles.detailElo}>+{item.elo} pts</Text>

              {item.status === 'Available' && (
                <Pressable onPress={() => claimTask(item.id)} style={styles.claimBtn}>
                  <Text style={styles.claimBtnText}>Claim Task</Text>
                </Pressable>
              )}
            </View>
          )}
        </View>
      );
    },
    [expandedIds, claimTask]
  );

  const isLoadingLocation = loadingLocation && !coords;

  return (
    <SafeAreaView style={styles.root}>
      {isLoadingLocation ? (
        <View style={styles.center}>
          <ActivityIndicator />
          <Text style={{ marginTop: 8 }}>Getting your location…</Text>
        </View>
      ) : (
        <>
          <Animated.View style={{ height: mapHeight, overflow: 'hidden' }}>
            <MapView
              ref={mapRef}
              style={StyleSheet.absoluteFill}
              initialRegion={initialRegion}
              showsUserLocation
              showsMyLocationButton
              onPress={() => setMapHeight(MAP_COLLAPSED, true)}
            >
              {allTasks.map((t) => (
                <Marker
                  key={t.id}
                  coordinate={t.coords}
                  title={t.title}
                  description={t.organization}
                  pinColor={STATUS_PIN_COLORS[t.status]}
                  onPress={() => focusTask(t.id)}
                />
              ))}
            </MapView>
          </Animated.View>

          <View style={styles.sheet}>
            <View style={styles.sheetHeader} {...panResponder.panHandlers}>
              <Pressable
                onPress={() => setMapHeight(MAP_EXPANDED, true)}
                style={styles.headerPress}
              >
                {!sheetExpanded ? (
                  <View style={styles.peekBar}>
                    <View>
                      <Text style={styles.peekHello}>Hello, {username}</Text>
                      <Text style={styles.peekHint}>Tap to view your tasks & stats</Text>
                    </View>
                    <Pressable
                      onPress={() => {
                        router.push('/userImpactDashboard');
                      }}
                      style={styles.peekScore}
                      hitSlop={{ top: 6, left: 6, right: 6, bottom: 6 }}
                    >
                      <Text style={styles.peekScoreLabel}>Samaritan</Text>
                      <Text style={styles.peekScoreValue}>{samaritanScore}</Text>
                    </Pressable>
                  </View>
                ) : (
                  <View style={styles.headerRow}>
                    <View>
                      <Text style={styles.greeting}>Hello,</Text>
                      <Text style={styles.username}>{username}</Text>
                    </View>
                    <Pressable
                      onPress={() => {
                        router.push('/userImpactDashboard');
                      }}
                      style={styles.scoreBox}
                      hitSlop={{ top: 6, left: 6, right: 6, bottom: 6 }}
                    >
                      <Text style={styles.scoreLabel}>Samaritan Score</Text>
                      <Text style={styles.scoreValue}>{samaritanScore}</Text>
                    </Pressable>
                  </View>
                )}
              </Pressable>
            </View>

            {sheetExpanded ? (
              <ScrollView
                ref={scrollRef}
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingBottom: 32 }}
              >
                {loadingData && (
                  <View style={{ paddingHorizontal: 16, paddingVertical: 8 }}>
                    <ActivityIndicator />
                  </View>
                )}

                <Text style={styles.sectionTitle}>My Tasks</Text>
                {myTasks.length === 0 && !loadingData ? (
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
                {availableTasks.length === 0 && !loadingData ? (
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
            ) : null}
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fbfaf2' },
  sheet: {
    flex: 1,
    backgroundColor: '#fbfaf2',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 8,
    elevation: 10,
    overflow: 'hidden',
  },
  sheetHeader: {
    paddingTop: 8,
    paddingBottom: 8,
    paddingHorizontal: 16,
  },
  headerPress: { borderRadius: 14 },
  peekBar: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  peekHello: { fontSize: 16, fontWeight: '700', color: '#111827' },
  peekHint: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  peekScore: {
    backgroundColor: '#1bb998',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  peekScoreLabel: { color: '#fff', fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  peekScoreValue: { color: '#fff', fontSize: 18, fontWeight: '800', marginTop: 2 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  greeting: { fontSize: 22, fontWeight: '600', color: '#000' },
  username: { fontSize: 26, fontWeight: '700', color: '#000' },
  scoreBox: {
    backgroundColor: '#1bb998',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  scoreLabel: { fontSize: 14, color: '#fbfaf2' },
  scoreValue: { fontSize: 22, fontWeight: 'bold', color: '#fbfaf2' },
  claimBtn: {
    backgroundColor: '#1bb998',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  claimBtnText: { color: '#fbfaf2', fontSize: 16, fontWeight: '700' },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
    marginTop: 10,
    paddingHorizontal: 16,
  },
  taskCard: {
    backgroundColor: '#fbfaf2',
    borderRadius: 15,
    padding: 16,
    marginHorizontal: 16,
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
  taskTextContainer: { flex: 1 },
  taskTitle: { fontSize: 16, fontWeight: '600', color: '#000' },
  taskSubtitle: { fontSize: 14, color: '#666', marginTop: 2 },
  statusBadge: {
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
    alignSelf: 'flex-start',
  },
  statusText: { color: '#fbfaf2', fontWeight: '600' },
  expandedCard: {
    backgroundColor: '#f6f6f6',
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 14,
    marginTop: -6,
  },
  detailLabel: { fontSize: 14, fontWeight: '600', color: '#333', marginTop: 6 },
  detailText: { fontSize: 14, color: '#444', marginTop: 2 },
  detailElo: { fontSize: 15, color: '#1bb998', fontWeight: '700', marginTop: 2 },
  emptyText: { textAlign: 'center', color: '#888', marginBottom: 20 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
