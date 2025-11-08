# Backend Docs

## User Types

### User
```typescript
User: {
    userID: string
    email: string
    password: string
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
    org: string
    time: str
}
```