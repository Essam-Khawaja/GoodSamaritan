// Map showing Task locations
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';

type LatLng = { latitude: number; longitude: number; title?: string; description?: string };

// Preset UCalgary pins for example . 
// actuall pins will be function call from backend 
const UCALGARY_POINTS: LatLng[] = [
  { latitude: 51.078365, longitude: -114.128307, title: 'Help Clean' },
  { latitude: 51.0779, longitude: -114.1316, title: 'Study with Me' },
  { latitude: 51.0759, longitude: -114.1296, title: 'Walk me to my car' },
  { latitude: 51.0801, longitude: -114.1335, title: 'ICT' },
  { latitude: 51.0817, longitude: -114.129, title: 'Schulich Eng.' },
  { latitude: 51.0752, longitude: -114.1299, title: 'Kinesiology' },
  { latitude: 51.0771, longitude: -114.1309, title: 'Science B' },
  { latitude: 51.0794, longitude: -114.136, title: 'EEEL' },
  { latitude: 51.0809, longitude: -114.1267, title: 'Residence Area' },
];

type Coords = Location.LocationObjectCoords;

export default function LiveLocationScreen() {
  const router = useRouter();

  const [coords, setCoords] = useState<Coords | null>(null);
  const [loading, setLoading] = useState(true);

  // Save user's lat/lon here for sending to backend later
  const [userLatLon, setUserLatLon] = useState<{ lat: number; lon: number } | null>(null);

  const mapRef = useRef<MapView | null>(null);
  const subRef = useRef<Location.LocationSubscription | null>(null);

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
        setUserLatLon({ lat: last.coords.latitude, lon: last.coords.longitude }); // ← saved for backend
      }

      subRef.current = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Balanced, timeInterval: 3000, distanceInterval: 5 },
        (loc) => {
          if (!mounted) return;
          setCoords(loc.coords);
          setUserLatLon({ lat: loc.coords.latitude, lon: loc.coords.longitude }); // ← keep updated
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
    latitude: coords?.latitude ?? 51.078365, // default near MacHall
    longitude: coords?.longitude ?? -114.128307,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  if (loading && !coords) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={{ marginTop: 8 }}>Getting your location…</Text>
        {Platform.OS === 'ios' && (
          <Text style={styles.hint}>Simulator tip: Features → Location to set a mock GPS.</Text>
        )}
      </View>
    );
  }

  const centerOnMe = () => {
    if (!coords) return;
    mapRef.current?.animateCamera(
      { center: { latitude: coords.latitude, longitude: coords.longitude }, zoom: 16 },
      { duration: 500 }
    );
  };

  // How to send lat and lon later 
  // const sendToBackend = async () => {
  //   if (!userLatLon) return;
  //   await fetch('https://your.api/endpoint', {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify(userLatLon),
  //   });
  // };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Back (no clipping) */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBack}
          onPress={() => router.back()}
          hitSlop={{ top: 8, left: 8, right: 8, bottom: 8 }}
        >
          <Text style={styles.headerBackText}>‹ Back</Text>
        </TouchableOpacity>
      </View>

      {/* Map */}
      <View style={styles.mapWrap}>
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFill}
          // provider={PROVIDER_GOOGLE}
          initialRegion={initialRegion}
          showsUserLocation
          showsMyLocationButton
        >
          {/* Show ALL preset pins */}
          {UCALGARY_POINTS.map((p, idx) => (
            <Marker
              key={`${p.latitude},${p.longitude}-${idx}`}
              coordinate={{ latitude: p.latitude, longitude: p.longitude }}
              title={p.title ?? `Pin ${idx + 1}`}
              description={p.description}
            />
          ))}
        </MapView>
      </View>

      {/* Actions */}
      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Actions</Text>

        <TouchableOpacity style={styles.btn} onPress={centerOnMe} disabled={!coords}>
          <Text style={styles.btnText}>Center On Me</Text>
        </TouchableOpacity>

        {/* Debug readout so you can see what will be sent */}
        {userLatLon && (
          <Text style={{ marginTop: 8, color: '#555' }}>
            Will send: lat {userLatLon.lat.toFixed(6)}, lon {userLatLon.lon.toFixed(6)}
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  header: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e8e8e8',
  },
  headerBack: {
    paddingVertical: 8,
    paddingHorizontal: 12, // extra room so text isn't clipped
  },
  headerBackText: {
    fontSize: 16,
    color: '#1bb998',
    fontWeight: '600',
  },

  mapWrap: { height: '55%', position: 'relative', backgroundColor: '#eee' },

  list: { flex: 1, backgroundColor: '#fbfaf2' },
  listContent: { padding: 16, paddingBottom: 32, gap: 12 },

  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1b1b1b', marginBottom: 4 },

  btn: {
    backgroundColor: '#1bb998',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 16 },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  hint: { marginTop: 6, color: '#667085', fontSize: 12 },
});
