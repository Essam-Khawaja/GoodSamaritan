export interface User {
  userID: string
  email: string
  password: string
  name: string
  elo: number
  userStats: {
    // elo: number
    rank: number
    totalTasks: number
    monthTasks: number
  }
}

export interface Org {
  orgID: string
  email: string
  password: string
  name: string
}

export interface Task {
  taskID: string
  title: string
  description: string
  latitude: number
  longitude: number
  elo: number
  orgID: string
  userID: string
  time: string
  status: 0 | 1 | 2 | 3 // 0: Incomplete, 1: In Progress, 2: Complete, 3: Available
}

export interface AuthResponse {
  success: boolean
  user?: User | Org
  token?: string
  message?: string
}

export type UserType = "civilian" | "organization"
