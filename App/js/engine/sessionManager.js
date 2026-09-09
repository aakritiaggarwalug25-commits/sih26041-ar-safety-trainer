/**
 * SafeAR — SessionManager
 *
 * Owns everything the JSON's logging_schema calls "session-level": session_id,
 * trainee_id, user_language_preference, session_start/end_timestamp, and
 * module_sequence. Language is set ONCE (on the Language Selection screen) and
 * carried for the rest of the session — nothing here re-prompts for it.
 *
 * Persisted in sessionStorage so a refresh mid-session doesn't lose the
 * session id or module sequence; a genuinely new browser tab/session gets a
 * fresh session_id.
 */

const SessionManager = (() => {
    const KEY = "safear_session_meta";

    function uuid() {
        if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
        return "sess-" + Date.now() + "-" + Math.random().toString(16).slice(2);
    }

    function read() {
        try {
            const raw = sessionStorage.getItem(KEY);
            return raw ? JSON.parse(raw) : null;
        } catch (e) { return null; }
    }

    function write(meta) {
        try { sessionStorage.setItem(KEY, JSON.stringify(meta)); } catch (e) {}
    }

    /** Call once per login/app-load. Idempotent — reuses an existing session. */
    function ensureSession(traineeId) {
        let meta = read();
        if (!meta || meta.trainee_id !== traineeId) {
            meta = {
                session_id: uuid(),
                trainee_id: traineeId,
                user_language_preference: I18n.getLang(),
                session_start_timestamp: new Date().toISOString(),
                session_end_timestamp: null,
                module_sequence: []
            };
            write(meta);
        } else {
            // language may have been (re)selected since session creation
            meta.user_language_preference = I18n.getLang();
            write(meta);
        }
        return meta;
    }

    function recordModuleStart(moduleId) {
        const meta = read();
        if (!meta) return;
        if (!meta.module_sequence.includes(moduleId)) {
            meta.module_sequence.push(moduleId);
            write(meta);
        }
    }

    function endSession() {
        const meta = read();
        if (!meta) return null;
        meta.session_end_timestamp = new Date().toISOString();
        write(meta);
        return meta;
    }

    function getMeta() {
        return read();
    }

    return { ensureSession, recordModuleStart, endSession, getMeta };
})();
