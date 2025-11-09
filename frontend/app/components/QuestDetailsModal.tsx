import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
} from "react-native";
import type { Task } from "../types";
import React from "react";

interface QuestDetailsModalProps {
  task: Task;
  onClose: () => void;
  onAccept?: (taskID: string) => void;
}

export default function QuestDetailsModal({
  task,
  onClose,
  onAccept,
}: QuestDetailsModalProps) {
  const distance = "1.2 km";
  const statusText = ["Incomplete", "In Progress", "Complete", "Available"][
    task.status
  ];
  const timeDisplay = new Date(task.time).toLocaleDateString();

  const handleAccept = () => {
    if (onAccept) {
      onAccept(task.taskID);
    }
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Handle bar */}
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>

          <ScrollView contentContainerStyle={styles.content}>
            {/* Icon */}
            <View style={styles.icon}>
              <Text style={styles.iconEmoji}>🎯</Text>
            </View>

            {/* Title */}
            <Text style={styles.title}>{task.title}</Text>

            {/* Status Badge */}
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{statusText}</Text>
            </View>

            {/* Description */}
            <Text style={styles.description}>{task.description}</Text>

            {/* Details */}
            <View style={styles.details}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Location</Text>
                <Text style={styles.detailValue}>
                  📍 {task.latitude.toFixed(4)}, {task.longitude.toFixed(4)}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Distance</Text>
                <Text style={styles.detailValue}>📏 {distance}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Scheduled</Text>
                <Text style={styles.detailValue}>📅 {timeDisplay}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>ELO Reward</Text>
                <Text style={styles.detailValueHighlight}>
                  🎯 +{task.elo} ELO
                </Text>
              </View>
            </View>

            {/* Impact Preview */}
            <View style={styles.impactCard}>
              <Text style={styles.impactTitle}>Make an Impact</Text>
              <Text style={styles.impactText}>
                Join others in making your community better. Every quest
                completed helps create a stronger, more connected city.
              </Text>
            </View>

            {/* Buttons */}
            <View style={styles.buttons}>
              {task.status === 3 && (
                <TouchableOpacity
                  style={styles.acceptButton}
                  activeOpacity={0.7}
                  onPress={handleAccept}
                >
                  <Text style={styles.acceptButtonText}>Accept Quest</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={onClose}
                style={styles.cancelButton}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    maxHeight: "90%",
  },
  handleContainer: {
    alignItems: "center",
    paddingVertical: 12,
  },
  handle: {
    width: 48,
    height: 4,
    backgroundColor: "#E4E4E7",
    borderRadius: 2,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  icon: {
    width: 80,
    height: 80,
    backgroundColor: "#4ADE80",
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    alignSelf: "center",
  },
  iconEmoji: {
    fontSize: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#18181B",
    marginBottom: 8,
    textAlign: "center",
  },
  categoryBadge: {
    backgroundColor: "rgba(74, 222, 128, 0.1)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(74, 222, 128, 0.2)",
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4ADE80",
  },
  description: {
    fontSize: 16,
    color: "#71717A",
    marginBottom: 24,
    lineHeight: 24,
    textAlign: "center",
  },
  details: {
    gap: 12,
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E4E4E7",
  },
  detailLabel: {
    color: "#71717A",
  },
  detailValue: {
    fontWeight: "600",
    color: "#18181B",
  },
  detailValueHighlight: {
    fontWeight: "600",
    color: "#4ADE80",
  },
  impactCard: {
    backgroundColor: "rgba(74, 222, 128, 0.05)",
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(74, 222, 128, 0.1)",
  },
  impactTitle: {
    fontWeight: "600",
    color: "#18181B",
    marginBottom: 8,
  },
  impactText: {
    fontSize: 14,
    color: "#71717A",
    lineHeight: 20,
  },
  buttons: {
    gap: 12,
  },
  acceptButton: {
    backgroundColor: "#4ADE80",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
  },
  acceptButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: "#F4F4F5",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#18181B",
    fontWeight: "600",
    fontSize: 16,
  },
});
