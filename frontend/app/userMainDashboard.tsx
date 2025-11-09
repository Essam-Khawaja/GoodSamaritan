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

type TaskStatus = 'Done' | 'Pending' | 'Incomplete' | 'Available';
type LatLng = { latitude: number; longitude: number };
type Task = {
  id: string;
  title: string;
  organization: string;
  location: string;   // human label
  description: string;
  elo: number;
  status: TaskStatus;
  coords: LatLng;     // pin location
};
type Coords = Location.LocationObjectCoords;

const STATUS_PIN_COLORS: Record<TaskStatus, string> = {
  Done: '#1bb998',       // green
  Pending: '#F6C947',    // amber
  Incomplete: '#E57373', // red
  Available: '#9ca3af',  // gray
};

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

export default function UserDashboard() {
  const router = useRouter();
  const screenH = Dimensions.get('window').height;

  // Map height animates between 70% (collapsed) and 30% (expanded)
  const MAP_COLLAPSED = Math.round(screenH * 0.70); // map big (default)
  const MAP_EXPANDED  = Math.round(screenH * 0.30); // sheet open

  // user data
  const [username, setUsername] = useState<string>('User');
  const [samaritanScore, setSamaritanScore] = useState<number>(1234);
  const [myTasks, setMyTasks] = useState<Task[]>([]);
  const [availableTasks, setAvailableTasks] = useState<Task[]>([]);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  // map & location
  const [coords, setCoords] = useState<Coords | null>(null);
  const [loading, setLoading] = useState(true);
  const [userLatLon, setUserLatLon] = useState<{ lat: number; lon: number } | null>(null);
  const mapRef = useRef<MapView | null>(null);
  const subRef = useRef<Location.LocationSubscription | null>(null);

  // Animated map height state
  const mapHeight = useRef(new Animated.Value(MAP_COLLAPSED)).current;
  const startHeightRef = useRef(MAP_COLLAPSED);
  const [sheetExpanded, setSheetExpanded] = useState(false);

  // rAF throttle for drag
  const dragRAF = useRef<number | null>(null);
  const dyRef = useRef(0);

  // Scroll to task
  const scrollRef = useRef<ScrollView>(null);
  const layoutYs = useRef<Record<string, number>>({}); // taskId -> y within ScrollView

  const setMapHeight = (to: number, animate = true) => {
    const clamped = clamp(to, MAP_EXPANDED, MAP_COLLAPSED);
    startHeightRef.current = clamped;
    if (animate) {
      Animated.timing(mapHeight, {
        toValue: clamped,
        duration: 280,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false, // animating height
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
              startHeightRef.current - dyRef.current, // dragging up (negative dy) reduces height
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

  // demo data with coords (UCalgary-ish positions)
  useEffect(() => {
    (async () => {
      await new Promise((r) => setTimeout(r, 200));
      setUsername('User');
      setSamaritanScore(1234);
      setMyTasks([
        {
          id: '1',
          title: 'Park Cleanup',
          organization: 'EcoVolunteers',
          location: 'Central Park',
          description: 'Clean the local park with other volunteers.',
          elo: 120,
          status: 'Done',
          coords: { latitude: 51.078365, longitude: -114.128307 },
        },
        {
          id: '2',
          title: 'Sort Donations',
          organization: 'Greenwood Shelter',
          location: 'Greenwood Community Center',
          description: 'Sort and label incoming clothing donations.',
          elo: 90,
          status: 'Pending',
          coords: { latitude: 51.0779, longitude: -114.1316 },
        },
      ]);
      setAvailableTasks([
        {
          id: '3',
          title: 'Help Seniors',
          organization: 'Lincoln Community Center',
          location: 'Lincoln Neighborhood',
          description: 'Assist seniors with errands and tech setup.',
          elo: 150,
          status: 'Available',
          coords: { latitude: 51.0759, longitude: -114.1296 },
        },
        {
          id: '4',
          title: 'Organize Event',
          organization: 'Westside Gardeners',
          location: 'Westside Community Garden',
          description: 'Plan the community planting day.',
          elo: 100,
          status: 'Available',
          coords: { latitude: 51.0801, longitude: -114.1335 },
        },
      ]);
    })();
  }, []);

  // location
  useEffect(() => {
    let mounted = true;
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Enable Location access in Settings to show your position.');
        setLoading(false);
        return;
      }
      const last = await Location.getLastKnownPositionAsync();
      if (mounted && last?.coords) {
        setCoords(last.coords);
        setUserLatLon({ lat: last.coords.latitude, lon: last.coords.longitude });
      }
      subRef.current = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Balanced, timeInterval: 3000, distanceInterval: 5 },
        (loc) => {
          if (!mounted) return;
          setCoords(loc.coords);
          setUserLatLon({ lat: loc.coords.latitude, lon: loc.coords.longitude });
        }
      );
      setLoading(false);
    })();
    return () => {
      mounted = false;
      subRef.current?.remove();
    };
  }, []);

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

  const claimTask = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setAvailableTasks((prevAvail) => {
      const task = prevAvail.find((t) => t.id === id);
      if (!task) return prevAvail;

      const remaining = prevAvail.filter((t) => t.id !== id);
      const updated: Task = { ...task, status: 'Pending' };

      // move to My Tasks
      setMyTasks((prevMy) => [updated, ...prevMy]);
      // keep the details open for the user
      setExpandedIds(new Set([id]));

      return remaining;
    });
  };

  const focusTask = (id: string) => {
    const t = allTasks.find((x) => x.id === id);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedIds(new Set([id])); // open this one

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
              <Text style={styles.taskSubtitle}>{item.location}</Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: STATUS_PIN_COLORS[item.status] },
              ]}
            >
              <Text style={[styles.statusText, item.status === 'Available' && { color: '#000' }]}>
                {item.status}
              </Text>
            </View>
          </Pressable>

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

              {/* Claim button for Available tasks */}
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
    [expandedIds]
  );

  const isLoading = loading && !coords;

  return (
    <SafeAreaView style={styles.root}>
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator />
          <Text style={{ marginTop: 8 }}>Getting your location…</Text>
        </View>
      ) : (
        <>
          {/* Animated MAP height */}
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
                  title={t.description}
                  description={`${t.organization} • ${t.location}`}
                  pinColor={STATUS_PIN_COLORS[t.status]}
                  onPress={() => focusTask(t.id)}
                />
              ))}
            </MapView>
          </Animated.View>

          {/* SHEET */}
          <View style={styles.sheet}>
            {/* Entire header is a button to open the sheet; "score" button is placeholder */}
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
                      onPress={(e) => {
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
                      onPress={(e) => {
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

            {/* Body shown when sheet expanded */}
            {sheetExpanded ? (
              <ScrollView
                ref={scrollRef}
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingBottom: 32 }}
              >
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

                {/* Removed "Your location" footer per request */}
              </ScrollView>
            ) : null}
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },

  // ===== Sheet =====
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

  // Collapsed peek bar
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

  // Expanded header
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 },
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

  // Claim button (same color/style vibe as score button)
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
  statusBadge: { borderRadius: 20, paddingVertical: 6, paddingHorizontal: 14, alignSelf: 'flex-start' },
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