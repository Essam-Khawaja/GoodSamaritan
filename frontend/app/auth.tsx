"use client";

import React from "react";
import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { User, Org } from "./types";

interface AuthScreenProps {
  userType: "civilian" | "organization";
  onAuthSuccess: (user: any) => void;
  onBack: () => void;
}

const API_BASE_URL = process.env.EXPO_PUBLIC_AWS_BASE_URL;

export default function AuthScreen({
  userType,
  onAuthSuccess,
  onBack,
}: AuthScreenProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    confirmPassword: "",
  });

  // NEW: Store complete user data
  const storeUserData = async (userData: User | Org, type: "user" | "org") => {
    try {
      const userDataWithType = {
        ...userData,
        type: type,
      };

      await AsyncStorage.setItem("user_data", JSON.stringify(userDataWithType));
      console.log("[v0] User data stored successfully");
    } catch (error) {
      console.error("[v0] Error storing user data:", error);
    }
  };

  // NEW: Fetch complete user data after successful login
  const fetchAndStoreUserData = async (email: string, type: "user" | "org") => {
    try {
      const endpoint =
        type === "user"
          ? `${API_BASE_URL}/user-get`
          : `${API_BASE_URL}/org-get`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email }),
      });

      const data = await response.json(); // Parse the main response
      console.log("[v0] Fetched user data:", data);

      if (response.ok && data.statusCode === 200) {
        // Parse the body string to get the actual user/org data
        const bodyData = JSON.parse(data.body);
        const userData = bodyData.user || bodyData.org; // Access user or org data based on type

        // Store the complete user data
        await storeUserData(userData, type);

        console.log("[v0] User data fetched and stored");
      } else {
        console.error("[v0] Failed to fetch user data:", data.body);
      }
    } catch (error) {
      console.error("[v0] Error fetching user data:", error);
    }
  };

  const handleAuth = async () => {
    if (!formData.email || !formData.password) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    if (!isLogin) {
      if (!formData.name) {
        Alert.alert("Error", "Please enter your name");
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        Alert.alert("Error", "Passwords do not match");
        return;
      }
    }

    setLoading(true);

    try {
      let endpoint = "";
      let reqType = "";

      if (isLogin) {
        endpoint =
          userType === "civilian"
            ? `${API_BASE_URL}/user-login`
            : `${API_BASE_URL}/org-login`;
        reqType = userType === "civilian" ? "user-login" : "org-login";
      } else {
        endpoint =
          userType === "civilian"
            ? `${API_BASE_URL}/user-signup`
            : `${API_BASE_URL}/org-signup`;
        reqType = userType === "civilian" ? "user-signup" : "org-signup";
      }

      let body = JSON.stringify({});
      switch (reqType) {
        case "user-login":
          body = JSON.stringify({
            email: formData.email,
            password: formData.password,
          });
          break;
        case "org-login":
          body = JSON.stringify({
            email: formData.email,
            password: formData.password,
          });
          break;
        case "user-signup":
          body = JSON.stringify({
            email: formData.email,
            password: formData.password,
            name: formData.name,
          });
          break;
        case "org-signup":
          body = JSON.stringify({
            email: formData.email,
            password: formData.password,
            name: formData.name,
          });
          break;
        default:
          throw new Error("Invalid request type");
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: body,
      });

      const data = await response.json();

      // Check for 401 in the response body (Lambda returns statusCode in body)
      if (data.statusCode === 401 || data.body?.success === false) {
        Alert.alert(
          "Access Denied",
          data.message || "Invalid email or password. Please try again."
        );
        setLoading(false);
        return;
      }

      if (response.ok && data.success !== false) {
        // Success - store user data and navigate to main app
        console.log("[v0] Auth successful:", data);

        // NEW: Fetch and store complete user data
        const type = userType === "civilian" ? "user" : "org";
        await fetchAndStoreUserData(formData.email, type);

        onAuthSuccess(data.user);
      } else {
        Alert.alert("Error", data.message || "Authentication failed");
      }

      if (response.ok) {
        // Success - store user data and navigate to main app
        console.log("[v0] Auth successful:", data);
        onAuthSuccess(data.user);
      } else {
        Alert.alert("Error", data.message || "Authentication failed");
      }
    } catch (error) {
      console.error("[v0] Auth error:", error);
      Alert.alert("Error", "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.userTypeIcon}>
              {userType === "civilian" ? "👤" : "🏢"}
            </Text>
            <Text style={styles.title}>
              {isLogin ? "Welcome Back" : "Get Started"}
            </Text>
            <Text style={styles.subtitle}>
              {isLogin
                ? "Sign in to continue"
                : `Create your ${userType} account`}
            </Text>
          </View>

          <View style={styles.form}>
            {!isLogin && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  {userType === "organization"
                    ? "Organization Name"
                    : "Full Name"}
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your name"
                  value={formData.name}
                  onChangeText={(text) =>
                    setFormData({ ...formData, name: text })
                  }
                  autoCapitalize="words"
                />
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="your@email.com"
                value={formData.email}
                onChangeText={(text) =>
                  setFormData({ ...formData, email: text })
                }
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                value={formData.password}
                onChangeText={(text) =>
                  setFormData({ ...formData, password: text })
                }
                secureTextEntry
              />
            </View>

            {!isLogin && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirm Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChangeText={(text) =>
                    setFormData({ ...formData, confirmPassword: text })
                  }
                  secureTextEntry
                />
              </View>
            )}

            <TouchableOpacity
              style={[
                styles.submitButton,
                loading && styles.submitButtonDisabled,
              ]}
              onPress={handleAuth}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {isLogin ? "Sign In" : "Create Account"}
                </Text>
              )}
            </TouchableOpacity>

            <View style={styles.toggleContainer}>
              <Text style={styles.toggleText}>
                {isLogin
                  ? "Don't have an account?"
                  : "Already have an account?"}
              </Text>
              <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
                <Text style={styles.toggleLink}>
                  {isLogin ? "Sign Up" : "Sign In"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  backButton: {
    marginBottom: 24,
  },
  backText: {
    fontSize: 16,
    color: "#10B981", // green highlight
    fontWeight: "600",
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  userTypeIcon: {
    fontSize: 60,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#10B981", // green highlight
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#065F46", // darker green tone
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A", // dark text for readability
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 2,
    borderColor: "#10B981", // green outline
  },
  submitButton: {
    backgroundColor: "#10B981", // green accent
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 12,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
    marginTop: 8,
  },
  toggleText: {
    fontSize: 14,
    color: "#475569",
  },
  toggleLink: {
    fontSize: 14,
    color: "#10B981",
    fontWeight: "700",
  },
});
