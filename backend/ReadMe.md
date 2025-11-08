# Backend Docs

## User Types

### User
```typescript
User: {
    userID: string
    email: string
    password: string
    name: string
    userStats: {
        elo: int
        rank: int
        totalTasks: int
        monthTasks: int
    }
}
```

```typescript
Org: {
    orgID: string
    email: string
    password: string
    name: string
}
```

```typescript
Tasks: {
    taskID: string
    title: string
    description: string
    latitude: float
    longitude: float
    elo: int
    orgID: string
    userID: string
    time: string 
    status: int (0: Incomplete, 1: In Progress, 2: Complete, 3: Available)
}
```