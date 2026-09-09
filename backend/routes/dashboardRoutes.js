const express = require("express");
const { db } = require("../config/firebase");
const { requireAuth, requireTrainer } = require("../middleware/authMiddleware");
const content = require("../utils/content");
const { groupIntoAttempts } = require("../utils/scoring");

const router = express.Router();

/**
 * GET /api/dashboard/summary
 *
 * Rebuilt around the real 3 modules / 30 questions instead of the old
 * hardcoded {ppe-check, fire-response, gas-leak} scenario ids. `results` now
 * holds raw per-question events (see resultRoutes.js), so this groups them
 * into module attempts (utils/scoring.js — the same grouping
 * GET /api/results/user/:userId uses) and returns both the KPI summary and
 * the full attempts list (with trainee names resolved) so the trainer
 * dashboard's table, charts, and modal can all render from one response.
 */
router.get("/summary", requireAuth, requireTrainer, async (req, res) => {
    try {
        const [usersSnapshot, resultsSnapshot] = await Promise.all([
            db.collection("users").get(),
            db.collection("results").get()
        ]);

        const users = usersSnapshot.docs.map(doc => doc.data());
        const userById = new Map(users.map(u => [u.uid, u]));
        const trainees = users.filter(u => (u.role || "trainee") === "trainee");

        const events = resultsSnapshot.docs.map(doc => doc.data());
        const attempts = groupIntoAttempts(events).map(a => {
            const user = userById.get(a.trainee_id);
            return {
                ...a,
                userName: (user && (user.name || user.email)) || "Trainee"
            };
        });

        const moduleIds = content.getModuleIds();
        const moduleStats = moduleIds.map(moduleId => {
            const mod = content.getModule(moduleId);
            const moduleAttempts = attempts.filter(a => a.module_id === moduleId);
            const averageScore = moduleAttempts.length
                ? Math.round(moduleAttempts.reduce((sum, a) => sum + a.percentage, 0) / moduleAttempts.length)
                : 0;
            return {
                module_id: moduleId,
                module_name: (mod && mod.module_name && mod.module_name.en) || moduleId,
                attempts: moduleAttempts.length,
                averageScore
            };
        });

        const averageScore = attempts.length
            ? Math.round(attempts.reduce((sum, a) => sum + a.percentage, 0) / attempts.length)
            : 0;
        const needsImprovementCount = attempts.filter(a => a.rating === "Needs Improvement" || a.rating === "Failed").length;

        res.json({
            success: true,
            summary: {
                totalTrainees: trainees.length,
                totalCompletions: attempts.length,
                averageScore,
                needsImprovementCount,
                moduleStats
            },
            attempts
        });
    } catch (error) {
        console.error("[dashboard] summary failed:", error);
        res.status(500).json({
            success: false,
            message: "Could not load dashboard summary"
        });
    }
});

module.exports = router;
