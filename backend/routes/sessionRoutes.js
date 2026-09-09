const express = require("express");
const { admin, db } = require("../config/firebase");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * Sessions hold the logging_schema's session_level_fields (see
 * content/ar_safety_training_modules.json): session_id, trainee_id,
 * user_language_preference, session_start_timestamp, session_end_timestamp,
 * module_sequence. trainee_id always comes from the verified auth token,
 * never trusted from the request body, to stop one trainee writing into
 * another's session.
 */

// POST /api/sessions — create/upsert a session. LoggingService.logSessionStart()
// calls this at the start of every training.html load, so it must be
// idempotent (set with merge) rather than erroring on a repeat session_id.
router.post("/", requireAuth, async (req, res) => {
    try {
        const { session_id, user_language_preference, session_start_timestamp, module_sequence } = req.body;

        if (!session_id) {
            return res.status(400).json({ success: false, message: "session_id is required" });
        }
        if (user_language_preference && !["en", "hi"].includes(user_language_preference)) {
            return res.status(400).json({ success: false, message: "user_language_preference must be 'en' or 'hi'" });
        }

        await db.collection("sessions").doc(session_id).set({
            session_id,
            trainee_id: req.user.uid,
            user_language_preference: user_language_preference || "en",
            session_start_timestamp: session_start_timestamp || new Date().toISOString(),
            session_end_timestamp: null,
            module_sequence: Array.isArray(module_sequence) ? module_sequence : [],
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        res.status(201).json({ success: true, message: "Session recorded" });
    } catch (error) {
        console.error("[sessions] create failed:", error);
        res.status(500).json({ success: false, message: "Could not record session" });
    }
});

// PATCH /api/sessions/:id — record session end + final module_sequence.
router.patch("/:id", requireAuth, async (req, res) => {
    try {
        const ref = db.collection("sessions").doc(req.params.id);
        const doc = await ref.get();

        if (!doc.exists) {
            return res.status(404).json({ success: false, message: "Session not found" });
        }
        if (doc.data().trainee_id !== req.user.uid) {
            return res.status(403).json({ success: false, message: "Cannot modify another trainee's session" });
        }

        const { session_end_timestamp, module_sequence } = req.body;
        await ref.set({
            session_end_timestamp: session_end_timestamp || new Date().toISOString(),
            ...(Array.isArray(module_sequence) ? { module_sequence } : {}),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        res.json({ success: true, message: "Session updated" });
    } catch (error) {
        console.error("[sessions] update failed:", error);
        res.status(500).json({ success: false, message: "Could not update session" });
    }
});

module.exports = router;
