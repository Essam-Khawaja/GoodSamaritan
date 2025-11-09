// app/addOrgTask.tsx
import * as Location from "expo-location";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker, MapPressEvent, Region } from "react-native-maps";
import { useRouter } from "expo-router";

type LatLng = { latitude: number; longitude: number };

export default function AddOrgTask() {
  const router = useRouter();

  // TODO: replace this with orgId from auth context / route params
  const orgId = "ORG_ID_FROM_BACKEND";

  const [taskTitle, setTaskTitle] = useState("");
  const [description, setDescription] = useState("");
  const [samaritanScore, setSamaritanScore] = useState("");
  const [locationCoords, setLocationCoords] = useState<LatLng | null>(null);

  const [mapVisible, setMapVisible] = useState(false);
  const [mapLoading, setMapLoading] = useState(true);
  const [mapRegion, setMapRegion] = useState<Region>({
    latitude: 51.078365,
    longitude: -114.128307,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  });
  const [userLocation, setUserLocation] = useState<LatLng | null>(null);

  const mapRef = useRef<MapView | null>(null);

  // Get user location for centering the map
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setMapLoading(false);
          return;
        }

        const current = await Location.getCurrentPositionAsync({});
        if (!mounted) return;

        const coords = {
          latitude: current.coords.latitude,
          longitude: current.coords.longitude,
        };

        setUserLocation(coords);
        setMapRegion((prev) => ({
          ...prev,
          latitude: coords.latitude,
          longitude: coords.longitude,
        }));
      } catch {
        // silently fail, map will still load
      } finally {
        if (mounted) setMapLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const handleMapPress = (e: MapPressEvent) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setLocationCoords({ latitude, longitude });
  };

  const openMapPicker = () => {
    setMapVisible(true);
  };

  const closeMapPicker = () => {
    setMapVisible(false);
  };

  const centerOnUser = async () => {
    try {
      let coords = userLocation;

      if (!coords) {
        const current = await Location.getCurrentPositionAsync({});
        coords = {
          latitude: current.coords.latitude,
          longitude: current.coords.longitude,
        };
        setUserLocation(coords);
      }

      if (coords && mapRef.current) {
        const region: Region = {
          latitude: coords.latitude,
          longitude: coords.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        };
        mapRef.current.animateToRegion(region, 400);
      }
    } catch {
      Alert.alert("Location Error", "Unable to get your current location.");
    }
  };

  const handleCreateTask = () => {
    if (
      !taskTitle.trim() ||
      !description.trim() ||
      !samaritanScore.trim() ||
      !locationCoords
    ) {
      Alert.alert(
        "Missing Information",
        "Please fill in all fields and choose a location."
      );
      return;
    }

    const scoreNumber = Number(samaritanScore);
    if (Number.isNaN(scoreNumber) || scoreNumber <= 0) {
      Alert.alert("Invalid Samaritan Score", "Please enter a positive number.");
      return;
    }

    // Backend-friendly payload (matches your data model)
    const newTaskPayload = {
      taskTitle: taskTitle.trim(), // string
      taskDescription: description.trim(), // string
      latitude: locationCoords.latitude, // number
      longitude: locationCoords.longitude, // number
      samaritanScore: scoreNumber, // number
      orgId, // string (org the task is associated with)
      userId: null, // no user yet
      taskStatus: 0, // e.g. 0 = Unclaimed (you define mapping)
    };

    console.log("Org task payload to send to backend:", newTaskPayload);

    // TODO: replace with actual POST to backend
    // await api.createOrgTask(newTaskPayload);

    Alert.alert("Task Created", "Your task has been created.", [
      {
        text: "OK",
        onPress: () => router.back(),
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Add Task</Text>

        {/* Task Title */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Task Name</Text>
          <TextInput
            style={styles.input}
            value={taskTitle}
            onChangeText={setTaskTitle}
            placeholder=""
            placeholderTextColor="#9ca3af"
          />
        </View>

        {/* Description */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder=""
            placeholderTextColor="#9ca3af"
            multiline
          />
        </View>

        {/* Samaritan Score */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Samaritan Score</Text>
          <TextInput
            style={styles.input}
            value={samaritanScore}
            onChangeText={setSamaritanScore}
            keyboardType="numeric"
            placeholder=""
            placeholderTextColor="#9ca3af"
          />
        </View>

        {/* Location Picker */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Location</Text>

          <TouchableOpacity
            style={styles.locationButton}
            onPress={openMapPicker}
          >
            <Text style={styles.locationButtonText}>
              {locationCoords ? "Location Selected" : "Pick Location"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Actions */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.back()}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.createButton}
            onPress={handleCreateTask}
          >
            <Text style={styles.createText}>Create Task</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Map Picker Modal */}
      <Modal visible={mapVisible} animationType="slide">
        <SafeAreaView style={styles.mapContainer}>
          <View style={styles.mapHeader}>
            <TouchableOpacity onPress={closeMapPicker}>
              <Text style={styles.mapHeaderAction}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.mapHeaderTitle}>Pick Location</Text>
            <TouchableOpacity onPress={closeMapPicker}>
              <Text style={styles.mapHeaderAction}>Done</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.mapWrapper}>
            {mapLoading ? (
              <View style={styles.mapLoading}>
                <ActivityIndicator />
                <Text style={{ marginTop: 8 }}>Loading map…</Text>
              </View>
            ) : (
              <MapView
                ref={mapRef}
                style={styles.map}
                initialRegion={mapRegion}
                onPress={handleMapPress}
                showsUserLocation
                showsMyLocationButton
              >
                {locationCoords && (
                  <Marker
                    coordinate={locationCoords}
                    title="Task Location"
                    description="Selected position for this task"
                  />
                )}
              </MapView>
            )}
          </View>

          <View style={styles.mapFooter}>
            <TouchableOpacity
              style={styles.centerButton}
              onPress={centerOnUser}
            >
              <Text style={styles.centerButtonText}>Center On Me</Text>
            </TouchableOpacity>

            <Text style={styles.mapHint}>
              Tap anywhere on the map to set the task location.
            </Text>
            {locationCoords && (
              <Text style={styles.mapCoords}>
                Selected: Lat {locationCoords.latitude.toFixed(6)}, Lon{" "}
                {locationCoords.longitude.toFixed(6)}
              </Text>
            )}
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fbfaf2",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  backButton: {
    marginBottom: 8,
  },
  backText: {
    color: "#1bb998",
    fontSize: 16,
    fontWeight: "600",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#000",
    marginTop: 8,
    marginBottom: 24,
    textAlign: "center",
  },
  fieldGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#edf7ff",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#111827",
    borderWidth: 0,
  },
  textArea: {
    minHeight: 90,
    textAlignVertical: "top",
  },
  locationButton: {
    backgroundColor: "#edf7ff",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    justifyContent: "center",
  },
  locationButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1bb998",
  },
  buttonRow: {
    flexDirection: "row",
    marginTop: 24,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#d1d5db",
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fbfaf2",
  },
  cancelText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  createButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1bb998",
  },
  createText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fbfaf2",
  },
  mapContainer: {
    flex: 1,
    backgroundColor: "#fbfaf2",
  },
  mapHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  mapHeaderTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  mapHeaderAction: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1bb998",
  },
  mapWrapper: {
    flex: 1,
    backgroundColor: "#e5e7eb",
  },
  map: {
    flex: 1,
  },
  mapLoading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  mapFooter: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fbfaf2",
  },
  centerButton: {
    backgroundColor: "#1bb998",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 10,
  },
  centerButtonText: {
    color: "#fbfaf2",
    fontSize: 16,
    fontWeight: "700",
  },
  mapHint: {
    fontSize: 13,
    color: "#4b5563",
  },
  mapCoords: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: "600",
    color: "#111827",
  },
});
