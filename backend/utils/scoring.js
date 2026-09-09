/**
 * Backend — scoring.js
 *
 * Shared by resultRoutes.js and dashboardRoutes.js so "how a module attempt's
 * score/rating is computed from its per-question events" exists in exactly
 * ONE place server-side. Mirrors App/js/engine/scoringManager.js's constants
 * (10 pts per CORRECT question, 90/70/50 rating bands) — duplicated across
 * the browser/Node boundary intentionally, since the two can't share one
 * module without a build step; keep them in sync if either changes.
 */
const POINTS_PER_QUESTION = 10;

function ratingFor(percentage) {
    if (percentage >= 90) return "Excellent";
    if (percentage >= 70) return "Good";
    if (percentage >= 50) return "Needs Improvement";
    return "Failed";
}

/** Group a flat list of per-question events into per-module-attempt
 *  summaries (one per session_id + module_id pair actually played). */
function groupIntoAttempts(events) {
    const groups = new Map();
    events.forEach(ev => {
        const key = (ev.session_id || "no-session") + "::" + ev.module_id;
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(ev);
    });

    return Array.from(groups.values()).map(groupEvents => {
        const maxScore = groupEvents.length * POINTS_PER_QUESTION;
        const score = groupEvents.reduce((sum, e) => sum + (e.result === "CORRECT" ? POINTS_PER_QUESTION : 0), 0);
        const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
        const sorted = [...groupEvents].sort((a, b) => new Date(a.event_timestamp) - new Date(b.event_timestamp));
        return {
            session_id: sorted[0].session_id,
            trainee_id: sorted[0].trainee_id,
            module_id: sorted[0].module_id,
            score,
            maxScore,
            percentage,
            rating: ratingFor(percentage),
            completedAt: sorted[sorted.length - 1].event_timestamp,
            events: sorted
        };
    }).sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
}

module.exports = { POINTS_PER_QUESTION, ratingFor, groupIntoAttempts };
