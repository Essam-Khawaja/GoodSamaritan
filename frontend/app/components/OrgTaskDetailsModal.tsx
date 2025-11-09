import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import type { Task } from "../types";
import React from "react";

interface OrgTaskDetailsModalProps {
  task: Task;
  onClose: () => void;
  onComplete?: (taskID: string) => void;
}

export default function OrgTaskDetailsModal({
  task,
  onClose,
  onComplete,
}: OrgTaskDetailsModalProps) {
  const getStatusInfo = (status: number) => {
    switch (status) {
      case 0:
        return { text: "Incomplete", color: "#EF4444", icon: "❌" };
      case 1:
        return { text: "In Progress", color: "#FACC15", icon: "🔄" };
      case 2:
        return { text: "Complete", color: "#4ADE80", icon: "✅" };
      case 3:
        return { text: "Available", color: "#3B82F6", icon: "📋" };
      default:
        return { text: "Unknown", color: "#71717A", icon: "❓" };
    }
  };

  const statusInfo = getStatusInfo(task.status);
  const timeDisplay = new Date(task.time).toLocaleDateString();
  const canComplete = task.status === 1; // Only allow completing in-progress tasks

  const handleComplete = () => {
    Alert.alert(
      "Complete Quest",
      "Are you sure you want to mark this quest as complete? This will award ELO points to the user.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Complete",
          style: "default",
          onPress: () => {
            if (onComplete) {
              onComplete(task.taskID);
            }
            onClose();
          },
        },
      ]
    );
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
            <View style={[styles.icon, { backgroundColor: statusInfo.color }]}>
              <Text style={styles.iconEmoji}>{statusInfo.icon}</Text>
            </View>

            {/* Title */}
            <Text style={styles.title}>{task.title}</Text>

            {/* Status Badge */}
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: `${statusInfo.color}20` },
              ]}
            >
              <Text style={[styles.statusText, { color: statusInfo.color }]}>
                {statusInfo.text}
              </Text>
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
                <Text style={styles.detailLabel}>Created</Text>
                <Text style={styles.detailValue}>📅 {timeDisplay}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>ELO Reward</Text>
                <Text style={styles.detailValueHighlight}>
                  🎯 +{task.elo} ELO
                </Text>
              </View>
              {task.status === 1 && task.userID && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Assigned To</Text>
                  <Text style={styles.detailValue}>
                    👤 {task.userID.substring(0, 12)}...
                  </Text>
                </View>
              )}
            </View>

            {/* Info Card */}
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>Quest Management</Text>
              <Text style={styles.infoText}>
                {task.status === 3 &&
                  "This quest is available for users to accept."}
                {task.status === 1 &&
                  "A user is currently working on this quest. Mark it as complete once they've finished."}
                {task.status === 2 &&
                  "This quest has been completed and ELO points have been awarded."}
                {task.status === 0 &&
                  "This quest was not completed successfully."}
              </Text>
            </View>

            {/* Buttons */}
            <View style={styles.buttons}>
              {canComplete && (
                <TouchableOpacity
                  style={styles.completeButton}
                  activeOpacity={0.7}
                  onPress={handleComplete}
                >
                  <Text style={styles.completeButtonText}>
                    ✓ Mark as Complete
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={onClose}
                style={styles.closeButton}
                activeOpacity={0.7}
              >
                <Text style={styles.closeButtonText}>Close</Text>
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
    borderRadius: 40,
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
    marginBottom: 12,
    textAlign: "center",
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: "center",
    marginBottom: 16,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
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
    fontSize: 15,
    color: "#71717A",
  },
  detailValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#18181B",
  },
  detailValueHighlight: {
    fontSize: 15,
    fontWeight: "600",
    color: "#4ADE80",
  },
  infoCard: {
    backgroundColor: "rgba(59, 130, 246, 0.05)",
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.1)",
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#18181B",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#71717A",
    lineHeight: 20,
  },
  buttons: {
    gap: 12,
  },
  completeButton: {
    backgroundColor: "#4ADE80",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
  },
  completeButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  closeButton: {
    backgroundColor: "#F4F4F5",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#18181B",
    fontWeight: "600",
    fontSize: 16,
  },
});
