/**
 * SafeAR — LoggingService
 *
 * Formats and sends events matching ar_safety_training_modules.json's
 * logging_schema exactly:
 *   session_level_fields:      session_id, trainee_id, user_language_preference,
 *                              session_start_timestamp, session_end_timestamp,
 *                              module_sequence
 *   per_question_event_fields: module_id, question_id, hazard_type, action_type,
 *                              environment_detected, attempt_count, time_taken_ms,
 *                              result, event_timestamp
 *
 * hazard_type / action_type / module_id / question_id are stable internal
 * codes — never the translated display text — matching the JSON's own note
 * that these must stay language-independent for the database.
 */

const LoggingService = (() => {
    function logSessionStart() {
        const meta = SessionManager.getMeta();
        if (!meta) return Promise.resolve();
        return SafeAuth.authFetch(API_BASE_URL + "/api/sessions", {
            method: "POST",
            body: JSON.stringify({
                session_id: meta.session_id,
                trainee_id: meta.trainee_id,
                user_language_preference: meta.user_language_preference,
                session_start_timestamp: meta.session_start_timestamp,
                module_sequence: meta.module_sequence
            })
        }).catch(err => console.warn("[LoggingService] session start log failed", err));
    }

    function logSessionEnd() {
        const meta = SessionManager.endSession();
        if (!meta) return Promise.resolve();
        return SafeAuth.authFetch(API_BASE_URL + "/api/sessions/" + encodeURIComponent(meta.session_id), {
            method: "PATCH",
            body: JSON.stringify({
                session_end_timestamp: meta.session_end_timestamp,
                module_sequence: meta.module_sequence
            })
        }).catch(err => console.warn("[LoggingService] session end log failed", err));
    }

    /**
     * @param {Object} event
     * @param {string} event.module_id
     * @param {string} event.question_id
     * @param {string} event.hazard_type
     * @param {string} event.action_type
     * @param {string} event.environment_detected
     * @param {number} event.attempt_count
     * @param {number} event.time_taken_ms
     * @param {"CORRECT"|"INCORRECT"|"TIMEOUT"} event.result
     */
    function logQuestionEvent(event) {
        const meta = SessionManager.getMeta();
        const payload = Object.assign({
            session_id: meta ? meta.session_id : null,
            trainee_id: meta ? meta.trainee_id : null,
            event_timestamp: new Date().toISOString()
        }, event);

        return SafeAuth.authFetch(API_BASE_URL + "/api/results", {
            method: "POST",
            body: JSON.stringify(payload)
        }).catch(err => {
            console.warn("[LoggingService] question event log failed", err);
            return null;
        });
    }

    return { logSessionStart, logSessionEnd, logQuestionEvent };
})();
