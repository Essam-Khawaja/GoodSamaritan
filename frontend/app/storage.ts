import AsyncStorage from "@react-native-async-storage/async-storage";
import type { User, Org } from "./types";

export interface StoredUserData extends Partial<User & Org> {
  type: "user" | "org";
}

/**
 * Get the currently logged in user data
 */
export const getUserData = async (): Promise<StoredUserData | null> => {
  try {
    const userData = await AsyncStorage.getItem("user_data");
    if (!userData) return null;
    return JSON.parse(userData);
  } catch (error) {
    console.error("Error getting user data:", error);
    return null;
  }
};

/**
 * Update user data in storage
 */
export const updateUserData = async (
  userData: User | Org,
  type: "user" | "org"
): Promise<void> => {
  try {
    const userDataWithType = {
      ...userData,
      type: type,
    };
    await AsyncStorage.setItem("user_data", JSON.stringify(userDataWithType));
  } catch (error) {
    console.error("Error updating user data:", error);
    throw error;
  }
};

/**
 * Clear user data (logout)
 */
export const clearUserData = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem("user_data");
  } catch (error) {
    console.error("Error clearing user data:", error);
    throw error;
  }
};

/**
 * Check if user is logged in
 */
export const isLoggedIn = async (): Promise<boolean> => {
  const userData = await getUserData();
  return userData !== null;
};

/**
 * Get user ID based on type
 */
export const getUserId = async (): Promise<string | null> => {
  const userData = await getUserData();
  if (!userData) return null;
  
  if (userData.type === "user") {
    return (userData as User).userID;
  } else {
    return (userData as Org).orgID;
  }
};

/**
 * Get user type
 */
export const getUserType = async (): Promise<"user" | "org" | null> => {
  const userData = await getUserData();
  return userData?.type || null;
};

/**
 * Refresh user data from API
 */
export const refreshUserData = async (
  apiBaseUrl: string
): Promise<StoredUserData | null> => {
  try {
    const userData = await getUserData();
    if (!userData) return null;

    const userId =
      userData.type === "user"
        ? (userData as User).userID
        : (userData as Org).orgID;

    const endpoint =
      userData.type === "user"
        ? `${apiBaseUrl}/get-user?userID=${userId}`
        : `${apiBaseUrl}/get-org?orgID=${userId}`;

    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (response.ok && data.success !== false) {
      const refreshedData = data.user || data.org;
      await updateUserData(refreshedData, userData.type);
      return { ...refreshedData, type: userData.type };
    } else {
      throw new Error(data.message || "Failed to refresh user data");
    }
  } catch (error) {
    console.error("Error refreshing user data:", error);
    throw error;
  }
};