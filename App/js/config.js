/**
 * SafeAR — Frontend Application Configuration
 *
 * Single source of truth for the backend API base URL and the location of
 * the canonical training content (ar_safety_training_modules.json).
 *
 * NOTE: Firebase Auth is handled entirely server-side (backend/routes/authRoutes.js
 * calls the Identity Toolkit REST API and Firebase Admin SDK). The frontend never
 * loads the Firebase JS SDK and never needs a Firebase client config object here —
 * it only ever talks to our own backend.
 */

// Backend API base URL — dynamically adapts to 127.0.0.1 vs localhost vs a real deployed host.
// Set window.SAFEAR_API_URL before this script loads to override explicitly in production.
const API_BASE_URL = (() => {
    if (typeof window !== "undefined" && window.SAFEAR_API_URL) {
        return window.SAFEAR_API_URL;
    }
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

// Where the trainee app fetches the canonical scenario content from.
// Served either as a static file next to the app, or via the backend's
// GET /api/content/modules endpoint (both return the same JSON shape).
const CONTENT_URL = (() => {
    if (typeof window !== "undefined" && window.SAFEAR_CONTENT_URL) {
        return window.SAFEAR_CONTENT_URL;
    }
    return API_BASE_URL + "/api/content/modules";
})();

// Session-level language preference storage key (shared across all engine modules).
const LANG_STORAGE_KEY = "safear_language";
