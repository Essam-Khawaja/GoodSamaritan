"use client";

import { useState, useEffect } from "react";
import { StyleSheet, SafeAreaView, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import OnboardingScreen from "./onboarding";
import AuthScreen from "./auth";
import SplashScreen from "./splashScreen";
import React from "react";
import HomeScreen from "./screens/HomeScreen";
import type { Task } from "./types";
import LandingPage from "./LandingPage";
import UserMainDashboard from "./userMainDashboard";
import UserProfileScreen from "./screens/UserProfile";
import OrgProfileScreen from "./screens/OrgProfile";
import LeaderboardScreen from "./screens/Leaderboard";
import OrganizationScreen from "./screens/Organisation";
import BottomNav from "./components/BottomNav";
import { getUserType } from "./storage";

type Screen =
  | "splash"
  | "onboarding"
  | "auth"
  | "home"
  | "profile"
  | "leaderboard"
  | "organization"
  | "userMainDashboard";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("onboarding");
  const [userType, setUserType] = useState<"civilian" | "organization" | null>(
    null
  );
  const [user, setUser] = useState<any>(null);
  const [storedUserType, setStoredUserType] = useState<"user" | "org" | null>(
    null
  );

  const handleSelectUserType = (type: "civilian" | "organization") => {
    setUserType(type);
    setCurrentScreen("auth");
  };

  const handleAuthSuccess = async (userData: any) => {
    setUser(userData);

    // Check user type from storage and navigate accordingly
    const storedType = await getUserType();
    setStoredUserType(storedType);

    if (storedType === "org") {
      setCurrentScreen("organization");
    } else {
      setCurrentScreen("home");
    }
  };

  const handleBackToOnboarding = () => {
    setUserType(null);
    setCurrentScreen("onboarding");
  };

  const handleNavigate = (
    screen: "home" | "profile" | "leaderboard" | "organization"
  ) => {
    setCurrentScreen(screen);
  };

  // Determine if we should show the bottom nav
  const shouldShowBottomNav =
    storedUserType &&
    ["home", "profile", "leaderboard", "organization"].includes(currentScreen);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.screenContainer}>
        {/* Screens */}
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
        {currentScreen === "home" && (
          <HomeScreen onNavigate={handleNavigate} userType={storedUserType} />
        )}
        {currentScreen === "profile" && storedUserType === "user" && (
          <UserProfileScreen
            onNavigate={handleNavigate}
            userType={storedUserType}
          />
        )}
        {currentScreen === "profile" && storedUserType === "org" && (
          <OrgProfileScreen
            onNavigate={handleNavigate}
            userType={storedUserType}
          />
        )}
        {currentScreen === "leaderboard" && (
          <LeaderboardScreen onNavigate={handleNavigate} />
        )}
        {currentScreen === "organization" && (
          <OrganizationScreen
            onNavigate={handleNavigate}
            userType={storedUserType}
          />
        )}

        {/* Bottom Navigation - Centralized */}
        {shouldShowBottomNav && (
          <BottomNav
            currentScreen={
              currentScreen as
                | "home"
                | "profile"
                | "leaderboard"
                | "organization"
            }
            onNavigate={handleNavigate}
            userType={storedUserType}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  screenContainer: {
    flex: 1,
    position: "relative",
  },
});
