"use client";

import { View, Text, Animated, StyleSheet } from "react-native";
import { useEffect, useRef } from "react";
import React from "react";

export default function SplashScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      {/* Logo */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.logoWrapper}>
          <View style={styles.logoBox}>
            <Text style={styles.logoEmoji}>✨</Text>
          </View>
          <View style={styles.logoBadge} />
        </View>
      </Animated.View>

      {/* App name */}
      <Animated.View style={{ opacity: fadeAnim }}>
        <Text style={styles.appName}>CityQuest</Text>
      </Animated.View>

      {/* Tagline */}
      <Animated.View style={{ opacity: fadeAnim }}>
        <Text style={styles.tagline}>
          Make Your City Stronger — One Quest at a Time
        </Text>
      </Animated.View>

      {/* Loading indicator */}
      <Animated.View style={[styles.loadingContainer, { opacity: fadeAnim }]}>
        <View style={styles.loadingDots}>
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#4ADE80",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  logoContainer: {
    marginBottom: 32,
  },
  logoWrapper: {
    position: "relative",
  },
  logoBox: {
    width: 128,
    height: 128,
    backgroundColor: "#FFFFFF",
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  logoEmoji: {
    fontSize: 60,
  },
  logoBadge: {
    position: "absolute",
    top: -8,
    right: -8,
    width: 32,
    height: 32,
    backgroundColor: "#FACC15",
    borderRadius: 16,
  },
  appName: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 16,
    textAlign: "center",
  },
  tagline: {
    fontSize: 20,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    maxWidth: 384,
    lineHeight: 28,
  },
  loadingContainer: {
    marginTop: 48,
  },
  loadingDots: {
    flexDirection: "row",
    gap: 8,
  },
  dot: {
    width: 12,
    height: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 6,
  },
});
