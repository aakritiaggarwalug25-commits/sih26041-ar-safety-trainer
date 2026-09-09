/**
 * Plain-Node unit tests for the pure-logic engines (no browser, no network).
 * Run with: node tests/engine.test.js
 *
 * These load the actual App/js/engine/*.js source files via vm so we're
 * testing the real shipped code, not a re-implementation, with minimal
 * browser globals stubbed (I18n, sessionStorage) since evaluationEngine.js
 * and scoringManager.js are pure but scoringManager references I18n.t for
 * rating labels.
 */
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const assert = require("assert");

const ENGINE_DIR = path.join(__dirname, "..", "App", "js", "engine");

function loadInContext(context, files) {
    files.forEach(f => {
        const code = fs.readFileSync(path.join(ENGINE_DIR, f), "utf8");
        vm.runInContext(code, context, { filename: f });
    });
}

// ---- Minimal browser-ish globals ----
const store = {};
const sessionStorage = {
    getItem: k => (k in store ? store[k] : null),
    setItem: (k, v) => { store[k] = v; },
    removeItem: k => { delete store[k]; }
};
const localStorage = sessionStorage;

const context = vm.createContext({
    console,
    crypto: require("crypto").webcrypto || undefined,
    sessionStorage,
    localStorage,
    LANG_STORAGE_KEY: "safear_language",
    fetch: () => Promise.reject(new Error("fetch not available in test context")),
    window: undefined
});

loadInContext(context, ["i18n.js", "evaluationEngine.js", "scoringManager.js", "scenarioEngine.js"]);

// vm's top-level `const`/`let` bindings live in the context's global lexical
// scope but are NOT copied onto the sandbox object itself — bridge them out
// via a `var` (which does attach) so plain Node code can use them below.
vm.runInContext("var __EXPORTS__ = { EvaluationEngine, ScoringManager, I18n, ScenarioEngine };", context);
const { EvaluationEngine, ScoringManager, I18n, ScenarioEngine } = context.__EXPORTS__;

let passed = 0, failed = 0;
function test(name, fn) {
    try {
        fn();
        console.log("  ok  -", name);
        passed++;
    } catch (e) {
        console.error("  FAIL -", name, "\n      ", e.message);
        failed++;
    }
}

console.log("EvaluationEngine");
test("completed within time -> CORRECT", () => {
    const r = EvaluationEngine.evaluate({ completed: true, attempts: 0, timeTakenMs: 3000, timeLimitMs: 8000 });
    assert.strictEqual(r, "CORRECT");
});
test("completed within time despite retries -> still CORRECT", () => {
    const r = EvaluationEngine.evaluate({ completed: true, attempts: 3, timeTakenMs: 7000, timeLimitMs: 8000 });
    assert.strictEqual(r, "CORRECT");
});
test("not completed, time exceeded -> TIMEOUT", () => {
    const r = EvaluationEngine.evaluate({ completed: false, attempts: 2, timeTakenMs: 9000, timeLimitMs: 8000 });
    assert.strictEqual(r, "TIMEOUT");
});
test("completed but after time window -> TIMEOUT", () => {
    const r = EvaluationEngine.evaluate({ completed: true, attempts: 0, timeTakenMs: 9000, timeLimitMs: 8000 });
    assert.strictEqual(r, "TIMEOUT");
});
test("explicit failure -> INCORRECT", () => {
    const r = EvaluationEngine.evaluate({ completed: false, failed: true, attempts: 1, timeTakenMs: 1000, timeLimitMs: 8000 });
    assert.strictEqual(r, "INCORRECT");
});

console.log("ScoringManager");
test("10 correct of 10 -> 100%, Excellent", () => {
    const events = Array.from({ length: 10 }, () => ({ result: "CORRECT" }));
    const agg = ScoringManager.aggregate(events);
    assert.strictEqual(agg.score, 100);
    assert.strictEqual(agg.maxScore, 100);
    assert.strictEqual(agg.percentage, 100);
    assert.strictEqual(agg.ratingCode, "EXCELLENT");
});
test("7 correct of 10 -> 70%, Good", () => {
    const events = [
        ...Array.from({ length: 7 }, () => ({ result: "CORRECT" })),
        ...Array.from({ length: 3 }, () => ({ result: "TIMEOUT" }))
    ];
    const agg = ScoringManager.aggregate(events);
    assert.strictEqual(agg.percentage, 70);
    assert.strictEqual(agg.ratingCode, "GOOD");
});
test("5 correct of 10 -> 50%, Needs Improvement", () => {
    const events = [
        ...Array.from({ length: 5 }, () => ({ result: "CORRECT" })),
        ...Array.from({ length: 5 }, () => ({ result: "INCORRECT" }))
    ];
    const agg = ScoringManager.aggregate(events);
    assert.strictEqual(agg.percentage, 50);
    assert.strictEqual(agg.ratingCode, "NEEDS_IMPROVEMENT");
});
test("2 correct of 10 -> 20%, Failed", () => {
    const events = [
        ...Array.from({ length: 2 }, () => ({ result: "CORRECT" })),
        ...Array.from({ length: 8 }, () => ({ result: "TIMEOUT" }))
    ];
    const agg = ScoringManager.aggregate(events);
    assert.strictEqual(agg.percentage, 20);
    assert.strictEqual(agg.ratingCode, "FAILED");
});
test("empty module -> 0%, no NaN/crash", () => {
    const agg = ScoringManager.aggregate([]);
    assert.strictEqual(agg.percentage, 0);
    assert.strictEqual(agg.maxScore, 0);
});

console.log("I18n");
test("defaults to English chrome string", () => {
    assert.strictEqual(I18n.t("langSelect_continue"), "Continue");
});
test("switches to Hindi and resolves a chrome string", () => {
    I18n.setLang("hi");
    assert.strictEqual(I18n.t("langSelect_continue"), "जारी रखें");
    I18n.setLang("en");
});
test("field() resolves bilingual content objects by current language", () => {
    I18n.setLang("hi");
    assert.strictEqual(I18n.field({ en: "Hello", hi: "नमस्ते" }), "नमस्ते");
    I18n.setLang("en");
    assert.strictEqual(I18n.field({ en: "Hello", hi: "नमस्ते" }), "Hello");
});

console.log("ScenarioEngine timing (realistic per-primitive question timers)");
{
    // Load the real 30-question JSON + the real INTERACTION_CONFIGS (the
    // hand-authored question_id -> primitive bridge) so this exercises the
    // actual shipped mapping, not a re-typed copy of it.
    const CONTENT_PATH = path.join(__dirname, "..", "content", "ar_safety_training_modules.json");
    const json = JSON.parse(fs.readFileSync(CONTENT_PATH, "utf8"));
    const configSrc = fs.readFileSync(path.join(ENGINE_DIR, "interactionConfigs.js"), "utf8");
    vm.runInContext(configSrc, context, { filename: "interactionConfigs.js" });
    vm.runInContext("var __CFG__ = INTERACTION_CONFIGS;", context);
    const INTERACTION_CONFIGS = context.__CFG__;

    const EXPECTED_SEC_BY_PRIMITIVE = {
        TAP: 60, TAP_HOLD: 60,          // simple tap / hold
        DRAG: 75, SWIPE: 75,            // drag / swipe
        ROTATE: 90,                     // rotate / AR placement
        PHYSICAL_MOVE: 120,             // physical movement
        DRAG_MULTI: 120, COMPOSITE: 120 // multi-step interaction
    };

    const allQuestions = [];
    json.modules.forEach(m => m.items.forEach(q => allQuestions.push(q)));

    test(`covers all ${allQuestions.length} questions across every primitive type actually used`, () => {
        const primitivesSeen = new Set(allQuestions.map(q => INTERACTION_CONFIGS[q.question_id].primitive));
        const expectedPrimitives = Object.keys(EXPECTED_SEC_BY_PRIMITIVE);
        expectedPrimitives.forEach(p => assert.ok(primitivesSeen.has(p), `no question uses primitive ${p} — test would not cover it`));
    });

    allQuestions.forEach(q => {
        const cfg = INTERACTION_CONFIGS[q.question_id];
        test(`${q.question_id} (${cfg.primitive}) gets ${EXPECTED_SEC_BY_PRIMITIVE[cfg.primitive]}s, not the old ~6-15s narrative countdown`, () => {
            const seconds = ScenarioEngine.getTimeLimitSeconds(q, cfg, 60);
            assert.strictEqual(seconds, EXPECTED_SEC_BY_PRIMITIVE[cfg.primitive]);
            assert.ok(seconds >= 60, "every question must give the trainee at least 60s");
        });
    });

    test("a hypothetical question with a genuinely longer JSON-stated window is never capped below its own number", () => {
        const longQuestion = { interaction: "Complete the full drill within 200 seconds total." };
        const seconds = ScenarioEngine.getTimeLimitSeconds(longQuestion, { primitive: "TAP" }, 60);
        assert.strictEqual(seconds, 200);
    });

    test("unrecognised/missing primitive still falls back to a real timer, never the old short default", () => {
        const seconds = ScenarioEngine.getTimeLimitSeconds({ interaction: "Do the thing." }, { primitive: "NOT_A_REAL_PRIMITIVE" }, 60);
        assert.strictEqual(seconds, 60);
    });
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
