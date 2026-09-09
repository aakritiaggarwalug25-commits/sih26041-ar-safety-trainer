
---

## 🔌 API Documentation

**Base URL:** `https://sih-ar-backend.onrender.com/api`

### **Authentication**
| Endpoint | Method | Purpose | Body |
|----------|--------|---------|------|
| `/auth/register` | POST | Create new account | {email, password, name, role, organization} |
| `/auth/login` | POST | User login | {email, password} |

### **Training**
| Endpoint | Method | Purpose | Auth |
|----------|--------|---------|------|
| `/content/scenarios` | GET | Get all 3 scenarios | Bearer token |
| `/sessions/start` | POST | Start new training session | Bearer token |
| `/sessions/:id/submit` | POST | Submit completed scenario | Bearer token |

### **Results & Analytics**
| Endpoint | Method | Purpose | Auth |
|----------|--------|---------|------|
| `/results` | GET | Get all results (trainer only) | Bearer token |
| `/results/user/:userId` | GET | Get trainee's results | Bearer token |
| `/dashboard/summary` | GET | Dashboard statistics | Bearer token |

---

## 🗄️ Database Schema

### **Firestore Collections**

**Collection: `users`**
```json
{
  "uid": "abc123xyz",
  "email": "ravi@example.com",
  "name": "Ravi Kumar",
  "role": "trainee",              // or "trainer"
  "organization": "CCL Dhanbad",
  "createdAt": "2026-09-01T10:30:00Z"
}
```

**Collection: `results`**
```json
{
  "id": "result_001",
  "userId": "abc123xyz",
  "userName": "Ravi Kumar",
  "scenarioId": "mod02_fire",
  "scenarioName": "Fire Emergency Response",
  "score": 75,
  "maxScore": 100,
  "percentage": 75,
  "rating": "Good",
  "timeTaken": 120,
  "completedAt": "2026-09-02T14:45:00Z",
  "steps": [
    {
      "stepId": 1,
      "question": "Fire detected! What do you do?",
      "selectedOption": "Raise Alarm",
      "isCorrect": true,
      "pointsAwarded": 25,
      "feedback": "Correct! Always alert others first."
    }
  ]
}
```

**Collection: `sessions`**
```json
{
  "sessionId": "session_xyz",
  "userId": "abc123xyz",
  "scenarioId": "mod02_fire",
  "startedAt": "2026-09-02T14:43:00Z",
  "status": "completed",          // or "in_progress"
  "decisions": [...]
}
```

---

## 🚀 Deployment

### **Frontend on Vercel**

1. Push code to GitHub ✅ (already done!)
2. Go to **vercel.com** → Sign in with GitHub
3. Click "New Project" → Select repo
4. Set root directory: `App/`
5. Deploy
6. Live URL: `https://sih-ar-trainer.vercel.app`

### **Backend on Render**

1. Go to **render.com** → Sign in with GitHub
2. Click "New Web Service" → Select repo
3. Set root directory: `backend/`
4. Build command: `npm install`
5. Start command: `node server.js`
6. Add environment variables from `.env`
7. Deploy
8. Live URL: `https://sih-ar-backend.onrender.com`

---

## 🧪 Testing

All scenarios tested with:
- ✅ Register/Login flow
- ✅ AR marker detection
- ✅ Scenario execution
- ✅ Scoring accuracy
- ✅ Results persistence
- ✅ Dashboard display
- ✅ Mobile responsiveness

See `docs/testing-report.md` for detailed test cases and results.

---

## 🔐 Security

- ✅ Firebase Authentication (secure password hashing)
- ✅ JWT tokens for API requests
- ✅ Firestore security rules (authenticated users only)
- ✅ HTTPS encryption (Vercel & Render)
- ✅ No secrets in GitHub (`.env` excluded)
- ✅ Service account key not committed

---

## 📊 Performance

- **Frontend:** Loads in <2 seconds on 4G
- **AR Scenes:** 30 FPS on mobile devices
- **API Response:** <500ms average
- **Database:** Real-time sync via Firestore

---
