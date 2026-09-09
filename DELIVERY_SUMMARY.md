# SafeAR — Industrial Safety Training Simulator — Delivery Summary

A web-only rebuild of the SIH AR Safety Training Simulator. `content/ar_safety_training_modules.json`
is the single source of truth for all 30 training scenarios across 3 modules; nothing about a
scenario (its hazard, its required action, its feedback text) is hardcoded anywhere in the app.

## Latest update: real WebXR AR + realistic question timing

This update is a targeted MODIFICATION of the existing project above (not a rebuild) fixing two
specific problems:

1. **AR never actually started.** The app only ever called `navigator.xr.isSessionSupported()` —
   a support *check* — and then showed an "AR Mode" badge based on that check alone; nothing ever
   called `requestSession("immersive-ar", ...)`, so real devices always silently ended up in
   Simulation Mode regardless of what the badge said. `App/js/engine/arManager.js` now actually
   starts a real immersive-ar session (via A-Frame's `enterAR()`, which performs the real
   `requestSession` call) from an explicit "Start AR Training" button, implements real WebXR
   hit-test with a placement reticle, and only ever reports "AR Mode" once that session has
   genuinely started. See "Architecture" and "What changed in this update" below for the detail.
2. **Question timers were far too short.** `ScenarioEngine.getTimeLimitSeconds()` was parsing the
   question's in-story countdown text and handing that number to the real evaluation timeout —
   as little as 2-3 seconds for some questions. It now uses realistic per-interaction-type budgets
   (60-120s) instead; see "What changed in this update" for the full reasoning and numbers.

## Screen flow

Landing (`index.html`) → Login/Register → Language Selection (`language.html`, session-level,
en/hi, asked once) → Module Selection (`scenarios.html`) → Camera Permission / AR Prep →
Environment Scan → Environment Confirm → Scenario/Hazard loop (10 questions per module) →
Feedback per question → Module Completion + Score → session data saved to the backend →
Results (`results.html`) / Trainer Dashboard (`dashboard/dashboard.html`).

## Architecture

One scenario system, driven entirely by data:

```
ar_safety_training_modules.json
        │
        ▼
  ScenarioEngine  (loads/validates JSON, resolves module/question lookups)
        │
        ├──► InteractionConfigs (hand-authored bridge: question_id → InteractionEngine primitive + target/zone ids)
        ├──► Scene Builders (App/js/scenes/*.js — one hand-composed 3D visual per question_id)
        ├──► InteractionEngine (TAP / TAP_HOLD / DRAG / DRAG_MULTI / ROTATE / SWIPE / PHYSICAL_MOVE / COMPOSITE)
        ├──► EvaluationEngine (CORRECT / INCORRECT / TIMEOUT)
        ├──► ScoringManager (10 pts/question, rating bands)
        └──► LoggingService → backend → Firestore (sessions + results)
```

`ARManager` renders ONE A-Frame scene shared by both paths: a REAL WebXR `immersive-ar` session,
started only on an explicit "Start AR Training" button press, where the browser/device supports
it; and an always-available orbit-able 3D Simulation Mode everywhere else (including whenever the
trainee picks "Use Simulation", AR isn't supported, or an AR session ends/errors mid-training). The
same scene-builder function populates the same `#hazardRoot` entity in both modes — a trainee gets
an identical training experience whether or not real AR is available, which was the explicit scope
decision for this project (WebXR is a bonus, Simulation Mode is the reliable default path). Once in
AR, real WebXR hit-test drives a placement reticle onto detected real-world surfaces; the trainee
taps the surface (the session's native "select" input) to anchor the hazard there for the rest of
that module's questions. If hit-test itself isn't available, an explicit "Place Here Manually"
button anchors the hazard a fixed distance in front of the trainee's current view instead — the
documented fallback from the JSON's own `technical_dependencies` table (TD02/TD04/TD05's "floating
marker" degradation), never silently presented as if it were real surface detection.

`InteractionEngine` renders its controls as a separate DOM overlay panel, never as part of the 3D
scene — so the 30 hand-tuned scene builders are pure visual/thematic content and never need to
expose hookup ids for tap/drag/rotate logic.

`hazard_type` and `action_type` are carried through logging exactly as internal codes (per the
JSON's `logging_schema`) and are never rendered to a trainee or trainer — only human-readable
`scenario_title` / `module_name` / feedback text ever reach the screen.

## What changed in this update

**`App/js/engine/arManager.js` (rewritten, same public API plus new methods):**
`ensureScene()`/`renderScene()`/`clearRoot()`/`destroy()` behave exactly as before (scene builders
are completely untouched). New: `enterAR(overlayEl, callbacks)` actually calls A-Frame's
`sceneEl.enterAR()` (which performs the real `navigator.xr.requestSession("immersive-ar", ...)`)
from a genuine user-activation click, wires the session's native `select` (tap-to-place) and `end`
events, and only resolves once the session is genuinely live. A per-frame A-Frame tick component
polls `XRFrame.getHitTestResults()` against a `viewer`-space hit-test source, drives a visible
placement reticle, and caches the live viewer pose for the manual-placement fallback.
`placeManually()` implements that fallback for real, computed from the session's own live viewer
pose (not a static pre-session coordinate, unlike before). `exitAR()` ends the session and returns
its own promise so callers can wait for it before tearing down any DOM. `vr-mode-ui` is now
disabled (A-Frame's own corner AR button no longer appears) since the "Start AR Training" button is
the one deliberate way in, and `webxr`'s `optionalFeatures` now actually includes `dom-overlay`
alongside `hit-test`.

**`App/js/training.js`:** the environment-confirm screen now shows two honest, distinct states —
"AR Ready" (with a Camera/WebXR/Environment checklist and both `Start AR Training` and
`Use Simulation` buttons) when `isSessionSupported()` returned true, or "AR Not Available On This
Device" (one `Continue In Simulation` button) when it didn't — never a badge implying AR is already
active. `#trainingOverlay` is a new element wrapping the mode/timer HUD, the AR placement UI, the
hazard description/instruction, and the interaction panel — it doubles as the actual WebXR
dom-overlay root, since a real immersive session only ever composites that one designated DOM
subtree over the camera feed (anything outside it would be invisible/unusable mid-session). New
functions handle the full AR lifecycle: `startARTrainingFlow()`, the placement-search UI
(`renderArSearchingState`/`updateArSearchStatus`/`hideArPlacementUI`), a session-ended handler that
resumes the SAME in-progress question in Simulation Mode rather than losing progress
(`handleArSessionEnded`), and an error handler that surfaces a brief notice before falling back
(`handleArError`). `finishModule()` now ends any still-active AR session before tearing down the
scene/overlay DOM, instead of doing both at once.

**`App/js/engine/scenarioEngine.js`:** `getTimeLimitSeconds(question, interactionConfig, fallback)`
now takes the question's assigned `InteractionEngine` primitive (from `INTERACTION_CONFIGS`) and
looks up a realistic UX time budget — how long a trainee actually needs to read the scenario, find
the right object, and perform the gesture on a touchscreen or mouse — rather than parsing it out of
the question's in-story countdown text:

| Interaction type | New time limit |
|---|---|
| Simple Tap / Tap-and-Hold | 60s |
| Drag / Swipe | 75s |
| Rotate (incl. AR placement-style gestures) | 90s |
| Multi-step (COMPOSITE), multi-object (DRAG_MULTI), Physical Movement | 120s |

A genuinely longer JSON-stated window is still never overridden downward (`Math.max` against the
old text-parsed value) — none of the current 30 questions need this, but a future scenario
legitimately requiring more time won't be capped below its own number. The narrative countdown text
itself (e.g. "before the dust flashes") is untouched in the JSON and still shown to the trainee as
scenario flavor — only the real functional timeout changed.

**`App/css/scenario.css`:** new styles for the AR-ready/not-available cards and checklist, the
`#trainingOverlay` layout (top status row, centered placement hint, bottom instruction/controls
panel with the middle left transparent so the hazard/camera view stays clear), and the placement
search/error status pills. The old `.hazard-stage-hud` rule (superseded by `.training-overlay`) was
removed rather than left dead. `.hazard-stage` is taller (520px vs. 340px) for a more immersive,
camera-viewport feel.

**`App/js/engine/i18n.js`:** added the new English/Hindi chrome strings the above needed (AR ready
title, checklist items, button labels, placement-search status, error notice) — no structural
change, no existing key touched.

**Tests:** `tests/engine.test.js` gained a full "ScenarioEngine timing" suite asserting the correct
new time limit for every one of the 30 questions across every interaction primitive (46 total
assertions now pass, up from 13). New `tests/arManager.test.js` verifies, against a fake DOM, that
`ensureScene()` requests `hit-test`+`dom-overlay`+`#trainingOverlay` correctly, that `getMode()`
never starts as `"ar"`, and that `enterAR()` rejects cleanly (never hangs, never falsely reports
success) when `navigator.xr` or `sceneEl.enterAR` is unavailable — see that file's own header
comment for exactly what it does and does not verify.

## What was rebuilt from scratch (prior work, preserved this update)

- **Content pipeline**: `ScenarioEngine`, `InteractionConfigs` (the hand-authored primitive/target
  mapping for all 30 questions), and 30 individual 3D scene-builder functions across
  `App/js/scenes/mod01.js` / `mod02.js` / `mod03.js`, sharing a `props.js` helper library (flame,
  smoke, pile, gauge dial, tape barrier, hanging load, etc).
- **Engines**: `SessionManager`, `EvaluationEngine`, `ScoringManager`, `LoggingService`,
  `EnvironmentManager`, `ARManager`, `InteractionEngine`, `I18n`.
- **Frontend screens**: `language.html` (new), `scenarios.html`, `training.html` +
  `App/js/training.js` (new, the full camera-prep → scan → confirm → question-loop → completion
  state machine), `results.html`, plus copy/script fixes across `login.html`/`register.html`.
- **Backend**: `backend/utils/content.js` (JSON-driven validation replacing a hardcoded scenario
  allowlist), `backend/utils/scoring.js` (shared scoring/grouping logic), new
  `contentRoutes.js` / `sessionRoutes.js`, and a rewritten `resultRoutes.js` /
  `dashboardRoutes.js` matching the new per-question event schema.
- **Dashboard**: restyled onto the same dark design tokens as the trainee app, regrouped around
  the real 3 modules (30 questions) instead of the old hardcoded 3-scenario set, and rewired to
  the new `/api/dashboard/summary` response shape.

## What was reused from the original codebase (`SIH26041_Latest1.zip`)

Firebase Auth (client + `firebase-admin` on the backend), the Express server skeleton and
middleware, the overall dashboard page structure/Chart.js setup, and the visual design language
(dark theme, card layout, button styles) — extended rather than replaced.

## What was removed

- The old marker-based AR path and its hardcoded scenario allowlist.
- The old hardcoded `{ppe-check, fire-response, gas-leak}` 3-scenario dashboard mapping.
- An orphaned `fire-extinguisher-*.glb` 3D model asset and its preload in `ARManager` — it was
  being fetched into every scene's `<a-assets>` block but was never actually referenced by any of
  the 30 scene builders (all of which use procedural A-Frame primitives, not glb models). Removed
  the dead preload and the unused asset file, and fixed a stale landing-page caption that
  referenced it.
- An empty leftover `App/js/screens/` directory.

## Real bugs found and fixed during end-to-end testing

Both of these were caught only by driving the full 30-question flow in an actual browser
(Playwright + headless Chromium) — a fake-DOM Node test alone wouldn't have surfaced either one:

1. **Drag-and-drop hit detection was broken for every DRAG/DRAG_MULTI question (12 of the 30).**
   `.drag-object` is positioned in CSS via `bottom: 12px`. When a drag starts, `InteractionEngine`
   sets an explicit `top` inline style to move the element — but never cleared `bottom`. An
   absolutely-positioned, auto-height box with *both* `top` and `bottom` set stretches to fill the
   gap between them, which silently inflated the dragged object's height (in one measured case,
   40px → 133px) and threw off the drop-zone hit test, so a perfectly-placed drag would frequently
   register as a miss. Fixed in `App/js/engine/interactionEngine.js` by clearing `style.bottom`
   at drag-start in both `renderDrag()` and `renderDragMulti()`.

2. **6 of the 30 questions had an unwinnable countdown timer (fixed initially, then superseded —
   see below).** The original `ScenarioEngine.getTimeLimitSeconds()` parsed the overall countdown
   out of each question's free-text `interaction` field (e.g. "... before an 8-second spark timer
   ends"), but several of those sentences also mention a shorter sub-duration earlier on (e.g.
   "tap-and-hold ... for 3 seconds"). The parser was taking the *first* number-of-seconds it found
   instead of the countdown that actually applies, handing out timers as short as 2–3 seconds for
   actions that themselves require a 2–3 second hold — leaving the trainee zero reaction time. That
   first fix (take the *last* "N second(s)" match instead of the first) shipped in the prior round
   and made every timer internally consistent with its own in-story sentence — but on review, even
   the *correct* in-story number was still unrealistically short as a real UX timeout for a
   touchscreen gesture. That's why this update replaced the mechanism entirely with the fixed
   per-primitive budgets described in "What changed in this update" above (60–120s); the old
   text-parsed "last match" value is now only ever consulted as a `Math.max()` floor, never the
   primary source — so this specific bug is moot rather than merely fixed.

## What's incomplete / could not be verified in this sandbox

- **`npm install` in `backend/` has never been run against a live registry.** This sandbox blocks
  `registry.npmjs.org` (confirmed via repeated 403s), so Express/`firebase-admin` were never
  actually installed here. Every backend file passed `node --check` (syntax) and had its pure
  logic (content validation, scoring, grouping) verified in isolation with plain Node scripts —
  but the server has never been started end-to-end against a real Firestore instance. Run
  `npm install` yourself in an environment with normal internet access before first use.
- **Real WebXR AR sessions were never verified on physical hardware — this is the single biggest
  remaining gap, and it cannot be closed in this sandbox.** No headless environment (headless
  Chromium included) can grant a real immersive-ar session, so `enterAR()` actually starting a
  session, real camera passthrough, real hit-test results against a real surface, the "select"
  tap-to-place gesture, and the WebXR dom-overlay actually compositing `#trainingOverlay` over the
  camera feed are all UNTESTED beyond code review here. What WAS verified without a physical device:
  the session-lifecycle/hit-test code compiles and runs its structural logic correctly
  (`tests/arManager.test.js`), the `webxr` component now genuinely requests `hit-test` +
  `dom-overlay` + points at a `#trainingOverlay` that actually exists (previously requested neither
  explicitly and pointed at an element that didn't exist), `enterAR()` rejects cleanly rather than
  hanging or falsely reporting success when `navigator.xr`/`enterAR()` aren't available (the exact
  situation on this sandbox's own headless Chromium, and on any desktop browser without AR
  hardware — confirmed via a live Playwright run: the "AR Not Available" card renders, the mode
  badge never claims "AR Mode" without a real session, and Simulation Mode completes all 30
  questions normally). **You must test on a real ARCore-certified Android + Chrome device over
  HTTPS before relying on the AR path** — see "How to test WebAR" below for exactly what to check.
  Real WebXR AR mode uses A-Frame's own `enterAR()`/`webxr` component plumbing under real
  navigator.xr calls, which is standard, but the hit-test/reticle/placement code layered on top of
  it is new and specifically needs that physical-device pass.
- **`aframe.io`'s CDN is also blocked in this sandbox**, so no screenshot in this environment ever
  showed real 3D geometry (A-Frame's custom elements degrade to plain, invisible `<a-entity>`
  tags with no library loaded) — this is a sandbox networking limitation, not a code defect. All
  30 scene-builder functions were verified to execute without throwing against a fake DOM
  (`tests/content-consistency.test.js`), and the interaction/scoring/timer logic around them was
  verified in a real browser — only the actual 3D rendering itself is unverified here. It will
  load normally for you since `App/training.html` pulls A-Frame from a public CDN with normal
  internet access.

## How to run it

```
cd backend
npm install
cp .env.example .env   # or keep the existing .env — see note below
node server.js         # serves the API on the port in .env (default 3000)
```

Then serve `App/` and `dashboard/` as static files (any static server works — e.g.
`npx serve .` from the project root, or point an existing web server at it) and open
`App/index.html`.

**Note on `backend/.env`:** this project's `.env` (carrying over from the original zip) already
contains live Firebase Admin credentials for an existing Firebase project, so the backend will
run as-is without any setup. Because it's a real private key, treat it carefully — it's already
listed in `.gitignore` so it won't get committed, but avoid sharing this zip outside your own
hands, and rotate the service-account key in the Firebase console if it ever does leak.

## How to test it

- `node tests/content-consistency.test.js` — checks the JSON's 30 questions, `InteractionConfigs`,
  and the 30 scene builders are all in lockstep (no missing/typo'd/duplicate `question_id`s), and
  that every scene builder runs without throwing.
- `node tests/engine.test.js` — pure-logic checks for `EvaluationEngine`, `ScoringManager`, `I18n`,
  and (new) `ScenarioEngine`'s per-primitive question timing across all 30 questions.
- `node tests/arManager.test.js` — structural/defensive checks for the AR session code (see its
  header for exactly what is and isn't covered without a physical device).
- Manually (Simulation Mode): open `App/index.html`, register/login, pick a language, start any
  module, and step through all 10 questions — this requires no camera and works in any modern
  desktop or mobile browser with internet access (for the A-Frame CDN).

### How to test WebAR (requires a physical device — see below)

Real `immersive-ar` sessions require a compatible phone, a compatible browser, and HTTPS (or
`localhost` over plain HTTP, which most browsers treat as a secure context for testing) — a normal
desktop browser will correctly show "AR Not Available On This Device" and that is expected, not a
bug. To actually test the AR path:

1. Serve the app over HTTPS (or tunnel it, e.g. `ngrok`) and open it in **Chrome on an
   ARCore-certified Android device**.
2. Go through camera prep and reach the environment-confirm screen — you should see the "AR Ready"
   card with its Camera/WebXR/Environment checklist, not the "AR Not Available" card.
3. Tap **Start AR Training** — the browser should prompt for camera/AR permission, then hand off to
   a real full-screen camera view. The mode badge should now say **AR Mode** (never before this
   point).
4. Move the phone slowly over a flat, well-lit real surface — a placement reticle should appear
   once a surface is detected (real WebXR hit-test). If it never appears after a few seconds,
   confirm the "Place Here Manually" fallback button still works.
5. Tap the detected surface (or the manual button) — the current question's hazard scene should
   appear anchored there, and the interaction controls at the bottom of the screen should remain
   visible and usable (this is the WebXR dom-overlay working correctly).
6. Complete a few questions, confirming the hazard stays anchored in the same real-world spot
   across questions within the module.
7. Exit AR mid-module via the device's own back gesture/button (not our "Exit AR" button) and
   confirm the app falls back to Simulation Mode on the SAME question rather than getting stuck on
   an "AR Mode" badge or losing progress.
8. Repeat step 7 using the in-app "Exit AR" button, and separately, force-deny the camera/AR
   permission prompt in step 3 to confirm the app shows a brief error notice and falls back to
   Simulation Mode rather than hanging.

## Required environment variables (`backend/.env`)

`PORT`, `NODE_ENV`, `FIREBASE_API_KEY`, `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`,
`FIREBASE_PRIVATE_KEY` — all already populated in the existing `.env`; see `.env.example` for the
shape if you ever need to point this at a different Firebase project. Nothing new was added by
this update.

## Browser / device limitations

Simulation Mode works in any modern desktop or mobile browser. Real WebXR AR mode is currently
only broadly available on ARCore-certified Android devices in Chrome — Safari/iOS and most
desktop browsers will correctly and automatically show "AR Not Available On This Device" and use
Simulation Mode instead, which is by design, not a bug to fix.
