# SIH26041 — AR-Based Vocational Training Simulator for Industrial Safety

**Smart India Hackathon 2026 | Government of Jharkhand**

---

## 🎯 Problem Statement

Workers in Jharkhand's mining and manufacturing sectors face life-threatening hazards daily (roof collapses, gas leaks, fires, equipment failures). Traditional safety training is passive and ineffective:
- Classroom lectures don't prepare for real emergencies
- Workers cannot safely practice dangerous scenarios
- No feedback or performance tracking
- High risk of workplace accidents and fatalities

**Need:** An interactive, safe way for workers to practice emergency responses before facing actual dangers.

---

## ✅ Solution

**AR-Based Vocational Training Simulator** — An interactive web app that:
1. Uses **Augmented Reality (AR)** to overlay 3D industrial scenes
2. Presents realistic hazard scenarios (fire, gas leak, PPE violations)
3. Allows workers to make decisions (tap buttons to choose actions)
4. Scores responses in real-time (correct = +points, wrong = -points)
5. Provides instant feedback explaining why each choice was right/wrong
6. Lets trainers view all worker performance on a dashboard
7. Tracks progress over multiple training sessions

**How it works:**
- Trainee opens app on smartphone
- Points camera at printed AR marker
- 3D mine/factory scene appears with hazard
- Makes 4-5 decisions during the scenario
- Gets scored and feedback
- Score saved to database
- Trainer sees results on dashboard

---

## 🎓 Features

✅ **User Authentication** — Email/password login and registration
✅ **3 Training Scenarios** — PPE Check, Fire Response, Gas Leak Emergency
✅ **AR Integration** — 3D scenes with interactive elements
✅ **Real-time Scoring** — Points awarded for correct decisions
✅ **Instant Feedback** — Explains correct vs incorrect responses
✅ **Trainer Dashboard** — View all trainee scores and progress
✅ **Mobile Responsive** — Works on any smartphone
✅ **Multilingual** — English and Hindi language support
✅ **Session Tracking** — Records time taken and all decisions made
✅ **Performance Metrics** — Dashboard with charts and statistics

---

## 👥 Team (6 Members)

| # | Name | Role |
|---|------|------|
| 1 | [Person 1] | AR Development (A-Frame, AR.js, 3D scenes) |
| 2 | [Person 2] | Simulation Engine (scenario logic, scoring system) |
| 3 | [Person 3] | Backend API (Express.js, Node.js, Firebase integration) |
| 4 | [Person 4] | Database & Documentation (Firebase, GitHub, README) |
| 5 | [Person 5] | Trainer Dashboard (frontend, charts, analytics) |
| 6 | [Person 6] | UI/UX Design (HTML, CSS, responsive layout) |

---

## 🛠️ Tech Stack

| Layer | Technology | Why? |
|-------|-----------|------|
| **Frontend** | HTML5, CSS3, JavaScript ES6 | Lightweight, works on mobile browsers |
| **AR Engine** | A-Frame + AR.js | Browser-based AR, no app download needed |
| **Simulation** | Vanilla JavaScript | Scenario logic, decision trees, scoring |
| **Backend** | Node.js + Express.js | Fast, scalable server |
| **Database** | Firebase Firestore | Real-time data, easy setup, free tier |
| **Authentication** | Firebase Auth | Secure login, email/password |
| **Deployment** | Vercel (frontend), Render (backend) | Free, auto-deploy from GitHub |

---

## 📁 Project Structure
