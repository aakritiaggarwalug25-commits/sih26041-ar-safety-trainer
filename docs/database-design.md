# Database Design

## Overview
Firestore (NoSQL Database) stores 2 main collections:

## Collection 1: `users`

Stores trainee and trainer account information.

| Field | Type | Description |
|-------|------|-------------|
| uid | string | Unique user ID (auto from Firebase Auth) |
| email | string | User's email address |
| name | string | Full name |
| role | string | Either "trainee" or "trainer" |
| organization | string | Company/mine name |
| createdAt | timestamp | When account was created |

### Example Document:
```json
{
  "uid": "abc123xyz",
  "email": "ravi@example.com",
  "name": "Ravi Kumar",
  "role": "trainee",
  "organization": "CCL Dhanbad",
  "createdAt": "2026-09-01T10:30:00Z"
}
```

---

## Collection 2: `results`

Stores training scenario results and scores.

| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique result ID |
| userId | string | Reference to user who completed it |
| userName | string | User's name (for quick display) |
| scenarioId | string | "ppe-check", "fire-response", or "gas-leak" |
| scenarioName | string | Full scenario name |
| score | number | Points earned |
| maxScore | number | Total possible points |
| percentage | number | Score as percentage |
| rating | string | "Excellent", "Good", "Needs Improvement", or "Failed" |
| steps | array | Details of each decision step |
| timeTaken | number | Seconds to complete |
| completedAt | timestamp | When scenario was completed |

### Example Document:
```json
{
  "id": "result_001",
  "userId": "abc123xyz",
  "userName": "Ravi Kumar",
  "scenarioId": "fire-response",
  "scenarioName": "Fire Emergency Response",
  "score": 75,
  "maxScore": 100,
  "percentage": 75,
  "rating": "Good",
  "steps": [
    {
      "stepId": 1,
      "question": "Fire detected! What do you do?",
      "action": "Raise Alarm",
      "correct": true,
      "points": 25,
      "feedback": "Correct! Always alert others first."
    }
  ],
  "timeTaken": 120,
  "completedAt": "2026-09-02T14:45:00Z"
}
```

---

## Database Rules

- Only authenticated users can read/write data
- No direct client-side database access
- All operations go through Backend API
