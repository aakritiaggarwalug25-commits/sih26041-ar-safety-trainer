const express = require("express");
const { admin, db } = require("../config/firebase");
const { requireAuth, requireTrainer } = require("../middleware/authMiddleware");
const content = require("../utils/content");
const { groupIntoAttempts } = require("../utils/scoring");

const router = express.Router();

const VALID_RESULTS = ["CORRECT", "INCORRECT", "TIMEOUT"];

/**
 * POST /api/results
 *
 * Logs ONE per-question event, matching ar_safety_training_modules.json's
 * logging_schema.per_question_event_fields exactly: module_id, question_id,
 * hazard_type, action_type, environment_detected, attempt_count,
 * time_taken_ms, result, event_timestamp — plus session_id and trainee_id
 * for later aggregation. This replaces the old hardcoded 3-scenario
 * allowlist ({ppe-check, fire-response, gas-leak}) with real JSON-driven
 * validation against the 30 actual question_ids.
 */
router.post("/", requireAuth, async (req, res) => {
    try {
        const {
            session_id,
            module_id,
            question_id,
            hazard_type,
            action_type,
            environment_detected,
            attempt_count,
            time_taken_ms,
            result,
            event_timestamp
        } = req.body;

        if (!module_id || !question_id) {
            return res.status(400).json({ success: false, message: "module_id and question_id are required" });
        }
        if (!content.isValidQuestion(module_id, question_id)) {
            return res.status(400).json({ success: false, message: `Unknown module_id/question_id: ${module_id}/${question_id}` });
        }
        if (!VALID_RESULTS.includes(result)) {
            return res.status(400).json({ success: false, message: "result must be one of " + VALID_RESULTS.join(", ") });
        }

        const eventRef = db.collection("results").doc();
        const event = {
            id: eventRef.id,
            session_id: session_id || null,
            trainee_id: req.user.uid, // always the verified token's uid, never client-supplied
            module_id,
            question_id,
            hazard_type: hazard_type || null,
            action_type: action_type || null,
            environment_detected: environment_detected || null,
            attempt_count: Number(attempt_count || 0),
            time_taken_ms: Number(time_taken_ms || 0),
            result,
            event_timestamp: event_timestamp || new Date().toISOString(),
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        };

        await eventRef.set(event);

        res.status(201).json({ success: true, message: "Event logged", event });
    } catch (error) {
        console.error("[results] log event failed:", error);
        res.status(500).json({ success: false, message: "Could not log event" });
    }
});

// GET /api/results/user/:userId — a trainee's own results, or any trainee's
// results if requested by a trainer. Returns module-attempt summaries (see
// groupIntoAttempts) rather than raw events, matching what App/results.html
// renders.
router.get("/user/:userId", requireAuth, async (req, res) => {
    try {
        const requestedUserId = req.params.userId;

        const currentUserDoc = await db.collection("users").doc(req.user.uid).get();
        const currentUser = currentUserDoc.exists ? currentUserDoc.data() : {};

        if (currentUser.role !== "trainer" && currentUser.role !== "admin" && req.user.uid !== requestedUserId) {
            return res.status(403).json({ success: false, message: "You can only view your own results" });
        }

        const snapshot = await db.collection("results")
            .where("trainee_id", "==", requestedUserId)
            .get();

        const events = snapshot.docs.map(doc => doc.data());
        const results = groupIntoAttempts(events);

        res.json({ success: true, count: results.length, results });
    } catch (error) {
        console.error("[results] fetch user results failed:", error);
        res.status(500).json({ success: false, message: "Could not fetch user results" });
    }
});

// GET /api/results — trainer-only, all raw per-question events (dashboard
// does its own module/hazard_category grouping — see dashboardRoutes.js).
router.get("/", requireAuth, requireTrainer, async (req, res) => {
    try {
        const snapshot = await db.collection("results")
            .orderBy("createdAt", "desc")
            .get();

        const events = snapshot.docs.map(doc => doc.data());

        res.json({ success: true, count: events.length, results: events });
    } catch (error) {
        console.error("[results] fetch all results failed:", error);
        res.status(500).json({ success: false, message: "Could not fetch results" });
    }
});

module.exports = router;
