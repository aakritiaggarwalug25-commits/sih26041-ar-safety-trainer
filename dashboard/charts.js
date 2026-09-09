/**
 * SafeAR — Performance Analytics Charts
 *
 * Chart 1: Average Score by Module (Bar) — real 3 modules, not the old
 *          {ppe-check, fire-response, gas-leak} 3-scenario set.
 * Chart 2: Pass / Fail Distribution (Doughnut, threshold = 50%)
 * Chart 3: Completions by Module (Horizontal Bar)
 */

const DashboardCharts = (() => {
    let chartScores = null;
    let chartPassFail = null;
    let chartCompletions = null;

    const THEME = {
        cyan: "#22c8ff",
        yellow: "#ffe36a",
        green: "#54f29b",
        red: "#ff6b4a",
        gridLine: "rgba(255, 255, 255, 0.08)",
        textColor: "#9ab0b5"
    };

    /**
     * @param {Object} summary  from GET /api/dashboard/summary (.summary — has moduleStats)
     * @param {Array} attempts  the .attempts array from the same response
     */
    function renderAll(summary, attempts) {
        if (typeof Chart === "undefined") {
            console.error("[DashboardCharts] Chart.js library is not loaded.");
            return;
        }

        const moduleStats = (summary && summary.moduleStats) || [];
        renderScenarioScoresChart(moduleStats);
        renderPassFailChart(attempts || []);
        renderCompletionsChart(moduleStats);
    }

    /** Chart 1: Average Score by Module */
    function renderScenarioScoresChart(moduleStats) {
        const canvas = document.getElementById("chartScenarioScores");
        if (!canvas) return;
        if (chartScores) chartScores.destroy();

        const labels = moduleStats.map(m => m.module_name);
        const data = moduleStats.map(m => m.averageScore);
        const palette = ["rgba(34, 200, 255, 0.75)", "rgba(255, 227, 106, 0.75)", "rgba(84, 242, 155, 0.75)"];
        const borders = [THEME.cyan, THEME.yellow, THEME.green];

        chartScores = new Chart(canvas, {
            type: "bar",
            data: {
                labels,
                datasets: [{
                    label: "Average Score (%)",
                    data,
                    backgroundColor: moduleStats.map((_, i) => palette[i % palette.length]),
                    borderColor: moduleStats.map((_, i) => borders[i % borders.length]),
                    borderWidth: 1.5,
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: { callbacks: { label: (ctx) => `Average Score: ${ctx.parsed.y}%` } }
                },
                scales: {
                    y: {
                        beginAtZero: true, max: 100,
                        ticks: { color: THEME.textColor, callback: v => v + "%" },
                        grid: { color: THEME.gridLine }
                    },
                    x: { ticks: { color: THEME.textColor }, grid: { display: false } }
                }
            }
        });
    }

    /** Chart 2: Pass / Fail Distribution across all module attempts */
    function renderPassFailChart(attempts) {
        const canvas = document.getElementById("chartPassFail");
        if (!canvas) return;
        if (chartPassFail) chartPassFail.destroy();

        let passed = 0, failed = 0;
        attempts.forEach(a => {
            if ((a.percentage || 0) >= PASS_THRESHOLD) passed++; else failed++;
        });

        chartPassFail = new Chart(canvas, {
            type: "doughnut",
            data: {
                labels: [`Passed (≥${PASS_THRESHOLD}%)`, `Failed (<${PASS_THRESHOLD}%)`],
                datasets: [{
                    data: [passed, failed],
                    backgroundColor: ["rgba(84, 242, 155, 0.8)", "rgba(255, 107, 74, 0.8)"],
                    borderColor: [THEME.green, THEME.red],
                    borderWidth: 1.5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: "bottom", labels: { color: THEME.textColor, padding: 14 } } }
            }
        });
    }

    /** Chart 3: Completions per Module */
    function renderCompletionsChart(moduleStats) {
        const canvas = document.getElementById("chartScoreDistribution");
        if (!canvas) return;
        if (chartCompletions) chartCompletions.destroy();

        const labels = moduleStats.map(m => m.module_name);
        const data = moduleStats.map(m => m.attempts);

        chartCompletions = new Chart(canvas, {
            type: "bar",
            data: {
                labels,
                datasets: [{
                    label: "Completions",
                    data,
                    backgroundColor: "rgba(34, 200, 255, 0.65)",
                    borderColor: THEME.cyan,
                    borderWidth: 1.5,
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: "y",
                plugins: { legend: { display: false } },
                scales: {
                    x: { beginAtZero: true, ticks: { color: THEME.textColor, stepSize: 1 }, grid: { color: THEME.gridLine } },
                    y: { ticks: { color: THEME.textColor }, grid: { display: false } }
                }
            }
        });
    }

    return { renderAll };
})();
