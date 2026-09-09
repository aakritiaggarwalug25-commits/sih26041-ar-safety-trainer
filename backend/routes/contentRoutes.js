const express = require("express");
const content = require("../utils/content");

const router = express.Router();

/**
 * GET /api/content/modules
 *
 * Serves the SAME ar_safety_training_modules.json the frontend ships as a
 * static fallback (content/ar_safety_training_modules.json) — this endpoint
 * exists so a deployment can point CONTENT_URL at the backend instead of a
 * static file (e.g. to update training content without redeploying the
 * frontend). No auth required: training content is not sensitive user data.
 */
router.get("/modules", (req, res) => {
    try {
        res.json(content.load());
    } catch (error) {
        console.error("[content] Failed to load training content:", error);
        res.status(500).json({
            success: false,
            message: "Could not load training content"
        });
    }
});

module.exports = router;
