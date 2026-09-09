# SIH26041 — Individual Task Sheets (Part 3 of 3)
## Copy-paste each person's section directly to them

---

# ============================================================
# PERSON 1 — COMPLETE TASK SHEET
# ============================================================

## 🏷️ Role: AR Developer & Frontend Integration Lead

## 🎯 Mission
Make Augmented Reality work. When a trainee points their phone camera at a printed marker, a 3D industrial scene must appear and change based on the training scenario. You also handle user login/registration and connecting the app to the backend API.

## Primary Work
- AR scene setup (A-Frame + AR.js)
- 3D model loading and management
- AR marker detection
- Scene state changes (show/hide objects based on scenario)

## Secondary Work
- User authentication UI (login/register pages → Firebase Auth)
- API integration (calling backend endpoints)

---

### 📚 WHAT TO LEARN

| Topic | Why You Need It | Exact Concepts | Resource | Time |
|-------|----------------|---------------|----------|------|
| **A-Frame** | This is how we create 3D scenes in the browser using HTML tags | `<a-scene>`, `<a-entity>`, `<a-box>`, `<a-sphere>`, `<a-gltf-model>`, `position`, `rotation`, `scale`, `material`, `animation` | **aframe.io** → Click "Docs" → Read "Introduction" and "Getting Started" → Then "Building a Basic Scene" | 2-3 hours |
| **AR.js** | This adds AR marker tracking to A-Frame | `<a-marker preset="hiro">`, adding AR.js script tag, `arjs` attribute on `<a-scene>`, custom marker patterns | **AR.js Documentation:** ar-js-org.github.io/AR.js-Docs → "Marker Based" section | 1-2 hours |
| **Loading 3D Models (GLB)** | To display realistic safety equipment and mine scenes | `<a-assets>`, `<a-asset-item>`, `<a-gltf-model>`, GLB file format | A-Frame docs → search "gltf-model" component | 1 hour |
| **Firebase Auth (Client SDK)** | To let users log in and register | `firebase.auth()`, `createUserWithEmailAndPassword()`, `signInWithEmailAndPassword()`, `onAuthStateChanged()`, `getIdToken()` | **firebase.google.com/docs/auth/web/start** → Read only "Get Started" and "Password Authentication" | 1-2 hours |
| **Fetch API** | To call our backend API from the browser | `fetch(url, options)`, `headers`, `Authorization: Bearer token`, `.then().json()` | **MDN Web Docs** → search "Using Fetch" | 1 hour |

### 🚫 WHAT NOT TO LEARN
- Three.js directly (A-Frame wraps it — you don't need raw Three.js)
- Unity, Unreal, ARCore, ARKit (different tools, not used in this project)
- AR.js location-based AR (we only use marker-based)
- AR.js NFT/image tracking (markers are simpler and more reliable)
- React, Vue, Angular (we use plain HTML/JS)
- WebXR API directly
- Complex 3D modeling (download pre-made models from Sketchfab)

---

### 🔨 DEVELOPMENT TASKS — DAY BY DAY

**30 AUG (Day 1):**
- ⬜ Install: Any code editor (VS Code recommended)
- ⬜ Learn: A-Frame basics (2-3 hours) — complete the "Getting Started" on aframe.io
- ⬜ Learn: AR.js marker detection (1-2 hours)
- ⬜ Practice: Create a file `test-ar.html` with A-Frame + AR.js. Add a yellow box on the Hiro marker. Open on phone. Verify it works.
- ⬜ **DELIVERABLE:** ✅ A yellow 3D box appears on your phone camera when you point at the Hiro marker

**31 AUG (Day 2):**
- ⬜ Download 1-2 free 3D models from Sketchfab (search: "hard hat", "fire extinguisher", "safety equipment") — download in GLB format
- ⬜ Load a GLB model in your A-Frame scene using `<a-gltf-model>`
- ⬜ Learn Firebase Auth client (1-2 hours)
- ⬜ Clone the team GitHub repo, create branch `feat/ar-core`, push first commit
- ⬜ **DELIVERABLE:** ✅ 3D model (e.g., hard hat) appears on AR marker

**1 SEP (Day 3):**
- ⬜ Create multiple AR scenes — different 3D setups for each scenario:
  - PPE Check: mine entrance + worker figure (or simple shapes representing it)
  - Fire Response: factory floor objects + fire effect (can be a red/orange animated shape)
  - Gas Leak: mine tunnel + gas cloud (semi-transparent sphere)
- ⬜ Make AR objects show/hide using JavaScript: `entity.setAttribute('visible', true/false)`
- ⬜ Start coding `ar-scene.js` — functions to load and switch between scenario scenes
- ⬜ **DELIVERABLE:** ✅ 2 different AR scenes can be loaded based on a function call

**2 SEP (Day 4):**
- ⬜ Create functions in `ar-scene.js`:
  - `loadScenario(scenarioId)` — sets up the right 3D objects
  - `updateScene(stepId, isCorrect)` — changes objects based on decision (e.g., show fire growing if wrong answer)
  - `resetScene()` — clear everything for a new scenario
- ⬜ Add simple animations: alarm flashing (color change), fire growing (scale animation), gas cloud expanding
- ⬜ **DELIVERABLE:** ✅ AR scene changes visually when functions are called from console

**3 SEP (Day 5) — INTEGRATION DAY:**
- ⬜ Code `auth.js`:
  - `register(email, password, name)` using Firebase Auth SDK
  - `login(email, password)` using Firebase Auth SDK
  - Store token in `localStorage`
  - Redirect to scenarios page after login
- ⬜ Code `api.js`:
  - `callAPI(endpoint, method, data)` — helper function that adds Authorization header
  - `submitResult(resultData)` — POST to `/api/results`
  - `getMyResults(userId)` — GET from `/api/results/user/:id`
- ⬜ Connect `auth.js` to P6's login HTML page
- ⬜ Test login → scenarios page → training page flow
- ⬜ **DELIVERABLE:** ✅ User can register, login, and reach the training page. Auth token stored.

**4 SEP (Day 6) — END-TO-END:**
- ⬜ Integrate AR scene with P2's simulation engine:
  - When P2's code calls `updateScene()`, your AR changes
  - When scenario completes, call `api.js` to submit results
- ⬜ Full flow test: Login → Select PPE scenario → AR loads → Make decisions → Score appears → Results saved
- ⬜ Test on your phone using the deployed backend URL (from P3)
- ⬜ **DELIVERABLE:** ✅ Complete AR training flow works end-to-end

**5 SEP (Day 7):**
- ⬜ Test AR on 2-3 different phones (borrow from teammates)
- ⬜ Fix any AR bugs (model not loading, marker not detected, scene not changing)
- ⬜ Optimize: compress GLB files if loading is slow (use gltf.report online tool)
- ⬜ Add "Point camera at marker" message when no marker is detected
- ⬜ **DELIVERABLE:** ✅ AR works reliably on multiple devices

**6 SEP (Day 8):**
- ⬜ **PPT Slide 3:** Technical Architecture
  - Create architecture diagram image (draw in draw.io, Canva, or PowerPoint itself)
  - List technology stack with icons/logos
  - Brief AR explanation with screenshot
- ⬜ Minor AR improvements (better object positioning, smoother animations)
- ⬜ **DELIVERABLE:** ✅ PPT Slide 3 draft complete

**7 SEP (Day 9):**
- ⬜ Support demo video recording — P6 will record your AR in action
- ⬜ Make sure AR marker is printed clearly on A4 paper
- ⬜ Practice the AR demo (smooth camera movement, good lighting)
- ⬜ Record multiple takes of AR demo footage
- ⬜ Finalize PPT Slide 3
- ⬜ **DELIVERABLE:** ✅ AR demo footage captured, Slide 3 finalized

**8 SEP (Day 10):**
- ⬜ Test AR on the deployed Vercel URL (not localhost)
- ⬜ Verify HTTPS works (camera requires HTTPS)
- ⬜ Fix any deployment-specific AR issues
- ⬜ Write README sections: "AR Functionality", "System Requirements", "Technology Stack"
- ⬜ **DELIVERABLE:** ✅ AR works on deployed URL, README sections complete

**9 SEP (Day 11):**
- ⬜ Code freeze — no new features
- ⬜ Final AR testing on deployment
- ⬜ Add model attributions in README (credit Sketchfab models)
- ⬜ Create printable AR marker PDF for `demo/` folder
- ⬜ **DELIVERABLE:** ✅ Everything finalized

**10 SEP (Day 12):**
- ⬜ Final check: AR works on deployment
- ⬜ Practice explaining your contribution (2 minutes: "I built the AR system using A-Frame and AR.js. Here's how it works...")
- ⬜ **DELIVERABLE:** ✅ Ready for submission

---

### 📁 Files/Modules Owned

```
app/js/ar-scene.js          ← You write ALL the AR code here
app/js/auth.js              ← Login/register JavaScript
app/js/api.js               ← API calling helper functions
app/assets/models/           ← 3D GLB model files (you download/manage these)
app/assets/markers/           ← AR marker .patt files + images
```

### Testing Tasks
- Test AR marker detection on 3+ phones
- Test different lighting conditions
- Test with/without internet
- Test login/register flow
- Test API calls work with correct auth token

### Dependencies
- **You depend on:** P2 (scenario data to know what scenes to show), P3 (API endpoints to call), P6 (HTML page structure), P4 (Firebase config)
- **Depends on you:** P2 (needs your AR functions to display their scenarios)

### README Sections You Own
- AR Functionality
- System Requirements
- Technology Stack (table)

### PPT
**SLIDE 3: Technical Architecture**
- Architecture diagram (component boxes with arrows)
- Technology stack table with all tools
- Brief explanation of how AR works in the app
- 1 AR screenshot
- **Deadline:** Sep 6 draft, Sep 7 final
- **Definition of Done:** Architecture diagram present, all technologies listed with versions, judges can trace data flow from diagram

### Demo Responsibility
- Operate the phone during live AR demo
- Show AR marker → 3D scene → scenario decisions
- Ensure good lighting and stable camera

### Definition of Done (Overall)
✅ AR marker detection works on at least 2 different phones
✅ 3D models load for all 3 scenarios
✅ AR scene changes based on simulation state
✅ Login/register works end-to-end
✅ API calls work with auth token
✅ Works on deployed Vercel URL over HTTPS

---

# ============================================================
# PERSON 2 — COMPLETE TASK SHEET
# ============================================================

## 🏷️ Role: Scenario Designer & Simulation Engine Developer

## 🎯 Mission
You are the BRAIN of the simulator. You design the 3 training scenarios (what happens, what choices exist, what's correct/incorrect) and build the engine that runs them step-by-step. Without your work, the app is just a 3D viewer, not a simulator.

## Primary Work
- Design 3 training scenarios (PPE Check, Fire Response, Gas Leak)
- Build the simulation engine (step-by-step decision flow)
- Build the scoring system
- Build the feedback system

## Secondary Work
- Define what the AR scene should show at each step (communicate to P1)
- Connect results to API for saving

---

### 📚 WHAT TO LEARN

| Topic | Why You Need It | Exact Concepts | Resource | Time |
|-------|----------------|---------------|----------|------|
| **JavaScript Objects & Arrays** | Scenario data is stored as JS objects | Object literals `{}`, arrays `[]`, nested objects, accessing properties with dot notation, array methods: `forEach`, `find`, `filter` | **MDN Web Docs** → "JavaScript Object Basics" and "Arrays" | 1-2 hours (review) |
| **DOM Manipulation** | To show/hide decision buttons, update score display, show feedback text | `document.getElementById()`, `.innerHTML`, `.style.display`, `.classList.add()`, `createElement`, `addEventListener` | **MDN Web Docs** → "Introduction to the DOM" | 1-2 hours (review) |
| **Custom Events** | To communicate with P1's AR code | `new CustomEvent('name', {detail: data})`, `dispatchEvent()`, `addEventListener()` | **MDN Web Docs** → "Creating and triggering events" | 30 min |

### 🚫 WHAT NOT TO LEARN
- Game engines (Unity, Godot, Phaser)
- State management libraries (Redux, MobX)
- AI/ML for decision making
- Complex data structures (trees, graphs — your scenarios are simple arrays)
- Databases (P3 handles that)
- A-Frame/AR.js (P1 handles that — you just call their functions)

---

### 🔨 DEVELOPMENT TASKS — DAY BY DAY

**30 AUG (Day 1):**
- ⬜ Review JavaScript objects/arrays (1 hour)
- ⬜ Design the data structure for scenarios on paper or in a document:

```javascript
// Example structure — THIS is what you'll build
const scenarios = {
  "ppe-check": {
    id: "ppe-check",
    name: "PPE Compliance Check",
    description: "Identify correct PPE for mine entry",
    maxScore: 100,
    steps: [
      {
        stepId: 1,
        question: "A worker is about to enter the mine. Check their equipment. Is the hard hat present?",
        arAction: "highlight-head",  // tells AR what to show
        options: [
          { id: "a", text: "Hard hat is missing — flag it!", correct: true, points: 20, feedback: "Correct! Hard hats prevent head injuries from falling rocks." },
          { id: "b", text: "Hard hat looks fine", correct: false, points: -10, feedback: "Wrong! The worker has no hard hat. This is a critical safety violation." }
        ]
      },
      // ... more steps
    ]
  }
};
```

- ⬜ Write out ALL steps for PPE Check scenario (5-6 steps)
- ⬜ **DELIVERABLE:** ✅ PPE scenario fully designed (on paper or in a doc)

**31 AUG (Day 2):**
- ⬜ Code `scenario-data.js` — put the PPE Check scenario data in code using the structure above
- ⬜ Start designing Fire Response scenario (4-5 steps)
- ⬜ Start designing Gas Leak scenario (4-5 steps)
- ⬜ Clone team repo, create branch `feat/scenarios`, push first commit
- ⬜ **DELIVERABLE:** ✅ `scenario-data.js` with PPE scenario complete

**1 SEP (Day 3):**
- ⬜ Code `simulation.js` — the scenario engine:

```javascript
// Core functions you need to build:
class SimulationEngine {
  constructor(scenarioData) { /* store scenario, set currentStep = 0, score = 0 */ }
  getCurrentStep() { /* return the current step object */ }
  selectOption(optionId) { /* check if correct, update score, move to next step */ }
  isComplete() { /* return true if no more steps */ }
  getResults() { /* return final score, percentage, rating, step history */ }
  reset() { /* restart the scenario */ }
}
```

- ⬜ Test: create a simple HTML page, load your engine, run through PPE scenario by clicking buttons
- ⬜ **DELIVERABLE:** ✅ Simulation engine runs PPE scenario in browser (console + basic buttons)

**2 SEP (Day 4):**
- ⬜ Add Fire Response and Gas Leak scenarios to `scenario-data.js`
- ⬜ Build scoring engine:
  - Points per correct/incorrect answer
  - Time tracking (start time, end time)
  - Final percentage = (score / maxScore) × 100
  - Rating: ≥90% = "Excellent", ≥70% = "Good", ≥50% = "Needs Improvement", <50% = "Failed"
- ⬜ Build feedback system: after each answer, show feedback text and whether the answer was correct
- ⬜ Test all 3 scenarios manually
- ⬜ **DELIVERABLE:** ✅ All 3 scenarios work in simulation engine with scoring

**3 SEP (Day 5) — INTEGRATION DAY:**
- ⬜ Connect `simulation.js` to P6's `training.html`:
  - Decision buttons appear based on current step's options
  - When button clicked → `engine.selectOption(optionId)` runs
  - Score updates on screen
  - Feedback appears
  - Next step loads
- ⬜ Dispatch custom events to P1's AR code:
  - When step changes: `dispatchEvent(new CustomEvent('stepChange', {detail: {stepId, arAction}}))`
  - When answer selected: `dispatchEvent(new CustomEvent('answerSelected', {detail: {correct, arAction}}))`
- ⬜ **DELIVERABLE:** ✅ Scenario runs inside the actual training HTML page with buttons

**4 SEP (Day 6) — END-TO-END:**
- ⬜ After scenario completes → format results as JSON → call P1's `api.js` to submit to backend
- ⬜ Build results display on `results.html`:
  - Show total score, percentage, rating
  - Show per-step breakdown: question, your answer, correct answer, points, feedback
  - Add "Try Again" button and "Back to Scenarios" button
- ⬜ Test full flow end-to-end
- ⬜ **DELIVERABLE:** ✅ Complete scenario flow: start → decisions → score → results page → data saved

**5 SEP (Day 7):**
- ⬜ Fix any bugs in scenario logic
- ⬜ Review feedback text — make it educational and clear
- ⬜ Add "retry" functionality (restart the same scenario)
- ⬜ Edge case: what if user closes app mid-scenario? (Simple: just start over)
- ⬜ **DELIVERABLE:** ✅ All 3 scenarios polished and bug-free

**6 SEP (Day 8):**
- ⬜ **PPT Slide 4:** Core Features & Simulation Demo
  - List 3 scenarios with 1-line descriptions
  - Show a decision step example (screenshot or diagram)
  - Explain scoring system
  - Include an AR screenshot showing a scenario
  - Show what makes it a "simulator" (decisions + consequences)
- ⬜ Add optional: sound effects for correct/incorrect answers (simple beep sounds)
- ⬜ **DELIVERABLE:** ✅ Slide 4 draft complete

**7 SEP (Day 9):**
- ⬜ Support demo recording: walk through a scenario for P6's camera
- ⬜ Finalize Slide 4
- ⬜ **DELIVERABLE:** ✅ Scenario footage recorded, Slide 4 finalized

**8 SEP (Day 10):**
- ⬜ Final review: check all feedback text for spelling/accuracy
- ⬜ Write README sections: "Core Training Scenarios" (describe all 3), "Scoring System"
- ⬜ **DELIVERABLE:** ✅ README sections complete

**9 SEP (Day 11):**
- ⬜ Code freeze
- ⬜ Final testing of all 3 scenarios on deployed app
- ⬜ **DELIVERABLE:** ✅ Everything verified

**10 SEP (Day 12):**
- ⬜ Practice explaining: "I designed 3 safety training scenarios and built the simulation engine. Each scenario has decision steps with correct and incorrect paths. Here's how scoring works..."
- ⬜ **DELIVERABLE:** ✅ Ready for submission

---

### 📁 Files/Modules Owned
```
app/js/scenario-data.js     ← ALL scenario definitions (PPE, Fire, Gas Leak)
app/js/simulation.js        ← The simulation engine class + scoring
```

### Dependencies
- **You depend on:** P1 (AR functions to call for scene changes), P6 (HTML structure of training page)
- **Depends on you:** P1 (needs scenario arAction data), P3 (needs result data format)

### PPT
**SLIDE 4: Scenarios & Simulation Demo**
- Deadline: Sep 6 draft, Sep 7 final
- Definition of Done: All 3 scenarios described, scoring explained, at least 1 AR screenshot, simulation concept clear

### Demo Responsibility
- Walk through one scenario during demo, explaining decisions and consequences
- Provide voiceover content explaining the simulation logic

### Definition of Done (Overall)
✅ 3 scenarios fully defined with 4-6 steps each
✅ Simulation engine runs all scenarios correctly
✅ Scoring produces correct results
✅ Feedback is educational and clear
✅ Results data formats match API contract
✅ Works on deployed app

---

# ============================================================
# PERSON 3 — COMPLETE TASK SHEET
# ============================================================

## 🏷️ Role: Backend Developer & Integration Lead

## 🎯 Mission
Build the Express API server. You are the bridge between the frontend app and the database. Every piece of data flows through your code. You also deploy the backend to the cloud.

## Primary Work
- Node.js Express REST API (6 endpoints)
- Firebase Admin SDK integration (server-side)
- Deployment to Render

## Secondary Work
- API documentation
- Integration support for P1 and P5

---

### 📚 WHAT TO LEARN

| Topic | Why You Need It | Exact Concepts | Resource | Time |
|-------|----------------|---------------|----------|------|
| **Node.js** | Runtime for our backend | What Node.js is, `require()`, `npm init`, `npm install`, running files with `node` | **nodejs.org** → "Getting Started" guide | 1 hour |
| **Express.js** | Framework for building APIs | `express()`, `app.get()`, `app.post()`, `req.body`, `req.params`, `res.json()`, `app.use()` (middleware), `app.listen()` | **expressjs.com** → "Getting Started" → read "Hello World", "Basic Routing", "Static Files" | 2-3 hours |
| **Firebase Admin SDK** | Server-side database access | `admin.initializeApp()`, `admin.firestore()`, `collection().add()`, `collection().get()`, `doc().get()`, `collection().where()` | **firebase.google.com/docs/admin/setup** → then **firebase.google.com/docs/firestore/manage-data/add-data** and **get-data** | 2 hours |
| **CORS** | Allow browser to call your API | What CORS is (browser security), `npm install cors`, `app.use(cors())` | Google "express cors" — it's literally 3 lines of code | 15 min |
| **Environment Variables** | Keep secrets safe | `npm install dotenv`, `require('dotenv').config()`, `process.env.VAR_NAME`, `.env` file | **npmjs.com/package/dotenv** — README is enough | 15 min |
| **JWT Token Verification** | Verify user identity | `admin.auth().verifyIdToken(token)` — Firebase Admin verifies tokens from client | Firebase Admin Auth docs → "Verify ID Tokens" | 30 min |

### 🚫 WHAT NOT TO LEARN
- Express templating (EJS, Pug, Handlebars) — we don't render HTML on server
- Socket.io / WebSockets — no real-time needed
- GraphQL — REST is simpler and sufficient
- TypeScript — plain JS is fine
- Docker / Kubernetes — overkill for this project
- Database ORMs (Sequelize, Mongoose) — Firestore has its own SDK
- Testing frameworks (for now — manual testing is fine)
- Session-based auth (we use JWT tokens)

---

### 🔨 DEVELOPMENT TASKS — DAY BY DAY

**30 AUG (Day 1):**
- ⬜ Install Node.js (nodejs.org — download LTS version)
- ⬜ Learn Express basics (2-3 hours)
- ⬜ Practice: Create a folder `backend/`, run `npm init -y`, `npm install express`
- ⬜ Create `server.js`:
```javascript
const express = require('express');
const app = express();
app.use(express.json());
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.listen(3000, () => console.log('Server running on port 3000'));
```
- ⬜ Run `node server.js`, visit `http://localhost:3000/api/health`
- ⬜ **DELIVERABLE:** ✅ Express server returns JSON

**31 AUG (Day 2):**
- ⬜ Learn Firebase Admin SDK (2 hours)
- ⬜ Get service account key from P4 (they'll share it privately — NOT via GitHub)
- ⬜ Create `config/firebase.js`:
```javascript
const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();
module.exports = { admin, db };
```
- ⬜ Create `routes/authRoutes.js` with register and login endpoints
- ⬜ Create `middleware/authMiddleware.js` — verify Firebase token
- ⬜ Test with Postman or Thunder Client (VS Code extension)
- ⬜ Clone team repo, create branch `feat/backend`, push
- ⬜ **DELIVERABLE:** ✅ Register + Login endpoints work, token verification works

**1 SEP (Day 3):**
- ⬜ Create `routes/resultRoutes.js`:
  - `POST /api/results` — save a training result to Firestore
  - `GET /api/results` — get all results (for trainers)
  - `GET /api/results/user/:userId` — get results for specific user
- ⬜ Test each endpoint with Postman
- ⬜ Add CORS: `npm install cors`, `app.use(cors())`
- ⬜ **DELIVERABLE:** ✅ Results endpoints work, data saves to Firestore

**2 SEP (Day 4):**
- ⬜ Create `routes/dashboardRoutes.js`:
  - `GET /api/dashboard/summary` — aggregated stats (total trainees, avg scores, per-scenario stats)
- ⬜ Add input validation: check required fields exist, return 400 if missing
- ⬜ Add error handling: try/catch in all routes, return proper error messages
- ⬜ Create `.env.example` file (safe template without real values)
- ⬜ **DELIVERABLE:** ✅ All 6 API endpoints working + validated

**3 SEP (Day 5) — DEPLOYMENT + INTEGRATION:**
- ⬜ Deploy to Render:
  1. Push backend code to GitHub
  2. Go to render.com → "New Web Service"
  3. Connect GitHub repo → set root directory to `backend/`
  4. Build command: `npm install`
  5. Start command: `node server.js`
  6. Add environment variables in Render dashboard
  7. Deploy
- ⬜ Test all endpoints on the Render URL
- ⬜ Share the Render URL with the team
- ⬜ Help P1 connect auth, help P5 connect dashboard
- ⬜ **DELIVERABLE:** ✅ Backend live on Render, team can call it

**4 SEP (Day 6):**
- ⬜ Fix integration bugs (CORS issues, auth token problems, data format mismatches)
- ⬜ End-to-end testing: verify P1's frontend can register, login, submit results
- ⬜ Verify P5's dashboard can fetch results and summary
- ⬜ Add role-based access: trainer endpoints only accessible by trainer role
- ⬜ **DELIVERABLE:** ✅ No integration errors

**5 SEP (Day 7):**
- ⬜ Security review:
  - Verify no secrets in code
  - Verify all sensitive routes require auth token
  - Verify input validation on all POST endpoints
  - Verify error messages don't expose internal details
- ⬜ Add rate limiting (optional but good): `npm install express-rate-limit`
- ⬜ **DELIVERABLE:** ✅ Backend hardened

**6 SEP (Day 8):**
- ⬜ **PPT Slide 6:** Deployment, Security & Conclusion
  - Deployment architecture diagram (Vercel + Render + Firebase)
  - Live deployment URLs
  - Security measures (Firebase Auth, JWT, no secrets in code)
  - Cost analysis (\$0 deployment)
  - References and acknowledgments
- ⬜ **DELIVERABLE:** ✅ Slide 6 draft

**7 SEP (Day 9):**
- ⬜ Final API stability testing
- ⬜ Finalize Slide 6
- ⬜ **DELIVERABLE:** ✅ Slide 6 final, API stable

**8 SEP (Day 10):**
- ⬜ Write README sections: "API Documentation" (all 6 endpoints with examples), "Installation & Setup", "Configuration", "Running the Project", "Security", "Live Deployment"
- ⬜ Create demo credentials (test trainee + test trainer accounts)
- ⬜ **DELIVERABLE:** ✅ README sections complete

**9 SEP (Day 11):**
- ⬜ Code freeze
- ⬜ Verify deployment is stable
- ⬜ Verify no secrets in committed code (`git log --all -- '*.env'` should return nothing)
- ⬜ **DELIVERABLE:** ✅ Backend finalized

**10 SEP (Day 12):**
- ⬜ Practice explaining: "I built the REST API with Node.js and Express. It handles authentication, stores training results in Firestore, and provides data to the trainer dashboard. Here are the 6 endpoints..."
- ⬜ **DELIVERABLE:** ✅ Ready for submission

---

### 📁 Files/Modules Owned
```
backend/                     ← ENTIRE backend folder
  server.js
  routes/authRoutes.js
  routes/resultRoutes.js
  routes/dashboardRoutes.js
  middleware/authMiddleware.js
  config/firebase.js
  package.json
  .env.example
```

### Dependencies
- **You depend on:** P4 (Firebase project config + service account key)
- **Depends on you:** P1 (calls your auth + results API), P2 (results saved through your API), P5 (dashboard fetches from your API)

### PPT
**SLIDE 6: Deployment, Security & Conclusion**
- Deadline: Sep 6 draft, Sep 7 final
- Definition of Done: Deployment URLs present, security measures listed, cost = \$0 mentioned, architecture diagram for deployment

### Demo Responsibility
- Ensure backend is warm (not cold-started) before demo
- Support any live demo troubleshooting

### Definition of Done (Overall)
✅ All 6 API endpoints work correctly
✅ Firebase integration reads/writes data
✅ Auth middleware verifies tokens
✅ Deployed on Render with HTTPS
✅ No secrets in committed code
✅ .env.example exists
✅ CORS configured
✅ Error handling on all routes

---

# ============================================================
# PERSON 4 — COMPLETE TASK SHEET
# ============================================================

## 🏷️ Role: Database Admin, Documentation Lead & Project Manager

## 🎯 Mission
You are the team's organizer. You set up Firebase (database + auth), manage all documentation, run daily standups, enforce deadlines, and own the final GitHub submission. You make sure no one is blocked and everything gets submitted on time.

## Primary Work
- Firebase project setup (Firestore + Auth)
- All documentation (README, architecture diagrams, testing docs)
- Project management (standups, deadline enforcement)

## Secondary Work
- Testing coordination
- Final GitHub repository cleanup and submission

---

### 📚 WHAT TO LEARN

| Topic | Why You Need It | Exact Concepts | Resource | Time |
|-------|----------------|---------------|----------|------|
| **Firebase Console** | Set up the entire Firebase project | Create project, enable Firestore, enable Email/Password Auth, get Web SDK config, generate service account key | **firebase.google.com** → Console → Click "Add Project" and follow the wizard | 1 hour |
| **Firestore Basics** | Understand and design the database | Collections, documents, fields, data types, manual document creation in Console | **firebase.google.com/docs/firestore/quickstart** | 1-2 hours |
| **Firestore Security Rules** | Protect data | Basic rule: `allow read, write: if request.auth != null;` | Firebase docs → "Security Rules" → "Get Started" | 30 min |
| **Markdown** | Write documentation | Headers (#), bold (**), tables, code blocks (```), links, images | **markdownguide.org** → "Basic Syntax" | 30 min (review) |
| **Git/GitHub** | Version control | `git clone`, `git add`, `git commit`, `git push`, `git pull`, `git branch`, `git merge`, creating repos, pull requests | **docs.github.com** → "Git Handbook" OR YouTube: "Git Tutorial for Beginners" (any popular one under 30 min) | 1-2 hours |
| **draw.io** | Create diagrams | Create boxes, arrows, flowcharts | **app.diagrams.net** (free, browser-based) — very intuitive, no tutorial needed | 30 min |

### 🚫 WHAT NOT TO LEARN
- Firebase Cloud Functions
- Firebase Hosting CLI
- Firebase Analytics
- Complex Firestore queries (P3 handles that)
- Complex Git (rebasing, cherry-picking) — basic merge workflow is enough
- Any programming beyond basic understanding

---

### 🔨 DEVELOPMENT TASKS — DAY BY DAY

**30 AUG (Day 1):**
- ⬜ **Create Firebase project:**
  1. Go to console.firebase.google.com
  2. Click "Add Project"
  3. Name: "sih26041-ar-safety"
  4. Disable Google Analytics (not needed)
  5. Enable Firestore: Build → Firestore → Create Database → Start in Test Mode
  6. Enable Auth: Build → Authentication → Get Started → Enable Email/Password
  7. Get Web SDK config: Project Settings → Your Apps → Web (</>) → copy config
  8. Get service account key: Project Settings → Service Accounts → Generate New Private Key
- ⬜ Share Firebase Web config with team (this is safe to share)
- ⬜ Share service account key with P3 ONLY, privately (NOT via GitHub, NOT via group chat)
- ⬜ Review this entire execution plan thoroughly
- ⬜ **DELIVERABLE:** ✅ Firebase project live, config shared

**31 AUG (Day 2):**
- ⬜ Create GitHub repository: `sih26041-ar-safety-trainer`
  - Set to Public (required for submission)
  - Add .gitignore (Node template)
  - Create the folder structure as defined in Part 10
  - Create `develop` branch
  - Set `develop` as default branch (optional but recommended)
- ⬜ Help all team members clone the repo and create their feature branches
- ⬜ Set up Firestore security rules: `allow read, write: if request.auth != null;`
- ⬜ Write initial README with project title, PS number, and basic structure
- ⬜ **DELIVERABLE:** ✅ GitHub repo live, all members have access

**1 SEP (Day 3):**
- ⬜ Create architecture diagram using draw.io (app.diagrams.net):
  - Show: Trainee Phone → AR App → Backend API → Firestore
  - Show: Trainer → Dashboard → Backend API → Firestore
  - Label all components and technologies
- ⬜ Create user flow diagram:
  - Login → Select Scenario → AR Training → Decisions → Score → Dashboard
- ⬜ Write `docs/api-documentation.md` (use the API contract from this plan)
- ⬜ Export diagrams as PNG and save to `docs/`
- ⬜ **DELIVERABLE:** ✅ Architecture diagram + user flow + API docs in `docs/`

**2 SEP (Day 4):**
- ⬜ Write `docs/database-design.md`:
  - List all collections (users, results)
  - List all fields with types
  - Explain relationships
- ⬜ Verify Firestore is working: manually add a test document in Console, then verify P3 can read it from the API
- ⬜ Start `docs/testing-report.md` with test plan
- ⬜ **DELIVERABLE:** ✅ Database doc + testing plan started

**3 SEP (Day 5):**
- ⬜ Run daily standup — check integration progress
- ⬜ Help anyone who is blocked
- ⬜ Start PPT Slide 1: Problem Statement & Team Introduction
- ⬜ Update documentation with any changes from integration
- ⬜ **DELIVERABLE:** ✅ Slide 1 started, team unblocked

**4 SEP (Day 6):**
- ⬜ Test the full end-to-end flow yourself: register → login → complete a scenario → check results in Firestore Console → verify dashboard shows data
- ⬜ Document all bugs found
- ⬜ Update testing report
- ⬜ **DELIVERABLE:** ✅ Full flow tested, bugs documented

**5 SEP (Day 7):**
- ⬜ Complete testing report: list all test cases, results, known issues
- ⬜ Start writing full README (see Part 22 for your sections)
- ⬜ Enforce scope freeze — reject any new feature requests
- ⬜ **DELIVERABLE:** ✅ Testing report complete, README started

**6 SEP (Day 8):**
- ⬜ **PPT Slide 1:** Problem Statement & Team
  - PS number: SIH26041
  - Organization: Government of Jharkhand
  - Theme: Smart Education
  - Problem in 3-4 bullet points
  - Team name + 6 member names
  - Background: mining/industrial image
- ⬜ Review all other slides for consistency
- ⬜ Continue README writing
- ⬜ **DELIVERABLE:** ✅ Slide 1 complete, README progressing

**7 SEP (Day 9):**
- ⬜ Finalize Slide 1
- ⬜ Write voiceover script for the problem section of demo video (Scene 2)
- ⬜ Record voiceover (clear English, steady pace)
- ⬜ Review all 6 PPT slides for consistency
- ⬜ Continue README
- ⬜ **DELIVERABLE:** ✅ Slide 1 final, voiceover recorded, PPT reviewed

**8 SEP (Day 10):**
- ⬜ Finalize README — all your sections complete
- ⬜ Collect README sections from other members and assemble the complete README
- ⬜ Final documentation review (API docs, DB docs, testing docs)
- ⬜ Add architecture diagrams to README (embed images)
- ⬜ **DELIVERABLE:** ✅ Complete README, all docs finalized

**9 SEP (Day 11):**
- ⬜ **REPOSITORY CLEANUP:**
  - Merge all feature branches → develop
  - Merge develop → main
  - Verify main branch is clean and complete
  - Check: no `node_modules`, no `.env`, no service account key in repo
  - Check: all folders have the correct files
  - Run through ENTIRE submission checklist (Part 23)
- ⬜ **DELIVERABLE:** ✅ Repository submission-ready

**10 SEP (Day 12):**
- ⬜ **FINAL AUDIT** — Run through Part 34 Final Readiness Audit (all 25 YES/NO questions)
- ⬜ Clone the repo on a DIFFERENT computer — verify README setup instructions work
- ⬜ Verify all links in README work
- ⬜ Verify demo video plays
- ⬜ Submit GitHub link to SPOC
- ⬜ **DELIVERABLE:** ✅ **SUBMITTED**

---

### 📁 Files/Modules Owned
```
docs/                        ← ENTIRE docs folder
  architecture-diagram.png
  user-flow.png
  database-design.md
  api-documentation.md
  testing-report.md
  ar-marker-guide.md
README.md                    ← Primary owner (assembles all sections)
.gitignore
Firebase project config      ← (in Firebase Console, not a file in repo)
```

### Dependencies
- **You depend on:** No one (you start first)
- **Depends on you:** P3 (needs Firebase config + service account key), P1 (needs Firebase Web SDK config), everyone (needs GitHub repo)

### PPT
**SLIDE 1: Problem Statement & Team**
- Deadline: Sep 6 draft, Sep 7 final
- Definition of Done: PS number shown, problem clearly stated in ≤4 bullets, all 6 team member names, clean design

### Demo Responsibility
- Narrate the problem and impact sections (voiceover for video, verbal for live demo)
- Coordinate overall demo flow

### Definition of Done (Overall)
✅ Firebase project live with Firestore + Auth enabled
✅ GitHub repo created with correct structure
✅ All documentation complete (README, API docs, DB docs, testing docs, diagrams)
✅ Repository cleaned and submission-ready
✅ Submission checklist passed
✅ GitHub link submitted to SPOC

---

# ============================================================
# PERSON 5 — COMPLETE TASK SHEET
# ============================================================

## 🏷️ Role: Trainer Dashboard Developer

## 🎯 Mission
Build the web dashboard where safety trainers can see how their trainees performed. Show charts, tables, and individual trainee details. This is the "management layer" of the product — proving that training produces measurable data.

## Primary Work
- Trainer dashboard web pages (HTML/CSS/JS)
- Chart.js visualizations (bar charts, pie charts)
- API integration (fetch data from backend)

## Secondary Work
- Testing support (help test the full system)
- Impact analysis content for PPT

---

### 📚 WHAT TO LEARN

| Topic | Why You Need It | Exact Concepts | Resource | Time |
|-------|----------------|---------------|----------|------|
| **Fetch API** | Call backend to get trainee data | `fetch(url, {headers: {'Authorization': 'Bearer ' + token}})`, `.then(response => response.json())`, `.then(data => ...)`, `.catch(error => ...)` | **MDN Web Docs** → "Using Fetch" | 1-2 hours |
| **Chart.js** | Create beautiful charts | Include Chart.js via CDN `<script>`, create `<canvas>` element, `new Chart(ctx, {type: 'bar', data: {...}, options: {...}})` | **chartjs.org** → "Getting Started" → then look at "Bar", "Pie", "Line" examples | 2 hours |
| **DOM Manipulation** | Dynamically create table rows, update numbers | `document.getElementById()`, `.innerHTML`, `createElement('tr')`, `appendChild()` | **MDN Web Docs** → "Introduction to the DOM" | 1 hour (review) |
| **HTML Tables** | Display trainee data in organized format | `<table>`, `<thead>`, `<tbody>`, `<tr>`, `<th>`, `<td>` | Any HTML reference | 30 min (review) |

### 🚫 WHAT NOT TO LEARN
- React, Vue, Angular (plain HTML/JS is enough for a dashboard)
- D3.js (Chart.js is simpler and sufficient)
- WebSockets / real-time updates (page refresh is fine)
- Complex CSS frameworks (Bootstrap is OK if you want, but not required)
- Backend development (P3 handles that)
- AR/3D (P1 handles that)

---

### 🔨 DEVELOPMENT TASKS — DAY BY DAY

**30 AUG (Day 1):**
- ⬜ Learn Fetch API (1 hour)
- ⬜ Learn Chart.js (2 hours):
  - Go to chartjs.org → "Getting Started"
  - Create an HTML file with a `<canvas>` tag
  - Include Chart.js via CDN
  - Create a bar chart with hardcoded data
  - Create a pie chart with hardcoded data
- ⬜ **DELIVERABLE:** ✅ Bar chart + pie chart visible in browser with sample data

**31 AUG (Day 2):**
- ⬜ Design dashboard layout on paper: header, summary cards (Total Trainees, Avg Score, Total Completions), charts area, results table
- ⬜ Build `dashboard/index.html` — trainer login page
- ⬜ Build `dashboard/dashboard.html` skeleton — layout with placeholder cards and empty chart containers
- ⬜ Build `dashboard/css/dashboard.css` — clean professional styling
- ⬜ Clone repo, create `feat/dashboard` branch, push
- ⬜ **DELIVERABLE:** ✅ Dashboard HTML structure with styling (placeholder data OK)

**1 SEP (Day 3):**
- ⬜ Build `dashboard/js/dashboard.js`:
  - Function to fetch summary data from API: `GET /api/dashboard/summary`
  - Function to fetch all results: `GET /api/results`
  - Populate summary cards with fetched numbers
  - Create results table dynamically from data
- ⬜ If API not ready yet, use mock JSON data (hardcoded) — you can swap to real API later
- ⬜ **DELIVERABLE:** ✅ Dashboard shows data in cards + table (mock or real)

**2 SEP (Day 4):**
- ⬜ Build `dashboard/js/charts.js`:
  - **Bar chart:** Average score per scenario
  - **Pie chart:** Pass vs. Fail ratio (≥50% = pass)
  - **Bar chart:** Number of completions per scenario
- ⬜ Make charts responsive (resize with window)
- ⬜ Add color coding (green = good, red = bad, yellow = average)
- ⬜ **DELIVERABLE:** ✅ 3 charts render with data

**3 SEP (Day 5):**
- ⬜ Build `dashboard/trainee-detail.html`:
  - Shows individual trainee's scenario history
  - Score for each attempt, date, rating
  - Click a trainee in the table → shows their detail page
- ⬜ Build `dashboard/js/auth.js`:
  - Trainer login using Firebase Auth (same as trainee login but check role = "trainer")
  - If not trainer, show "Access denied"
- ⬜ **DELIVERABLE:** ✅ Trainee detail page + dashboard auth working

**4 SEP (Day 6) — INTEGRATION:**
- ⬜ **Switch from mock data to real API:**
  - Change all fetch URLs to P3's deployed Render URL
  - Add Authorization header with Firebase token
  - Test: complete a scenario in the AR app → refresh dashboard → verify new result appears
- ⬜ Fix any data display issues
- ⬜ **DELIVERABLE:** ✅ Dashboard shows REAL data from the deployed backend

**5 SEP (Day 7):**
- ⬜ Polish dashboard:
  - Add loading spinners while data fetches
  - Add "No data yet" message if no results exist
  - Make sure it looks good on laptop AND tablet
  - Add summary statistics: best-performing trainee, worst scenario, etc.
- ⬜ Test with multiple trainee results (ask teammates to complete scenarios)
- ⬜ **DELIVERABLE:** ✅ Dashboard polished and demo-ready

**6 SEP (Day 8):**
- ⬜ **PPT Slide 5:** Dashboard, Impact & Future Scope
  - Dashboard screenshot (with real data)
  - Impact bullets: measurable training, data-driven safety, cost-effective
  - Future scope: more scenarios, Hindi support, offline mode, AI recommendations
  - Scalability: adding industries, government-wide deployment
- ⬜ **DELIVERABLE:** ✅ Slide 5 draft

**7 SEP (Day 9):**
- ⬜ Record dashboard demo footage for P6's video:
  - Screen record: open dashboard → show summary → scroll to table → click a trainee → show charts
- ⬜ Finalize Slide 5
- ⬜ **DELIVERABLE:** ✅ Dashboard footage recorded, Slide 5 final

**8 SEP (Day 10):**
- ⬜ Final dashboard testing on deployed URL
- ⬜ Write README sections: "Key Features" (bullet list), "Future Scope"
- ⬜ **DELIVERABLE:** ✅ README sections complete, dashboard verified on deployment

**9 SEP (Day 11):**
- ⬜ Code freeze
- ⬜ Final verification
- ⬜ **DELIVERABLE:** ✅ Dashboard finalized

**10 SEP (Day 12):**
- ⬜ Practice explaining: "I built the trainer dashboard using Chart.js. It shows average scores per scenario, pass/fail rates, and individual trainee performance. Trainers can identify workers who need retraining."
- ⬜ **DELIVERABLE:** ✅ Ready for submission

---

### 📁 Files/Modules Owned
```
dashboard/                   ← ENTIRE dashboard folder
  index.html
  dashboard.html
  trainee-detail.html
  css/dashboard.css
  js/auth.js
  js/dashboard.js
  js/charts.js
```

### Dependencies
- **You depend on:** P3 (API endpoints), P4 (Firebase config for trainer auth)
- **Depends on you:** Nobody directly (dashboard is a standalone consumer)

### PPT
**SLIDE 5: Dashboard, Impact & Future Scope**
- Deadline: Sep 6 draft, Sep 7 final
- Definition of Done: Dashboard screenshot with data, impact points clear, future scope listed

### Demo Responsibility
- Demo the trainer dashboard during live demo / video
- Show charts and trainee data

### Definition of Done (Overall)
✅ Dashboard login works for trainer role
✅ Summary cards show correct numbers
✅ 3 charts render with real data
✅ Results table populates with trainee data
✅ Trainee detail page works
✅ Dashboard works on deployed URL
✅ Looks professional and clean

---

# ============================================================
# PERSON 6 — COMPLETE TASK SHEET
# ============================================================

## 🏷️ Role: UI/UX Developer, Demo Lead & Presentation Coordinator

## 🎯 Mission
Make the app look professional and polished. Build all HTML page layouts. Own the demo video (record, edit, coordinate). Make sure the PPT looks consistent across all 6 slides. Your work is what judges SEE first — first impressions matter enormously.

## Primary Work
- All HTML page layouts (login, register, scenarios, training, results)
- CSS styling (mobile-first, responsive, professional)
- Demo video recording and editing

## Secondary Work
- Screenshots capture
- PPT design consistency coordination
- AR marker printable PDF

---

### 📚 WHAT TO LEARN

| Topic | Why You Need It | Exact Concepts | Resource | Time |
|-------|----------------|---------------|----------|------|
| **CSS Flexbox** | Layout all pages neatly | `display: flex`, `justify-content`, `align-items`, `flex-direction`, `gap`, `flex-wrap` | **CSS-Tricks** → "A Complete Guide to Flexbox" (this one article is all you need) | 1-2 hours |
| **Responsive Design** | App must look good on phones | `<meta name="viewport">`, `@media (max-width: 768px)`, mobile-first approach, `%` and `rem` units | **MDN Web Docs** → "Responsive Design" | 1 hour |
| **CSS Variables** | Consistent colors across pages | `:root { --primary: #2196F3; }`, `color: var(--primary)` | MDN → "CSS Custom Properties" | 15 min |
| **Screen Recording** | Record demo video | Use built-in phone screen recorder (Android: pull down notification bar, tap "Screen Record") or OBS Studio on desktop | YouTube: "OBS Studio Tutorial for Beginners" (watch first 10 minutes only) | 1 hour |
| **Basic Video Editing** | Edit demo video | CapCut (free app on phone/desktop) or simple video editor: trim clips, add voiceover audio, add title cards | YouTube: "CapCut Tutorial for Beginners" (watch first 15 minutes only) | 1 hour |

### 🚫 WHAT NOT TO LEARN
- SASS/LESS preprocessors (plain CSS is fine)
- CSS Grid (Flexbox is enough)
- CSS-in-JS
- Complex animation libraries (Framer Motion, GSAP)
- JavaScript frameworks
- Professional video editing (After Effects, Premiere) — CapCut or basic editors are fine
- A-Frame/AR.js (P1 handles that)

---

### 🔨 DEVELOPMENT TASKS — DAY BY DAY

**30 AUG (Day 1):**
- ⬜ Review CSS Flexbox (1-2 hours)
- ⬜ Design wireframes for all pages (can be hand-drawn sketches photographed):
  1. **Login page:** Email, password, login button, register link
  2. **Register page:** Name, email, password, role selector, register button
  3. **Scenario selection page:** 3 scenario cards with title, description, start button
  4. **Training page:** AR camera view (full screen), decision buttons at bottom, score bar at top
  5. **Results page:** Score, rating, per-step feedback list, retry button
  6. **Dashboard:** (P5 handles this separately — coordinate with them)
- ⬜ Choose a color scheme:
  - **PROPOSAL:** Blue (#1565C0) for primary, Orange (#FF6F00) for accents/warnings, White (#FFFFFF) background, Dark (#212121) text
  - Safety-themed colors: Yellow for caution, Red for danger, Green for safe
- ⬜ **DELIVERABLE:** ✅ 6 wireframe sketches + color scheme chosen

**31 AUG (Day 2):**
- ⬜ Create `app/css/styles.css` with CSS variables:
```css
:root {
  --primary: #1565C0;
  --accent: #FF6F00;
  --success: #2E7D32;
  --danger: #C62828;
  --bg: #FFFFFF;
  --text: #212121;
  --card-bg: #F5F5F5;
}
```
- ⬜ Build `app/index.html` — Login page (responsive, centered form, clean design)
- ⬜ Build `app/register.html` — Registration page
- ⬜ Build `app/scenarios.html` — 3 scenario cards in a grid/column layout
- ⬜ All pages must have:
  - `<meta name="viewport" content="width=device-width, initial-scale=1.0">`
  - Proper `<script>` tags for Firebase SDK, auth.js, etc. (src attributes can be empty initially)
- ⬜ Clone repo, create `feat/ui-ux` branch, push
- ⬜ **DELIVERABLE:** ✅ 3 HTML pages styled and responsive

**1 SEP (Day 3):**
- ⬜ Build `app/training.html`:
  - Full-screen AR view area (this is where P1's A-Frame scene goes)
  - Decision button container at the bottom (floating over AR)
  - Score/timer bar at the top
  - "Searching for marker..." message (shown when no marker detected)
- ⬜ Build `app/results.html`:
  - Score display (big number + percentage)
  - Rating badge (Excellent/Good/Needs Improvement/Failed)
  - Per-step feedback list
  - "Try Again" and "Back to Scenarios" buttons
- ⬜ **DELIVERABLE:** ✅ Training page + Results page done

**2 SEP (Day 4):**
- ⬜ CSS polish across ALL pages:
  - Consistent fonts (Google Fonts — use "Roboto" or "Inter")
  - Consistent spacing
  - Button hover effects (subtle color change)
  - Input field styling (border, focus state)
  - Mobile responsive (test on phone browser)
- ⬜ Add page transitions: simple fade-in on page load (CSS `@keyframes fadeIn`)
- ⬜ Add icons if needed (use Font Awesome CDN or simple emoji/SVG)
- ⬜ **DELIVERABLE:** ✅ All pages look professional on mobile

**3 SEP (Day 5) — INTEGRATION SUPPORT:**
- ⬜ Work with P1 to integrate AR into `training.html`
- ⬜ Work with P2 to add decision buttons dynamically (P2's JS creates buttons, your CSS styles them)
- ⬜ Fix any layout issues that arise during integration
- ⬜ **DELIVERABLE:** ✅ Integration UI issues resolved

**4 SEP (Day 6):**
- ⬜ Help deploy frontend to Vercel:
  - Log into vercel.com with GitHub
  - Import the GitHub repo
  - Set root directory to `app/`
  - Deploy
- ⬜ Test deployed app on phone — does it look right?
- ⬜ Fix any deployment-specific CSS issues
- ⬜ **DELIVERABLE:** ✅ Frontend deployed on Vercel, looks good

**5 SEP (Day 7):**
- ⬜ **Capture screenshots** of every screen:
  - `01-login.png` — Login page
  - `02-register.png` — Register page
  - `03-scenarios.png` — Scenario selection
  - `04-ar-view.png` — AR training view (with 3D scene visible)
  - `05-decision.png` — Decision buttons visible
  - `06-feedback.png` — Feedback after answer
  - `07-results.png` — Score + results page
  - `08-dashboard.png` — Trainer dashboard (coordinate with P5)
- ⬜ Save to `screenshots/` folder
- ⬜ Start planning demo video scenes
- ⬜ **DELIVERABLE:** ✅ All screenshots captured

**6 SEP (Day 8):**
- ⬜ **PPT Slide 2:** Solution Overview & User Journey
  - Value proposition in 1-2 sentences
  - Solution description in 3-4 bullets
  - User journey flowchart (use draw.io or PowerPoint shapes)
  - 1-2 app screenshots
- ⬜ Coordinate PPT design:
  - Ensure all 6 slides use same font, colors, and layout style
  - Create a simple PPT template (shared background, font, slide structure)
- ⬜ **DELIVERABLE:** ✅ Slide 2 draft, PPT template shared

**7 SEP (Day 9) — DEMO VIDEO DAY:**
- ⬜ **Record all demo footage:**
  - Phone screen recording: login → scenarios → AR training (coordinate with P1+P2)
  - Desktop screen recording: dashboard (coordinate with P5)
  - Voiceover recording (P4 provides the voice, you record)
- ⬜ **Edit video in CapCut or similar:**
  - Assemble clips in order (see Part 21 scene list)
  - Add title card at start
  - Add voiceover audio
  - Add text labels/annotations where helpful
  - Export as 1080p MP4
- ⬜ Finalize Slide 2
- ⬜ **DELIVERABLE:** ✅ Demo video first cut ready, Slide 2 final

**8 SEP (Day 10):**
- ⬜ Finalize demo video (get team feedback, make final edits)
- ⬜ Create AR marker printable PDF (place Hiro marker image in a simple PDF with instructions)
- ⬜ Write README sections: "User Journey" (with flow description), "Target Users", "Screenshots" (embed screenshot images)
- ⬜ Final PPT review — all 6 slides consistent
- ⬜ **DELIVERABLE:** ✅ Demo video final, README sections complete, PPT reviewed

**9 SEP (Day 11):**
- ⬜ Upload to repo:
  - `demo/demo-video.mp4`
  - `demo/ar-marker-printable.pdf`
  - `demo/demo-script.md`
  - `ppt/SIH26041_Presentation.pptx`
  - All screenshots in `screenshots/`
- ⬜ **DELIVERABLE:** ✅ All media files in repo

**10 SEP (Day 12):**
- ⬜ Final check: demo video plays, PPT opens correctly, screenshots visible
- ⬜ Practice explaining: "I designed and styled all the app pages to be mobile-responsive. I also recorded and edited the demo video showing the complete user flow."
- ⬜ **DELIVERABLE:** ✅ Ready for submission

---

### 📁 Files/Modules Owned
```
app/index.html              ← Login page
app/register.html           ← Register page
app/scenarios.html          ← Scenario selection
app/training.html           ← AR training view
app/results.html            ← Score + feedback
app/css/styles.css          ← ALL styling
demo/                       ← ENTIRE demo folder
  demo-video.mp4
  demo-script.md
  ar-marker-printable.pdf
screenshots/                ← ALL screenshots
ppt/                        ← PPT file (you coordinate, everyone contributes their slide)
```

### Dependencies
- **You depend on:** P1 (AR content for training page + screenshots), P2 (scenario UI for screenshots), P5 (dashboard for screenshots)
- **Depends on you:** P1 (HTML pages they plug JS into), P2 (HTML structure they plug into)

### PPT
**SLIDE 2: Solution Overview & User Journey**
- Deadline: Sep 6 draft, Sep 7 final
- Definition of Done: Value proposition clear, user journey diagram present, 1-2 screenshots, consistent with other slides

### Demo Responsibility
- **Own the entire demo video** — record, edit, assemble, export
- Coordinate recording sessions with all team members
- Ensure video is clear, well-paced, and has voiceover

### Definition of Done (Overall)
✅ All 5 HTML pages styled and responsive
✅ App looks professional on mobile phones
✅ All screenshots captured
✅ Demo video complete with voiceover (3-4 minutes)
✅ PPT Slide 2 complete
✅ PPT design consistent across all 6 slides
✅ AR marker printable PDF created
✅ All media files uploaded to repo
