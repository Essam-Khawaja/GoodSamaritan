// app/addTask.tsx
import * as Location from 'expo-location';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import MapView, { Marker, MapPressEvent, Region } from 'react-native-maps';
import { useRouter } from 'expo-router';

type LatLng = { latitude: number; longitude: number };

/**
 * Backend payload for creating a task
 * (aligns with your task schema)
 */
type BackendCreateTaskPayload = {
  title: string;
  description: string;
  samaritanScore: number;
  latitude: number;
  longitude: number;
  orgId: string;
  taskStatus: number; // e.g. 0 = Unclaimed
  userId?: string | null; // no user yet at creation
};

// TODO: replace with orgId from auth / context
const CURRENT_ORG_ID = 'TODO_CURRENT_ORG_ID';

/**
 * Placeholder API call to create a task for an org.
 * Wire this up to your Python backend.
 */
async function createOrgTask(payload: BackendCreateTaskPayload): Promise<void> {
  // Example shape:
  // await fetch('https://your-backend/api/tasks', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(payload),
  // });
  console.log('Sending task to backend:', payload);
}

export default function AddTask() {
  const router = useRouter();

  const [taskName, setTaskName] = useState('');
  const [description, setDescription] = useState('');
  const [samaritanScore, setSamaritanScore] = useState('');
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

  const [creating, setCreating] = useState(false);

  const mapRef = useRef<MapView | null>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
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
        // silently fail; map will just use default region
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
      Alert.alert('Location Error', 'Unable to get your current location.');
    }
  };

  const handleCreateTask = async () => {
    if (!taskName.trim() || !description.trim() || !samaritanScore.trim() || !locationCoords) {
      Alert.alert('Missing Information', 'Please fill in all fields and choose a location.');
      return;
    }

    const scoreNumber = Number(samaritanScore);
    if (Number.isNaN(scoreNumber) || scoreNumber <= 0) {
      Alert.alert('Invalid Samaritan Score', 'Please enter a positive number.');
      return;
    }

    const payload: BackendCreateTaskPayload = {
      title: taskName.trim(),
      description: description.trim(),
      samaritanScore: scoreNumber,
      latitude: locationCoords.latitude,
      longitude: locationCoords.longitude,
      orgId: CURRENT_ORG_ID,
      taskStatus: 0, // 0 = Unclaimed (adjust to your backend enum)
      userId: null,
    };

    try {
      setCreating(true);
      await createOrgTask(payload);

      Alert.alert('Task Created', 'Your task has been created.', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (err) {
      console.error('Failed to create task', err);
      Alert.alert('Error', 'There was a problem creating the task. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Add Task</Text>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Task Name</Text>
          <TextInput
            style={styles.input}
            value={taskName}
            onChangeText={setTaskName}
            placeholder=""
            placeholderTextColor="#9ca3af"
          />
        </View>

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

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Location</Text>

          <TouchableOpacity style={styles.locationButton} onPress={openMapPicker}>
            <Text style={styles.locationButtonText}>
              {locationCoords
                ? `Lat ${locationCoords.latitude.toFixed(4)}, Lon ${locationCoords.longitude.toFixed(
                    4
                  )}`
                : 'Pick Location'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.back()}
            disabled={creating}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.createButton, creating && { opacity: 0.7 }]}
            onPress={handleCreateTask}
            disabled={creating}
          >
            {creating ? (
              <ActivityIndicator color="#fbfaf2" />
            ) : (
              <Text style={styles.createText}>Create Task</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

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
            <TouchableOpacity style={styles.centerButton} onPress={centerOnUser}>
              <Text style={styles.centerButtonText}>Center On Me</Text>
            </TouchableOpacity>

            <Text style={styles.mapHint}>
              Tap anywhere on the map to set the task location.
            </Text>
            {locationCoords && (
              <Text style={styles.mapCoords}>
                Selected: Lat {locationCoords.latitude.toFixed(6)}, Lon{' '}
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
    backgroundColor: '#fbfaf2',
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
    color: '#1bb998',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#000',
    marginTop: 8,
    marginBottom: 24,
    textAlign: 'center',
  },
  fieldGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#edf7ff',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111827',
    borderWidth: 0,
  },
  textArea: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  locationButton: {
    backgroundColor: '#edf7ff',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  locationButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1bb998',
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 24,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fbfaf2',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  createButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1bb998',
  },
  createText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fbfaf2',
  },
  mapContainer: {
    flex: 1,
    backgroundColor: '#fbfaf2',
  },
  mapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  mapHeaderTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  mapHeaderAction: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1bb998',
  },
  mapWrapper: {
    flex: 1,
    backgroundColor: '#e5e7eb',
  },
  map: {
    flex: 1,
  },
  mapLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapFooter: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fbfaf2',
  },
  centerButton: {
    backgroundColor: '#1bb998',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  centerButtonText: {
    color: '#fbfaf2',
    fontSize: 16,
    fontWeight: '700',
  },
  mapHint: {
    fontSize: 13,
    color: '#4b5563',
  },
  mapCoords: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
});
