/**
 * SafeAR — ScenarioEngine
 *
 * The ONE source of training content. Loads ar_safety_training_modules.json
 * (via CONTENT_URL — either a static file or the backend's
 * GET /api/content/modules) and exposes read-only accessors over it.
 *
 * Nothing else in the app should hardcode scenario text, hazard types, action
 * types, or module lists — it all comes from here. If the JSON is edited later,
 * the app picks up the change automatically with no JS changes required.
 */

const ScenarioEngine = (() => {
    let data = null;
    let loadPromise = null;

    function load() {
        if (data) return Promise.resolve(data);
        if (loadPromise) return loadPromise;

        loadPromise = fetch(CONTENT_URL)
            .then(resp => {
                if (!resp.ok) throw new Error("Failed to load training content (HTTP " + resp.status + ")");
                return resp.json();
            })
            .then(json => {
                data = json;
                return data;
            })
            .catch(err => {
                loadPromise = null;
                throw err;
            });

        return loadPromise;
    }

    function ensureLoaded() {
        if (!data) throw new Error("ScenarioEngine.load() must complete before this call");
    }

    function getProject() {
        ensureLoaded();
        return data.project;
    }

    function getEnvironmentTaxonomy() {
        ensureLoaded();
        return data.environment_condition_taxonomy || {};
    }

    function getLoggingSchema() {
        ensureLoaded();
        return data.logging_schema || {};
    }

    function getTechnicalDependencies() {
        ensureLoaded();
        return data.technical_dependencies || [];
    }

    /** Lightweight summaries for the Module Selection screen. */
    function getModuleSummaries() {
        ensureLoaded();
        return data.modules.map(m => ({
            module_id: m.module_id,
            module_name: m.module_name,
            hazard_category: m.hazard_category,
            relevance: m.relevance,
            scan_instruction: m.scan_instruction,
            itemCount: (m.items || []).length
        }));
    }

    function getModule(moduleId) {
        ensureLoaded();
        return data.modules.find(m => m.module_id === moduleId) || null;
    }

    function getModuleSequence() {
        ensureLoaded();
        return data.modules.map(m => m.module_id);
    }

    function getQuestions(moduleId) {
        const mod = getModule(moduleId);
        return mod ? (mod.items || []) : [];
    }

    function getQuestion(moduleId, questionId) {
        const items = getQuestions(moduleId);
        return items.find(q => q.question_id === questionId) || null;
    }

    /** Find which module a question_id belongs to (used by logging/dashboard code). */
    function findModuleForQuestion(questionId) {
        ensureLoaded();
        for (const m of data.modules) {
            if ((m.items || []).some(q => q.question_id === questionId)) return m.module_id;
        }
        return null;
    }

    /** Realistic UX time budgets (seconds), keyed by InteractionEngine primitive
     *  complexity — how long a trainee actually needs to read the scenario,
     *  find the right object, and perform a tap/hold/drag/rotate/physical-move
     *  on a touchscreen or mouse. These are NOT the same thing as each
     *  question's free-text `interaction` field, which narrates a fictional
     *  in-world countdown ("before the dust flashes", "(8-second window)") for
     *  dramatic/teaching flavor — that countdown describes how fast the
     *  simulated hazard escalates in the story, not a real UX time budget, and
     *  using it directly produced timers as short as 2-3 seconds for actions
     *  that themselves take 2-3 seconds just to perform (unwinnable). */
    const PRIMITIVE_TIME_LIMITS_SEC = {
        TAP: 60,
        TAP_HOLD: 60,
        DRAG: 75,
        SWIPE: 75,
        ROTATE: 90,
        PHYSICAL_MOVE: 120,
        DRAG_MULTI: 120,
        COMPOSITE: 120
    };

    /** Pull the LAST "N second(s)" mention out of a question's free-text
     *  `interaction` field (its in-story countdown), if any is stated. Kept
     *  only so a genuinely longer JSON-authored window is never overridden —
     *  see getTimeLimitSeconds(). */
    function parseNarrativeSeconds(question) {
        if (!question || !question.interaction) return 0;
        const matches = [...question.interaction.matchAll(/(\d+)[\s-]*second/gi)];
        return matches.length ? parseInt(matches[matches.length - 1][1], 10) : 0;
    }

    /** The actual timer budget (seconds) for one question — this is what
     *  EvaluationEngine's CORRECT/TIMEOUT decision is really based on.
     *
     *  @param {Object} question         the JSON question object
     *  @param {Object} [interactionConfig] this question's INTERACTION_CONFIGS
     *                                    entry (i.e. { primitive: "DRAG", ... });
     *                                    passed in rather than looked up here so
     *                                    ScenarioEngine has no dependency on
     *                                    InteractionConfigs/InteractionEngine.
     *  @param {number} [fallback]        used only if primitive is unrecognised
     */
    function getTimeLimitSeconds(question, interactionConfig, fallback) {
        const primitive = interactionConfig && interactionConfig.primitive;
        const base = PRIMITIVE_TIME_LIMITS_SEC[primitive] || fallback || 60;
        // Respect a genuinely longer JSON-stated window if one is ever
        // authored (none of the current 30 questions need this — their
        // narrative countdowns are all well under these floors — but a
        // future scenario with a legitimately longer stated window should
        // never be capped below its own number).
        return Math.max(base, parseNarrativeSeconds(question));
    }

    return {
        load,
        getProject,
        getEnvironmentTaxonomy,
        getLoggingSchema,
        getTechnicalDependencies,
        getModuleSummaries,
        getModule,
        getModuleSequence,
        getQuestions,
        getQuestion,
        findModuleForQuestion,
        getTimeLimitSeconds
    };
})();
