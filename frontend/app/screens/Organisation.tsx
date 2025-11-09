"use client";

import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { useState } from "react";
import BottomNav from "../components/BottomNav";
import type { Task } from "../types";
import React from "react";

interface OrganizationScreenProps {
  onNavigate: (
    screen: "home" | "profile" | "leaderboard" | "organization"
  ) => void;
  onCreateTask?: (task: Partial<Task>) => Promise<void>;
}

export default function OrganizationScreen({
  onNavigate,
  onCreateTask,
}: OrganizationScreenProps) {
  const [questTitle, setQuestTitle] = useState("");
  const [questDescription, setQuestDescription] = useState("");
  const [questElo, setQuestElo] = useState("");
  const [selectedType, setSelectedType] = useState<string>("Cleanup");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateQuest = async () => {
    if (!questTitle || !questDescription || !questElo) {
      alert("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const newTask: Partial<Task> = {
        title: questTitle,
        description: questDescription,
        elo: Number.parseInt(questElo),
        latitude: 51.0447, // Default location - should be set by map picker
        longitude: -114.0719,
        time: new Date().toISOString(),
        status: 3, // Available
      };

      if (onCreateTask) {
        await onCreateTask(newTask);
        setQuestTitle("");
        setQuestDescription("");
        setQuestElo("");
        setSelectedType("Cleanup");
        alert("Quest created successfully!");
      }
    } catch (error) {
      alert("Failed to create quest. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
              >
                <Text style={styles.locationEmoji}>📍</Text>
                <Text style={styles.locationText}>Set location on map</Text>
              </TouchableOpacity>
            </View>

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
              <Text style={styles.submitButtonText}>
                {isSubmitting ? "Creating..." : "Create Quest"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Your Created Quests */}
          <View style={styles.createdSection}>
            <Text style={styles.createdTitle}>Your Created Quests</Text>
            <View style={styles.createdCard}>
              <View style={styles.createdContent}>
                <View style={styles.createdIcon}>
                  <Text style={styles.createdEmoji}>🗑️</Text>
                </View>
                <View style={styles.createdDetails}>
                  <Text style={styles.createdName}>Community Garden Setup</Text>
                  <Text style={styles.createdStatus}>
                    Active • 8 participants
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>

        <BottomNav currentScreen="organization" onNavigate={onNavigate} />
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
    fontSize: 16,
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
  createdSection: {
    marginTop: 32,
  },
  createdTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#18181B",
    marginBottom: 12,
  },
  createdCard: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E4E4E7",
  },
  createdContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  createdIcon: {
    width: 40,
    height: 40,
    backgroundColor: "rgba(74, 222, 128, 0.1)",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  createdEmoji: {
    fontSize: 20,
  },
  createdDetails: {
    flex: 1,
  },
  createdName: {
    fontWeight: "500",
    color: "#18181B",
  },
  createdStatus: {
    fontSize: 12,
    color: "#71717A",
  },
});
