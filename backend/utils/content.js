/**
 * Backend — content.js
 *
 * Server-side mirror of the frontend's ScenarioEngine, over the SAME single
 * source of truth (content/ar_safety_training_modules.json) — never a
 * separately-maintained copy of module/question ids. Used to:
 *   1. serve GET /api/content/modules (so the frontend's CONTENT_URL can
 *      point at the backend instead of a static file), and
 *   2. validate incoming module_id/question_id pairs in resultRoutes.js,
 *      replacing the old hardcoded 3-scenario allowlist.
 */
const fs = require("fs");
const path = require("path");

const CONTENT_PATH = path.join(__dirname, "..", "..", "content", "ar_safety_training_modules.json");

let cached = null;

function load() {
    if (cached) return cached;
    const raw = fs.readFileSync(CONTENT_PATH, "utf8");
    cached = JSON.parse(raw);
    return cached;
}

function getModuleIds() {
    return load().modules.map(m => m.module_id);
}

function getModule(moduleId) {
    return load().modules.find(m => m.module_id === moduleId) || null;
}

/** True if questionId is one of moduleId's real items — the JSON-driven
 *  replacement for the old `allowedScenarios` hardcoded array. */
function isValidQuestion(moduleId, questionId) {
    const mod = getModule(moduleId);
    if (!mod) return false;
    return (mod.items || []).some(q => q.question_id === questionId);
}

module.exports = { load, getModuleIds, getModule, isValidQuestion };
