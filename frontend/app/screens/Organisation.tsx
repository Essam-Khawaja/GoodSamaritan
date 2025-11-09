"use client";

import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useState, useEffect } from "react";
import BottomNav from "../components/BottomNav";
import type { Task } from "../types";
import React from "react";
import * as Location from "expo-location";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { getUserId, getUserData } from "../storage";

const API_BASE_URL = process.env.EXPO_PUBLIC_AWS_BASE_URL;

interface OrganizationScreenProps {
  onNavigate: (
    screen: "home" | "profile" | "leaderboard" | "organization"
  ) => void;
  userType?: "user" | "org" | null;
}

interface MapLocation {
  latitude: number;
  longitude: number;
}

export default function OrganizationScreen({
  onNavigate,
  userType,
}: OrganizationScreenProps) {
  const [questTitle, setQuestTitle] = useState("");
  const [questDescription, setQuestDescription] = useState("");
  const [questElo, setQuestElo] = useState("");
  const [selectedType, setSelectedType] = useState<string>("Cleanup");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Location states
  const [userLocation, setUserLocation] = useState<MapLocation | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(
    null
  );
  const [showMap, setShowMap] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(true);

  // Get user location on mount
  useEffect(() => {
    getUserLocation();
  }, []);

  const getUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Location permission is required to set quest location"
        );
        setLoadingLocation(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const coords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      setUserLocation(coords);
      setSelectedLocation(coords); // Set initial selected location to user location
    } catch (error) {
      console.error("Error getting location:", error);
      Alert.alert("Error", "Could not get your location");
    } finally {
      setLoadingLocation(false);
    }
  };

  const handleMapPress = (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setSelectedLocation({ latitude, longitude });
  };

  const handleCreateQuest = async () => {
    if (!questTitle || !questDescription || !questElo) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (!selectedLocation) {
      Alert.alert("Error", "Please set a location for the quest");
      return;
    }

    setIsSubmitting(true);

    try {
      // Verify user is an organization
      const userData = await getUserData();
      if (userData?.type !== "org") {
        Alert.alert("Error", "Only organizations can create tasks");
        setIsSubmitting(false);
        return;
      }

      const orgId = await getUserId();
      console.log(userData);

      if (!orgId) {
        Alert.alert("Error", "Organization not logged in");
        setIsSubmitting(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/createTask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: questTitle,
          description: questDescription,
          latitude: selectedLocation.latitude,
          longitude: selectedLocation.longitude,
          elo: Number.parseInt(questElo),
          orgID: orgId,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success !== false) {
        Alert.alert("Success", "Quest created successfully!");

        // Reset form
        setQuestTitle("");
        setQuestDescription("");
        setQuestElo("");
        setSelectedType("Cleanup");
        setSelectedLocation(userLocation);
        setShowMap(false);
      } else {
        Alert.alert("Error", data.message || "Failed to create quest");
      }
    } catch (error) {
      console.error("Error creating quest:", error);
      Alert.alert("Error", "Failed to create quest. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingLocation) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.container, styles.centerContent]}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.loadingText}>Getting your location...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Create a Quest</Text>
          <Text style={styles.headerSubtitle}>
            Help organize your community
          </Text>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
        >
          {/* Info Card */}
          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Text style={styles.infoEmoji}>🏢</Text>
              <Text style={styles.infoTitle}>Organization Panel</Text>
            </View>
            <Text style={styles.infoText}>
              Create quests for your community! As a verified organizer, you can
              create challenges that help improve your neighborhood.
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Quest Title */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Quest Title</Text>
              <TextInput
                value={questTitle}
                onChangeText={setQuestTitle}
                placeholder="e.g., Park Clean-Up Drive"
                placeholderTextColor="#A1A1AA"
                style={styles.input}
              />
            </View>

            {/* Quest Description */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                value={questDescription}
                onChangeText={setQuestDescription}
                placeholder="Describe what participants will do..."
                placeholderTextColor="#A1A1AA"
                multiline
                numberOfLines={4}
                style={[styles.input, styles.textArea]}
                textAlignVertical="top"
              />
            </View>

            {/* Quest Type */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Quest Type</Text>
              <View style={styles.typeButtons}>
                {["Cleanup", "Donation", "Report", "Help"].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeButton,
                      selectedType === type && styles.typeButtonActive,
                    ]}
                    activeOpacity={0.7}
                    onPress={() => setSelectedType(type)}
                  >
                    <Text
                      style={[
                        styles.typeButtonText,
                        selectedType === type && styles.typeButtonTextActive,
                      ]}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Points */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>ELO Reward</Text>
              <TextInput
                value={questElo}
                onChangeText={setQuestElo}
                placeholder="100"
                placeholderTextColor="#A1A1AA"
                keyboardType="numeric"
                style={styles.input}
              />
            </View>

            {/* Location */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Location</Text>
              <TouchableOpacity
                style={styles.locationButton}
                activeOpacity={0.7}
                onPress={() => setShowMap(!showMap)}
              >
                <Text style={styles.locationEmoji}>📍</Text>
                <Text style={styles.locationText}>
                  {selectedLocation
                    ? `${selectedLocation.latitude.toFixed(
                        4
                      )}, ${selectedLocation.longitude.toFixed(4)}`
                    : "Set location on map"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Map */}
            {showMap && userLocation && (
              <View style={styles.mapContainer}>
                <Text style={styles.mapInstructions}>
                  Tap anywhere on the map to set quest location
                </Text>
                <MapView
                  style={styles.map}
                  provider={PROVIDER_GOOGLE}
                  initialRegion={{
                    latitude: userLocation.latitude,
                    longitude: userLocation.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }}
                  onPress={handleMapPress}
                >
                  {/* Selected location marker */}
                  {selectedLocation && (
                    <Marker
                      coordinate={selectedLocation}
                      title="Quest Location"
                      pinColor="#4ADE80"
                    />
                  )}

                  {/* User location marker */}
                  {userLocation && (
                    <Marker
                      coordinate={userLocation}
                      title="Your Location"
                      pinColor="#10B981"
                    />
                  )}
                </MapView>
                <TouchableOpacity
                  style={styles.mapCloseButton}
                  onPress={() => setShowMap(false)}
                >
                  <Text style={styles.mapCloseText}>Done</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                isSubmitting && styles.submitButtonDisabled,
              ]}
              activeOpacity={0.7}
              onPress={handleCreateQuest}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>Create Quest</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
        {/* 
        <BottomNav
          currentScreen="organization"
          onNavigate={onNavigate}
          userType={userType}
        /> */}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingBottom: 80,
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
    paddingVertical: 24,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E4E4E7",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#18181B",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#71717A",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    backgroundColor: "#FFFFFF",
  },
  infoCard: {
    backgroundColor: "rgba(74, 222, 128, 0.1)",
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(74, 222, 128, 0.2)",
    marginBottom: 24,
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  infoEmoji: {
    fontSize: 24,
  },
  infoTitle: {
    fontWeight: "600",
    color: "#18181B",
  },
  infoText: {
    fontSize: 14,
    color: "#71717A",
    lineHeight: 20,
  },
  form: {
    gap: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#18181B",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E4E4E7",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: "#18181B",
    fontSize: 16,
  },
  textArea: {
    minHeight: 96,
    paddingTop: 12,
  },
  typeButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  typeButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#E4E4E7",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  typeButtonActive: {
    borderColor: "#4ADE80",
    backgroundColor: "rgba(74, 222, 128, 0.1)",
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#71717A",
  },
  typeButtonTextActive: {
    color: "#4ADE80",
  },
  locationButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E4E4E7",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  locationEmoji: {
    fontSize: 20,
  },
  locationText: {
    color: "#71717A",
    fontSize: 14,
    flex: 1,
  },
  mapContainer: {
    marginTop: 8,
    marginBottom: 16,
  },
  mapInstructions: {
    fontSize: 12,
    color: "#71717A",
    marginBottom: 8,
    textAlign: "center",
  },
  map: {
    height: 300,
    borderRadius: 16,
    overflow: "hidden",
  },
  mapCloseButton: {
    backgroundColor: "#4ADE80",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  mapCloseText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
  submitButton: {
    backgroundColor: "#4ADE80",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 16,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
});
