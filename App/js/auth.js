/**
 * Shared Auth Utilities — SAFEAR Frontend
 * 
 * Provides session management, token access, and auth guards.
 * Works with Firebase Auth REST API (no heavy SDK import needed).
 * 
 * Session data stored in sessionStorage:
 *   - safear_token   : Firebase ID token
 *   - safear_user    : JSON string of { uid, email, name, role }
 */

const SafeAuth = (() => {
    const TOKEN_KEY = "safear_token";
    const USER_KEY = "safear_user";

    /**
     * Store auth session after login (both sessionStorage and localStorage for tab resilience).
     */
    function saveSession(token, user) {
        try {
            sessionStorage.setItem(TOKEN_KEY, token);
            sessionStorage.setItem(USER_KEY, JSON.stringify(user));
        } catch (e) {}
        try {
            localStorage.setItem(TOKEN_KEY, token);
            localStorage.setItem(USER_KEY, JSON.stringify(user));
        } catch (e) {}
    }

    /**
     * Get the stored ID token. Returns null if not logged in.
     */
    function getToken() {
        return sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY) || null;
    }

    /**
     * Get the stored user object. Returns null if not logged in.
     */
    function getUser() {
        const raw = sessionStorage.getItem(USER_KEY) || localStorage.getItem(USER_KEY);
        if (!raw) return null;
        try { return JSON.parse(raw); }
        catch { return null; }
    }

    /**
     * Check if a user is currently logged in.
     */
    function isLoggedIn() {
        return !!getToken() && !!getUser();
    }

    /**
     * Clear session and redirect to login.
     */
    function logout() {
        try {
            sessionStorage.removeItem(TOKEN_KEY);
            sessionStorage.removeItem(USER_KEY);
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
        } catch (e) {}
        // Navigate to login — works from any depth
        const base = getBasePath();
        window.location.href = base + "login.html";
    }

    /**
     * Auth guard — call at top of protected pages.
     * Redirects to login if no valid session.
     * Optionally restricts to a specific role.
     */
    function requireAuth(requiredRole) {
        if (!isLoggedIn()) {
            const base = getBasePath();
            window.location.href = base + "login.html";
            return false;
        }
        if (requiredRole) {
            const user = getUser();
            const userRole = normalizeRole(user ? user.role : "");
            const targetRole = normalizeRole(requiredRole);
            if (userRole !== targetRole && userRole !== "admin") {
                alert("Access denied. This page requires " + requiredRole + " role.");
                const base = getBasePath();
                window.location.href = base + "login.html";
                return false;
            }
        }
        return true;
    }

    /**
     * Normalize role values from UI into backend-expected 'trainee' or 'trainer'.
     */
    function normalizeRole(role) {
        if (!role) return "trainee";
        const val = String(role).trim().toLowerCase();
        if (val.includes("trainer") || val.includes("instructor")) {
            return "trainer";
        }
        return "trainee";
    }

    /**
     * Login via backend API.
     * Returns { success, token, user, message, status }
     */
    async function login(email, password) {
        try {
            const resp = await fetch(API_BASE_URL + "/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            let data;
            try {
                data = await resp.json();
            } catch (e) {
                data = null;
            }

            if (!resp.ok) {
                console.warn(`[SafeAuth] Login failed with HTTP ${resp.status}:`, data);
                if (resp.status === 400) {
                    return {
                        success: false,
                        status: 400,
                        message: (data && data.message) || "Email and password are required."
                    };
                }
                if (resp.status === 401) {
                    return {
                        success: false,
                        status: 401,
                        message: (data && data.message) || "Invalid email or password."
                    };
                }
                if (resp.status === 403) {
                    return {
                        success: false,
                        status: 403,
                        message: (data && data.message) || "Access forbidden. Account may be restricted."
                    };
                }
                if (resp.status >= 500) {
                    return {
                        success: false,
                        status: resp.status,
                        message: (data && data.message) || "Server authentication error. Please try again later."
                    };
                }
                return {
                    success: false,
                    status: resp.status,
                    message: (data && data.message) || `Login failed (HTTP ${resp.status}).`
                };
            }

            if (data && data.success) {
                saveSession(data.token, data.user);
            }
            return data;
        } catch (err) {
            console.error("[SafeAuth] Network failure during login:", err);
            return {
                success: false,
                isNetworkError: true,
                message: `Connection failed to backend at ${API_BASE_URL}. Ensure the backend server is running and accessible.`
            };
        }
    }

    /**
     * Register via backend API.
     * Returns { success, user, message, status }
     */
    async function register(name, email, password, organization, role) {
        const mappedRole = normalizeRole(role);
        try {
            const resp = await fetch(API_BASE_URL + "/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password, organization, role: mappedRole })
            });

            let data;
            try {
                data = await resp.json();
            } catch (e) {
                data = null;
            }

            if (!resp.ok) {
                console.warn(`[SafeAuth] Registration failed with HTTP ${resp.status}:`, data);
                if (resp.status === 400) {
                    return {
                        success: false,
                        status: 400,
                        message: (data && data.message) || "Invalid registration information. Please check all fields."
                    };
                }
                if (resp.status === 409) {
                    return {
                        success: false,
                        status: 409,
                        message: (data && data.message) || "An account with this email already exists. Please sign in."
                    };
                }
                if (resp.status === 401 || resp.status === 403) {
                    return {
                        success: false,
                        status: resp.status,
                        message: (data && data.message) || "Registration authorization failed."
                    };
                }
                if (resp.status >= 500) {
                    return {
                        success: false,
                        status: resp.status,
                        message: (data && data.message) || "Server error occurred during registration. Please try again later."
                    };
                }
                return {
                    success: false,
                    status: resp.status,
                    message: (data && data.message) || `Registration failed (HTTP ${resp.status}).`
                };
            }

            return data;
        } catch (err) {
            console.error("[SafeAuth] Network failure during registration:", err);
            return {
                success: false,
                isNetworkError: true,
                message: `Connection failed to backend at ${API_BASE_URL}. Ensure the backend server is running and accessible.`
            };
        }
    }

    /**
     * Make an authenticated API request.
     * Automatically attaches the Bearer token.
     */
    async function authFetch(url, options = {}) {
        const token = getToken();
        if (!token) {
            throw new Error("Not authenticated");
        }
        const headers = {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token,
            ...(options.headers || {})
        };
        const resp = await fetch(url, { ...options, headers });
        if (resp.status === 401) {
            // Token expired or invalid — force re-login
            logout();
            throw new Error("Session expired");
        }
        return resp;
    }

    /**
     * Utility: resolve the base path to the App/ directory.
     * Works from App/, dashboard/, AR/ etc.
     */
    function getBasePath() {
        const path = window.location.pathname;
        if (path.includes("/dashboard/") || path.includes("/AR/")) {
            return "../App/";
        }
        // Already in App/
        return "";
    }

    return {
        saveSession,
        getToken,
        getUser,
        isLoggedIn,
        logout,
        requireAuth,
        login,
        register,
        authFetch,
        getBasePath
    };
})();
