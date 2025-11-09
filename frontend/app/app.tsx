"use client";

import { useState, useEffect } from "react";
import { StyleSheet, SafeAreaView } from "react-native";
import { StatusBar } from "expo-status-bar";
import OnboardingScreen from "./onboarding";
import AuthScreen from "./auth";
import SplashScreen from "./splashScreen";
import React from "react";
import HomeScreen from "./screens/HomeScreen";
import type { Task } from "./types";
import LandingPage from "./LandingPage";
import UserMainDashboard from "./userMainDashboard"; // 

type Screen =
  | "splash"
  | "onboarding"
  | "auth"
  | "home"
  | "profile"
  | "leaderboard"
  | "organization"
  | "userMainDashboard"; // 

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("splash");
  const [userType, setUserType] = useState<"civilian" | "organization" | null>(
    null
  );
  const [user, setUser] = useState<any>(null);
  const [selectedQuest, setSelectedQuest] = useState<Task | null>(null);

  useEffect(() => {
    if (currentScreen === "splash") {
      const timer = setTimeout(() => setCurrentScreen("onboarding"), 2500);
      return () => clearTimeout(timer);
    }
  }, [currentScreen]);

  const handleSelectUserType = (type: "civilian" | "organization") => {
    setUserType(type);
    setCurrentScreen("auth");
  };

  const handleAuthSuccess = (userData: any) => {
    setUser(userData);
    setCurrentScreen("userMainDashboard");
  };

  const handleBackToOnboarding = () => {
    setUserType(null);
    setCurrentScreen("onboarding");
  };

  const handleQuestSelect = (quest: Task) => {
    setSelectedQuest(quest);
  };

  const handleNavigate = (
    screen: "home" | "profile" | "leaderboard" | "organization"
  ) => {
    setCurrentScreen(screen);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {currentScreen === "splash" && <SplashScreen />}

      {currentScreen === "onboarding" && (
        <OnboardingScreen onSelectUserType={handleSelectUserType} />
      )}

      {currentScreen === "auth" && userType && (
        <AuthScreen
          userType={userType}
          onAuthSuccess={handleAuthSuccess}
          onBack={handleBackToOnboarding}
        />
      )}

      {currentScreen === "home" && <LandingPage />}

      {currentScreen === "userMainDashboard" && (
        <UserMainDashboard />
      )}

      {/* other screens still commented out */}
      {/* {currentScreen === "profile" && <ProfileScreen onNavigate={handleNavigate} />}
      {currentScreen === "leaderboard" && <LeaderboardScreen onNavigate={handleNavigate} />}
      {currentScreen === "organization" && <OrganizationScreen onNavigate={handleNavigate} />} */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#10B981",
  },
});
