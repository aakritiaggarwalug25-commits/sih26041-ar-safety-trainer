# SIH26041 – AR-Based Vocational Training Simulator

An interactive Augmented Reality (AR) web application designed to help workers in Jharkhand's mining and manufacturing sectors safely practice emergency-response scenarios in a simulated environment.

---

## 🎯 Problem Statement

Workers in Jharkhand's mining and manufacturing sectors face life-threatening hazards during their work.

- Classroom lectures don't prepare workers for real emergencies.
- Workers cannot safely practice dangerous scenarios.
- There is no effective feedback or performance tracking.
- High-risk workplace accidents can result in serious injuries and fatalities.

### Need

An interactive and safe platform where workers can practice emergency responses before facing real-world hazardous situations.

---

## 💡 Solution

**AR-Based Vocational Training Simulator** is an interactive web application that:

1. Uses **Augmented Reality (AR)** to overlay 3D industrial scenes.
2. Provides realistic hazard scenarios such as:
   - Fire
   - Gas Leak
   - PPE Violations
3. Allows workers to make decisions during scenarios.
4. Scores workers in real-time based on their decisions.
5. Provides instant feedback explaining correct and incorrect responses.
6. Allows trainers to monitor worker performance through a dashboard.
7. Tracks performance across multiple training sessions.

### How It Works

1. Trainee opens the application on a smartphone.
2. Trainee points the camera at a printed AR marker.
3. A 3D mine/factory scene appears with a hazard.
4. The trainee makes decisions during the scenario.
5. The system evaluates each decision.
6. The trainee receives a score and feedback.
7. The score is saved to the database.
8. Trainers can view trainee performance on the dashboard.

---

## ✨ Features

- ✅ **User Authentication** — Email/password login and registration.
- ✅ **Trainer Dashboard** — View PPE Check, Fire Response, and Gas Leak Emergency performance.
- ✅ **AR Integration** — Interactive 3D industrial scenes.
- ✅ **Real-Time Scoring** — Points awarded for correct decisions.
- ✅ **Instant Feedback** — Explains correct vs. incorrect responses.
- ✅ **Trainer Dashboard** — View trainee scores and progress.
- ✅ **Mobile Responsive** — Works on smartphones.
- ✅ **Multilingual Support** — English and Hindi language support.
- ✅ **Session Tracking** — Records training sessions and decisions.
- ✅ **Performance Metrics** — Dashboard with charts and statistics.

---

## 👥 Team

| # | Name | Role |
|---|------|------|
| 1 | Person 1 | AR Development (A-Frame, AR.js, 3D scenes) |
| 2 | Person 2 | Simulation Engine (scenario logic, scoring system) |
| 3 | Person 3 | Backend API (Express.js, Node.js, Firebase integration) |
| 4 | Person 4 | Database & Documentation (Firebase, GitHub, README) |
| 5 | Person 5 | Trainer Dashboard (frontend, charts, analytics) |
| 6 | Person 6 | UI/UX Design (HTML, CSS, responsive layout) |

---

## 🛠️ Tech Stack

| Layer | Technology | Why? |
|------|------------|------|
| Frontend | HTML5, CSS3, JavaScript ES6, Lightweight | Works on mobile browsers |
| AR Engine | A-Frame, AR.js | Browser-based AR, no app download required |
| Simulation | Vanilla JavaScript | Scenario logic, decision tree, scoring |
| Backend | Node.js, Express.js | Fast, scalable server |
| Database | Firebase Firestore | Real-time data, easy setup, free tier |
| Authentication | Firebase Auth | Secure authentication using email/password |
| Deployment | Vercel + Render | Free, auto-deploy from GitHub |

---

## 📁 Project Structure

```text
sih26041-ar-safety-trainer/
│
├── App/                         # Frontend AR Training App
│   ├── index.html               # Home/Dashboard page
│   ├── login.html               # User login
│   ├── register.html            # User registration
│   ├── scenarios.html           # Scenario selection
│   ├── training.html            # AR training view
│   ├── results.html             # Score & feedback
│   ├── language.html            # Language selection
│   ├── main.js                  # Entry point
│   ├── styles.css               # Global styles
│   │
│   ├── css/
│   │   └── scenarios.css        # Scenario-specific styles
│   │
│   ├── js/
│   │   ├── config.js            # Firebase configuration
│   │   ├── auth.js              # Login/register logic
│   │   ├── training.js          # Training flow
│   │   │
│   │   ├── engine/              # Core simulation engine
│   │   │   ├── scenarioEngine.js
│   │   │   ├── interactionEngine.js
│   │   │   ├── evaluationEngine.js
│   │   │   ├── arManager.js
│   │   │   ├── scoringManager.js
│   │   │   ├── sessionManager.js
│   │   │   ├── environmentManager.js
│   │   │   ├── i18n.js
│   │   │   └── loggingService.js
│   │   │
│   │   ├── scenes/              # 3D scene configurations
│   │   │   ├── model01.js       # PPE Check scenario
│   │   │   ├── model02.js       # Fire Response scenario
│   │   │   └── model03.js       # Gas Leak scenario
│   │   │
│   │   └── props/               # 3D objects/props
│   │       └── index.js
│
├── backend/                     # Express.js API Server
│   ├── server.js                # Express app entry point
│   ├── package.json             # Dependencies
│   │
│   ├── config/
│   │   └── firebase.js          # Firebase Admin setup
│   │
│   ├── middleware/
│   │   └── authMiddleware.js    # JWT verification
│   │
│   ├── routes/                  # API endpoints
│   │   ├── authRoutes.js        # /auth/login, /auth/register
│   │   ├── contentRoutes.js     # /content/* endpoints
│   │   ├── sessionRoutes.js     # /sessions/* endpoints
│   │   ├── resultRoutes.js      # /results/* endpoints
│   │   └── dashboardRoutes.js   # /dashboard/* endpoints
│   │
│   ├── utils/
│   │   ├── scoring.js           # Scoring calculations
│   │   └── content.js           # Content management
│   │
│   ├── .env.example             # Environment variables template
│   └── README.md                # Backend setup guide
│
├── dashboard/                   # Trainer Dashboard
│   ├── dashboard.html           # Main dashboard view
│   ├── dashboard.js             # Dashboard logic
│   ├── dashboard.css            # Styling
│   ├── charts.js                # Chart rendering
│   ├── auth.js                  # Trainer login
│   ├── api.js                   # API calls
│   └── config.js                # Firebase configuration
│
├── content/
│   └── ar_safety_training_modules.json
│                                # Training scenario definitions
│
├── tests/                       # Unit & integration tests
│   ├── arManager.test.js
│   ├── engine.test.js
│   └── content-consistency.test.js
│
├── docs/                        # Documentation
│   └── legacy-planning/         # Original planning documents,
│                                # diagrams and documentation
│
├── README.md                    # This file
├── .gitignore                   # Files excluded from Git
└── DELIVERY_SUMMARY.md          # Project delivery summary
