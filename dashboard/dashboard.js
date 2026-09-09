/**
 * SafeAR — Trainer Dashboard Controller
 *
 * Orchestrates real data fetching, summary KPI computation, module filtering,
 * results table rendering, and trainee performance history modals — grouped
 * by the 3 real hazard modules (30 question_ids) from
 * content/ar_safety_training_modules.json, not the old hardcoded
 * {ppe-check, fire-response, gas-leak} 3-scenario set.
 *
 * GET /api/dashboard/summary now returns both the KPI summary AND a full
 * `attempts` array (one row per module run, each with its raw per-question
 * `events`) — so this single fetch drives the cards, charts, and table.
 */

const DashboardController = (() => {
    let allAttempts = [];
    let dashboardSummary = null;

    async function init() {
        if (!DashboardAuth.requireTrainerAuth()) {
            return;
        }

        try {
            await ScenarioEngine.load();
            await loadDashboardData();
            setupFilter();
        } catch (err) {
            console.error("[DashboardController] Failed to initialize dashboard:", err);
            renderTableError("Failed to connect to backend server. Please verify backend is running on port 3000.");
        }
    }

    async function loadDashboardData() {
        renderTableLoading();

        try {
            const summaryData = await DashboardAPI.getSummary();

            dashboardSummary = summaryData.summary || {};
            allAttempts = summaryData.attempts || [];

            updateSummaryCards(dashboardSummary);
            DashboardCharts.renderAll(dashboardSummary, allAttempts);
            renderTable(allAttempts);

        } catch (err) {
            console.error("[DashboardController] Data loading error:", err);
            renderTableError("Error loading training data: " + err.message);
        }
    }

    function moduleName(moduleId) {
        const mod = ScenarioEngine.getModule ? ScenarioEngine.getModule(moduleId) : null;
        return (mod && mod.module_name && mod.module_name.en) || moduleId || "Assessment";
    }

    function updateSummaryCards(summary) {
        const totalTraineesEl = document.getElementById("totalTrainees");
        if (totalTraineesEl) totalTraineesEl.textContent = summary.totalTrainees || 0;

        const avgScoreEl = document.getElementById("avgScore");
        if (avgScoreEl) avgScoreEl.textContent = (summary.averageScore || 0) + "%";

        const completedEl = document.getElementById("scenariosCompleted");
        if (completedEl) completedEl.textContent = summary.totalCompletions || 0;

        const improvementEl = document.getElementById("needsImprovement");
        if (improvementEl) improvementEl.textContent = summary.needsImprovementCount || 0;
    }

    function setupFilter() {
        const select = document.getElementById("scenarioFilter");
        if (!select) return;

        const modules = ScenarioEngine.getModuleSummaries();
        select.innerHTML = `
            <option value="all">All Modules</option>
            ${modules.map(m => `<option value="${m.module_id}">${escapeHtml((m.module_name && m.module_name.en) || m.module_id)}</option>`).join("")}
        `;

        select.addEventListener("change", () => {
            const val = select.value;
            renderTable(val === "all" ? allAttempts : allAttempts.filter(a => a.module_id === val));
        });
    }

    function renderTable(attempts) {
        const tbody = document.getElementById("resultsTableBody");
        if (!tbody) return;

        if (!attempts || attempts.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7">
                        <div class="state-message">
                            <div class="state-icon">📭</div>
                            <p>No training assessments recorded yet.</p>
                            <small style="color:var(--color-text-muted)">Trainees can start modules from the Trainee portal.</small>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = attempts.map(a => {
            const badgeClass = getBadgeClass(a.rating);
            const dateStr = formatDate(a.completedAt);

            return `
                <tr>
                    <td><strong>${escapeHtml(a.userName || "Trainee")}</strong></td>
                    <td>${escapeHtml(moduleName(a.module_id))}</td>
                    <td>${a.score} / ${a.maxScore}</td>
                    <td><span class="pct-cell">${a.percentage}%</span></td>
                    <td><span class="badge ${badgeClass}">${a.rating}</span></td>
                    <td>${dateStr}</td>
                    <td>
                        <button class="btn-detail" onclick="DashboardController.viewTraineeDetail('${a.trainee_id}', '${escapeHtml(a.userName || 'Trainee')}')">
                            View Details
                        </button>
                    </td>
                </tr>
            `;
        }).join("");
    }

    function renderTableLoading() {
        const tbody = document.getElementById("resultsTableBody");
        if (!tbody) return;
        tbody.innerHTML = `
            <tr>
                <td colspan="7">
                    <div class="state-message">
                        <div class="loading-spinner"></div>
                        <p>Loading real training records from database…</p>
                    </div>
                </td>
            </tr>
        `;
    }

    function renderTableError(msg) {
        const tbody = document.getElementById("resultsTableBody");
        if (!tbody) return;
        tbody.innerHTML = `
            <tr>
                <td colspan="7">
                    <div class="state-message">
                        <div class="state-icon">⚠️</div>
                        <p style="color:#ff6b4a;">${escapeHtml(msg)}</p>
                    </div>
                </td>
            </tr>
        `;
    }

    /**
     * Trainee Detail Modal — GET /api/results/user/:userId already returns
     * grouped module attempts (same shape as the main table), each carrying
     * its raw per-question `events`. hazard_type/action_type stay internal
     * even here — only scenario_title (resolved via ScenarioEngine) and the
     * result/attempt_count/time_taken_ms are shown.
     */
    async function viewTraineeDetail(userId, traineeName) {
        const modal = document.getElementById("traineeDetailModal");
        const modalContent = document.getElementById("traineeModalContent");
        const modalTitle = document.getElementById("traineeModalTitle");

        if (!modal || !modalContent) return;

        modalTitle.textContent = `${traineeName} — Training History`;
        modalContent.innerHTML = `
            <div style="text-align:center; padding:30px;">
                <div class="loading-spinner"></div>
                <p style="margin-top:12px; color:var(--color-text-muted)">Loading trainee performance profile…</p>
            </div>
        `;
        modal.style.display = "flex";

        try {
            const data = await DashboardAPI.getUserResults(userId);
            const attempts = data.results || [];

            if (!attempts.length) {
                modalContent.innerHTML = `<p style="padding:20px; color:var(--color-text-muted)">No assessment records found for this trainee.</p>`;
                return;
            }

            const totalAttempts = attempts.length;
            const avgScore = Math.round(attempts.reduce((s, a) => s + (a.percentage || 0), 0) / totalAttempts);
            const bestScore = attempts.reduce((best, a) => (a.percentage || 0) > best ? a.percentage : best, 0);

            let html = `
                <div class="trainee-stats-row">
                    <div class="trainee-stat-card">
                        <span class="stat-label">Total Attempts</span>
                        <span class="stat-val">${totalAttempts}</span>
                    </div>
                    <div class="trainee-stat-card">
                        <span class="stat-label">Average Score</span>
                        <span class="stat-val">${avgScore}%</span>
                    </div>
                    <div class="trainee-stat-card">
                        <span class="stat-label">Personal Best</span>
                        <span class="stat-val">${bestScore}%</span>
                    </div>
                </div>

                <h4 style="margin:20px 0 10px; color:var(--color-text-primary); font-size:16px;">Module Attempts &amp; Scenario Breakdown</h4>
                <div class="history-list">
            `;

            attempts.forEach(attempt => {
                const badgeCls = getBadgeClass(attempt.rating);
                const dateStr = formatDate(attempt.completedAt);
                const events = attempt.events || [];
                const correctCount = events.filter(e => e.result === "CORRECT").length;

                html += `
                    <div class="attempt-card">
                        <div class="attempt-header">
                            <div>
                                <strong style="font-size:15px; color:var(--color-text-primary);">${escapeHtml(moduleName(attempt.module_id))}</strong>
                                <span style="display:block; font-size:12px; color:var(--color-text-muted);">${dateStr}</span>
                            </div>
                            <div style="text-align:right;">
                                <span class="badge ${badgeCls}">${attempt.rating}</span>
                                <span style="display:block; font-size:15px; font-weight:bold; color:var(--color-primary); margin-top:4px;">${attempt.score} / ${attempt.maxScore} (${attempt.percentage}%)</span>
                            </div>
                        </div>

                        ${events.length ? `
                            <div class="steps-summary" style="margin-top:12px; font-size:12px; border-top:1px solid rgba(255,255,255,0.06); padding-top:10px;">
                                <div style="font-weight:bold; color:var(--color-text-muted); margin-bottom:6px;">Scenario Results (${correctCount}/${events.length} Correct):</div>
                                ${events.map(ev => {
                                    const question = ScenarioEngine.getQuestion ? ScenarioEngine.getQuestion(attempt.module_id, ev.question_id) : null;
                                    const title = (question && question.scenario_title && question.scenario_title.en) || ev.question_id;
                                    const isCorr = ev.result === "CORRECT";
                                    return `
                                        <div class="step-log-item ${isCorr ? 'correct' : 'incorrect'}">
                                            <span><strong>${escapeHtml(title)}</strong> · attempts: ${ev.attempt_count != null ? ev.attempt_count : '—'} · ${Math.round((ev.time_taken_ms || 0) / 100) / 10}s</span>
                                            <span class="step-status">${isCorr ? '✓ +10' : (ev.result === 'TIMEOUT' ? '⏱ 0' : '✗ 0')}</span>
                                        </div>
                                    `;
                                }).join("")}
                            </div>
                        ` : ''}
                    </div>
                `;
            });

            html += `</div>`;
            modalContent.innerHTML = html;

        } catch (err) {
            console.error("[DashboardController] Error fetching trainee details:", err);
            modalContent.innerHTML = `<p style="padding:20px; color:#ff6b4a;">Could not load trainee details: ${escapeHtml(err.message)}</p>`;
        }
    }

    function closeModal() {
        const modal = document.getElementById("traineeDetailModal");
        if (modal) modal.style.display = "none";
    }

    function getBadgeClass(rating) {
        switch (rating) {
            case "Excellent": return "badge-excellent";
            case "Good": return "badge-good";
            case "Needs Improvement": return "badge-average";
            default: return "badge-poor";
        }
    }

    function formatDate(ts) {
        if (!ts) return "—";
        const d = new Date(ts);
        if (isNaN(d.getTime())) return "—";
        return d.toLocaleDateString("en-IN", {
            day: "numeric", month: "short", year: "numeric",
            hour: "2-digit", minute: "2-digit"
        });
    }

    function escapeHtml(str) {
        if (!str) return "";
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    return {
        init,
        viewTraineeDetail,
        closeModal
    };
})();

// Initialize on DOM load
document.addEventListener("DOMContentLoaded", () => {
    DashboardController.init();
});
