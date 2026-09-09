/**
 * SafeAR — Trainer Dashboard Configuration
 * 
 * Single source of truth for API base URL and dashboard constants.
 * Supports both local development and production deployments.
 */

// Single source of truth for API base URL — dynamically adapts to 127.0.0.1 vs localhost
const API_BASE_URL = (() => {
    // 1. Explicit production override if configured
    if (typeof window !== "undefined" && window.SAFEAR_API_URL) {
        return window.SAFEAR_API_URL;
    }
    // 2. Dynamic host detection for local dev
    if (typeof window !== "undefined" && window.location) {
        if (window.location.hostname === "127.0.0.1") {
            return "http://127.0.0.1:3000";
        }
        if (window.location.hostname === "localhost") {
            return "http://localhost:3000";
        }
        if (window.location.hostname) {
            return `${window.location.protocol}//${window.location.hostname}:3000`;
        }
    }
    return "http://localhost:3000";
})();

// ===== API Endpoints =====
const API_ENDPOINTS = {
    results: `${API_BASE_URL}/api/results`,
    userResults: (userId) => `${API_BASE_URL}/api/results/user/${userId}`,
    dashboardSummary: `${API_BASE_URL}/api/dashboard/summary`,
};

// Same single source of truth the trainee App reads training content from
// (App/js/engine/scenarioEngine.js expects this global) — the dashboard
// loads it too, so it can resolve module_id/question_id to real names
// instead of showing raw internal codes.
const CONTENT_URL = (typeof window !== "undefined" && window.SAFEAR_CONTENT_URL) || `${API_BASE_URL}/api/content/modules`;

// ===== Dashboard Constants =====
// Official SIH26041 rating boundaries:
// >=90% = Excellent, >=70% = Good, >=50% = Needs Improvement, <50% = Failed
const PASS_THRESHOLD = 50; // Minimum passing percentage

// ===== Feature Flags =====
// In MVP production, real API data is mandatory.
const USE_MOCK_DATA = false;
