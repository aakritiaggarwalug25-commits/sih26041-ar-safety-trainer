/**
 * SafeAR — EvaluationEngine
 *
 * The single place that decides CORRECT / INCORRECT / TIMEOUT. Pure function,
 * no DOM, no network — easy to unit test (see /tests/engine.test.js).
 *
 * Design choice (documented, not accidental): InteractionEngine treats a wrong
 * tap/drag as a *retry*, not an instant game-over — it increments attempt_count
 * and lets the trainee keep trying until either they succeed or the scenario's
 * timer runs out. This is more pedagogically useful for a *training* simulator
 * than punishing a single mis-tap. So in practice INCORRECT only fires for a
 * caller that explicitly reports `failed: true` (reserved for a future
 * interaction type with a genuinely terminal wrong choice); today's 30
 * scenarios resolve to either CORRECT (finished in time) or TIMEOUT (ran out
 * of time before finishing).
 */

const EvaluationEngine = (() => {
    const RESULT = { CORRECT: "CORRECT", INCORRECT: "INCORRECT", TIMEOUT: "TIMEOUT" };

    /**
     * @param {Object} outcome
     * @param {boolean} outcome.completed   did the trainee finish the required action
     * @param {boolean} [outcome.failed]    did the interaction resolve to a terminal wrong choice
     * @param {number}  outcome.attempts    number of unsuccessful attempts before completing (or before timeout)
     * @param {number}  outcome.timeTakenMs elapsed time from scenario start to completion or timeout
     * @param {number}  outcome.timeLimitMs the scenario's required time window
     * @returns {"CORRECT"|"INCORRECT"|"TIMEOUT"}
     */
    function evaluate(outcome) {
        if (outcome.failed) return RESULT.INCORRECT;
        if (outcome.completed && outcome.timeTakenMs <= outcome.timeLimitMs) return RESULT.CORRECT;
        return RESULT.TIMEOUT;
    }

    return { evaluate, RESULT };
})();
