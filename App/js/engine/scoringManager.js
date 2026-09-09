/**
 * SafeAR — ScoringManager
 *
 * The ONE place scoring/rating math happens. Used identically by the training
 * screen, the module completion summary, results.html and the dashboard — no
 * more copy-pasted rating bands in five files.
 */

const ScoringManager = (() => {
    const POINTS_PER_QUESTION = 10;
    const BANDS = [
        { min: 90, key: "rating_excellent", code: "EXCELLENT" },
        { min: 70, key: "rating_good", code: "GOOD" },
        { min: 50, key: "rating_needsImprovement", code: "NEEDS_IMPROVEMENT" },
        { min: 0, key: "rating_failed", code: "FAILED" }
    ];

    function pointsForResult(result) {
        return result === EvaluationEngine.RESULT.CORRECT ? POINTS_PER_QUESTION : 0;
    }

    function ratingCode(percentage) {
        const band = BANDS.find(b => percentage >= b.min);
        return band.code;
    }

    function ratingLabel(percentage) {
        const band = BANDS.find(b => percentage >= b.min);
        return I18n.t(band.key);
    }

    /**
     * @param {Array<{result:string}>} events  per-question results for a module attempt
     */
    function aggregate(events) {
        const maxScore = events.length * POINTS_PER_QUESTION;
        const score = events.reduce((sum, e) => sum + pointsForResult(e.result), 0);
        const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
        return {
            score,
            maxScore,
            percentage,
            ratingCode: ratingCode(percentage),
            ratingLabel: ratingLabel(percentage)
        };
    }

    return { POINTS_PER_QUESTION, pointsForResult, ratingCode, ratingLabel, aggregate };
})();
