import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from "react-native";
import BottomNav from "../components/BottomNav";
import type { Task } from "../types";
import React, { useState, useEffect } from "react";
import * as Location from "expo-location";
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from "react-native-maps";
import { getUserId } from "../storage";

// Replace with your actual AWS API endpoint
const API_BASE_URL = process.env.EXPO_PUBLIC_AWS_BASE_URL;
const API_ENDPOINT = `${API_BASE_URL}/user-getTasks`;

interface HomeScreenProps {
  onQuestSelect: (task: Task) => void;
  onNavigate: (
    screen: "home" | "profile" | "leaderboard" | "organization"
  ) => void;
}

interface UserLocation {
  latitude: number;
  longitude: number;
}

export default function HomeScreen({
  onQuestSelect,
  onNavigate,
}: HomeScreenProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [mapExpanded, setMapExpanded] = useState(false);

  // Get user location on mount
  useEffect(() => {
    getUserLocation();
  }, []);

  // Fetch tasks when user location is available
  useEffect(() => {
    if (userLocation) {
      fetchTasks();
    }
  }, [userLocation]);

  const getUserLocation = async () => {
    try {
      // Request permission
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Location permission is required to find nearby quests"
        );
        setLoading(false);
        return;
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch (error) {
      console.error("Error getting location:", error);
      Alert.alert("Error", "Could not get your location");
      setLoading(false);
    }
  };

  const fetchTasks = async () => {
    if (!userLocation) return;

    console.log("Fetching tasks for location:", userLocation);

    try {
      setLoading(true);

      // Make API call to your AWS backend
      const response = await fetch(`${API_ENDPOINT}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userID: getUserId(),
          latitude: userLocation.latitude.toString(),
          longitude: userLocation.longitude.toString(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch tasks");
      }

      if (!response.ok) {
        throw new Error("Failed to fetch tasks");
      }

      // Parse the response body
      const responseBody = await response.json();
      const data = JSON.parse(responseBody.body); // Parse the stringified JSON

      // Filter for available tasks (status: 3)
      const availableTasks =
        data.tasks?.filter((task: Task) => task.status === 3) || [];
      setTasks(availableTasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      Alert.alert("Error", "Could not load quests. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Calculate distance using Haversine formula
  const calculateDistance = (lat: number, lng: number): string => {
    if (!userLocation) return "-- km";

    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat - userLocation.latitude);
    const dLng = toRad(lng - userLocation.longitude);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(userLocation.latitude)) *
        Math.cos(toRad(lat)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance < 1
      ? `${(distance * 1000).toFixed(0)} m`
      : `${distance.toFixed(1)} km`;
  };

  const toRad = (value: number) => (value * Math.PI) / 180;

  const getCategory = (title: string): string => {
    if (
      title.toLowerCase().includes("clean") ||
      title.toLowerCase().includes("park")
    )
      return "Environment";
    if (
      title.toLowerCase().includes("food") ||
      title.toLowerCase().includes("help")
    )
      return "Community";
    if (
      title.toLowerCase().includes("report") ||
      title.toLowerCase().includes("hazard")
    )
      return "Safety";
    return "General";
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Environment":
        return {
          backgroundColor: "rgba(74, 222, 128, 0.1)",
          borderColor: "rgba(74, 222, 128, 0.2)",
          pinColor: "#4ADE80",
        };
      case "Community":
        return {
          backgroundColor: "rgba(250, 204, 21, 0.1)",
          borderColor: "rgba(250, 204, 21, 0.2)",
          pinColor: "#FACC15",
        };
      case "Safety":
        return {
          backgroundColor: "rgba(239, 68, 68, 0.1)",
          borderColor: "rgba(239, 68, 68, 0.2)",
          pinColor: "#EF4444",
        };
      default:
        return {
          backgroundColor: "#F4F4F5",
          borderColor: "#E4E4E7",
          pinColor: "#71717A",
        };
    }
  };

  const getInitialRegion = () => {
    if (!userLocation) {
      // Default to Calgary if no location
      return {
        latitude: 51.0447,
        longitude: -114.0719,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
    }

    return {
      latitude: userLocation.latitude,
      longitude: userLocation.longitude,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    };
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.container, styles.centerContent]}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.loadingText}>Finding quests near you...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerTitle}>Explore Quests</Text>
              <Text style={styles.headerSubtitle}>
                {userLocation
                  ? `${tasks.length} quests nearby`
                  : "Enable location to find quests"}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.headerIcon}
              onPress={fetchTasks}
              activeOpacity={0.7}
            >
              <Text style={styles.headerEmoji}>🔄</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Interactive Map */}
        <TouchableOpacity
          style={[
            styles.mapContainer,
            mapExpanded && styles.mapContainerExpanded,
          ]}
          onPress={() => setMapExpanded(!mapExpanded)}
          activeOpacity={0.95}
        >
          {userLocation ? (
            <MapView
              style={styles.map}
              provider={PROVIDER_GOOGLE}
              initialRegion={getInitialRegion()}
              showsUserLocation={false}
              showsMyLocationButton={false}
            >
              {/* User location circle */}
              <Circle
                center={userLocation}
                radius={50}
                fillColor="rgba(16, 185, 129, 0.3)"
                strokeColor="rgba(16, 185, 129, 0.8)"
                strokeWidth={2}
              />
              <Marker
                coordinate={userLocation}
                title="You are here"
                anchor={{ x: 0.5, y: 0.5 }}
              >
                <View style={styles.userMarker}>
                  <View style={styles.userMarkerInner} />
                </View>
              </Marker>

              {/* Task markers */}
              {tasks.map((task) => {
                const category = getCategory(task.title);
                const { pinColor } = getCategoryColor(category);

                return (
                  <Marker
                    key={task.taskID}
                    coordinate={{
                      latitude: task.latitude,
                      longitude: task.longitude,
                    }}
                    title={task.title}
                    description={task.description}
                    onPress={() => onQuestSelect(task)}
                  >
                    <View
                      style={[styles.taskMarker, { backgroundColor: pinColor }]}
                    >
                      <Text style={styles.taskMarkerText}>📍</Text>
                    </View>
                  </Marker>
                );
              })}
            </MapView>
          ) : (
            <View style={styles.mapPlaceholder}>
              <Text style={styles.mapEmoji}>📍</Text>
              <Text style={styles.mapTitle}>Enable Location</Text>
              <Text style={styles.mapSubtitle}>
                Tap to grant location access
              </Text>
            </View>
          )}

          <View style={styles.mapOverlay}>
            <Text style={styles.mapOverlayText}>
              {mapExpanded ? "Tap to minimize" : "Tap to expand map"}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Quest Cards */}
        <ScrollView
          style={styles.questList}
          contentContainerStyle={styles.questListContent}
        >
          <Text style={styles.questListTitle}>Nearby Quests</Text>

          {tasks.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🔍</Text>
              <Text style={styles.emptyTitle}>No quests found</Text>
              <Text style={styles.emptySubtitle}>
                Try refreshing or check back later
              </Text>
            </View>
          ) : (
            tasks.map((task) => {
              const category = getCategory(task.title);
              const categoryColors = getCategoryColor(category);
              const distance = calculateDistance(task.latitude, task.longitude);
              const icon =
                category === "Environment"
                  ? "🗑️"
                  : category === "Community"
                  ? "❤️"
                  : category === "Safety"
                  ? "⚠️"
                  : "📋";

              return (
                <TouchableOpacity
                  key={task.taskID}
                  onPress={() => onQuestSelect(task)}
                  style={styles.questCard}
                  activeOpacity={0.7}
                >
                  <View style={styles.questCardContent}>
                    {/* Icon */}
                    <View
                      style={[
                        styles.questIcon,
                        { backgroundColor: categoryColors.pinColor },
                      ]}
                    >
                      <Text style={styles.questEmoji}>{icon}</Text>
                    </View>

                    {/* Content */}
                    <View style={styles.questDetails}>
                      <View style={styles.questHeader}>
                        <Text style={styles.questTitle}>{task.title}</Text>
                        <View style={[styles.categoryBadge, categoryColors]}>
                          <Text style={styles.categoryText}>{category}</Text>
                        </View>
                      </View>
                      <Text style={styles.questDescription}>
                        {task.description}
                      </Text>

                      {/* Meta info */}
                      <View style={styles.questMeta}>
                        <Text style={styles.metaText}>📍 {distance}</Text>
                        <Text style={styles.metaPoints}>
                          🎯 +{task.elo} ELO
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>

        <BottomNav currentScreen="home" onNavigate={onNavigate} />
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
    backgroundColor: "#F9FAFB",
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#71717A",
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E4E4E7",
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#18181B",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#71717A",
    marginTop: 2,
  },
  headerIcon: {
    width: 40,
    height: 40,
    backgroundColor: "#4ADE80",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  headerEmoji: {
    fontSize: 24,
  },
  mapContainer: {
    height: 200,
    backgroundColor: "#F4F4F5",
    position: "relative",
  },
  mapContainerExpanded: {
    height: 400,
  },
  map: {
    flex: 1,
  },
  mapPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  mapEmoji: {
    fontSize: 48,
  },
  mapTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#18181B",
  },
  mapSubtitle: {
    fontSize: 12,
    color: "#71717A",
  },
  mapOverlay: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  mapOverlayText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "500",
  },
  userMarker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#10B981",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  userMarkerInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FFFFFF",
  },
  taskMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  taskMarkerText: {
    fontSize: 16,
  },
  questList: {
    flex: 1,
  },
  questListContent: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  questListTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#18181B",
    marginBottom: 16,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 48,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#18181B",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#71717A",
  },
  questCard: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#E4E4E7",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  questCardContent: {
    flexDirection: "row",
    gap: 16,
  },
  questIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  questEmoji: {
    fontSize: 24,
  },
  questDetails: {
    flex: 1,
  },
  questHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 4,
  },
  questTitle: {
    fontWeight: "600",
    color: "#18181B",
    flex: 1,
    fontSize: 16,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "500",
  },
  questDescription: {
    fontSize: 14,
    color: "#71717A",
    marginBottom: 12,
    lineHeight: 20,
  },
  questMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  metaText: {
    fontSize: 12,
    color: "#71717A",
  },
  metaPoints: {
    fontSize: 12,
    fontWeight: "600",
    color: "#18181B",
  },
});
