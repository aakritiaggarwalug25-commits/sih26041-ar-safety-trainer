/**
 * SafeAR — Trainer Dashboard Authentication & Route Guard
 * 
 * Verifies that the current user has the 'trainer' role
 * before permitting dashboard access. Uses the shared SafeAuth session.
 */

const DashboardAuth = (() => {
    function getTrainer() {
        if (typeof SafeAuth !== "undefined") {
            return SafeAuth.getUser();
        }
        try {
            const raw = sessionStorage.getItem("safear_user") || localStorage.getItem("safear_user");
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    }

    function getToken() {
        if (typeof SafeAuth !== "undefined") {
            return SafeAuth.getToken();
        }
        return sessionStorage.getItem("safear_token") || localStorage.getItem("safear_token") || null;
    }

    function requireTrainerAuth() {
        const token = getToken();
        const user = getTrainer();

        if (!token || !user) {
            console.warn("[DashboardAuth] No active session. Redirecting to login.");
            window.location.href = "../App/login.html";
            return false;
        }

        const role = (user.role || "").trim().toLowerCase();
        if (role !== "trainer" && role !== "admin") {
            alert("Access denied: The Trainer Dashboard requires a Trainer account. Redirecting to Trainee Scenarios.");
            window.location.href = "../App/scenarios.html";
            return false;
        }

        // Display trainer name in header
        const trainerNameEl = document.getElementById("trainerName");
        if (trainerNameEl) {
            trainerNameEl.textContent = user.name || user.email || "Trainer";
        }

        // Setup logout button
        const btnLogout = document.getElementById("btnLogout");
        if (btnLogout) {
            btnLogout.addEventListener("click", () => {
                if (typeof SafeAuth !== "undefined") {
                    SafeAuth.logout();
                } else {
                    sessionStorage.removeItem("safear_token");
                    sessionStorage.removeItem("safear_user");
                    localStorage.removeItem("safear_token");
                    localStorage.removeItem("safear_user");
                    window.location.href = "../App/login.html";
                }
            });
        }

        return true;
    }

    return {
        getTrainer,
        getToken,
        requireTrainerAuth
    };
})();
