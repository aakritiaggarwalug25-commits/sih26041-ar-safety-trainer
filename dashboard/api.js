/**
 * SafeAR — Dashboard API Client
 * 
 * Communicates with the Express backend using bearer token authorization.
 */

const DashboardAPI = (() => {
    async function request(url, options = {}) {
        const token = DashboardAuth.getToken();
        if (!token) {
            throw new Error("Missing authentication token");
        }

        const headers = {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
            ...(options.headers || {})
        };

        const response = await fetch(url, { ...options, headers });

        if (response.status === 401) {
            alert("Session expired. Please log in again.");
            window.location.href = "../App/login.html";
            throw new Error("Session expired");
        }

        if (response.status === 403) {
            alert("Trainer authorization required for this action.");
            throw new Error("Forbidden");
        }

        if (!response.ok) {
            const errData = await response.json().catch(() => null);
            throw new Error((errData && errData.message) || `HTTP error ${response.status}`);
        }

        return await response.json();
    }

    async function getSummary() {
        return await request(API_ENDPOINTS.dashboardSummary);
    }

    async function getResults() {
        return await request(API_ENDPOINTS.results);
    }

    async function getUserResults(userId) {
        return await request(API_ENDPOINTS.userResults(userId));
    }

    return {
        getSummary,
        getResults,
        getUserResults
    };
})();
