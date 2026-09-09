/**
 * Consistency check between the canonical content JSON and the hand-authored
 * interaction config table. Every question_id in the JSON must have exactly
 * one matching entry in INTERACTION_CONFIGS, and vice versa — this catches
 * typos in the 30 hand-authored keys before they become a silent runtime bug
 * (a scenario screen with no interaction wired up).
 *
 * Run with: node tests/content-consistency.test.js
 */
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const assert = require("assert");

const root = path.join(__dirname, "..");
const json = JSON.parse(fs.readFileSync(path.join(root, "content", "ar_safety_training_modules.json"), "utf8"));

const context = vm.createContext({});
const code = fs.readFileSync(path.join(root, "App", "js", "engine", "interactionConfigs.js"), "utf8");
vm.runInContext(code + "\nvar __CFG__ = INTERACTION_CONFIGS;", context);
const configs = context.__CFG__;

// ---- Minimal fake DOM so the A-Frame-flavoured scene builders (which only
// ever call document.createElement/setAttribute/appendChild — never touch
// layout, events, or anything WebXR-specific) can run headlessly in vm. ----
function makeFakeEl(tag) {
    return {
        tagName: tag,
        attrs: {},
        children: [],
        setAttribute(k, v) { this.attrs[k] = v; },
        appendChild(child) { this.children.push(child); return child; }
    };
}
const sceneContext = vm.createContext({
    document: { createElement: makeFakeEl },
    Math,
    console
});
["props.js", "mod01.js", "mod02.js", "mod03.js", "index.js"].forEach(f => {
    const src = fs.readFileSync(path.join(root, "App", "js", "scenes", f), "utf8");
    vm.runInContext(src, sceneContext, { filename: f });
});
vm.runInContext("var __SCENES__ = SCENE_BUILDERS;", sceneContext);
const sceneBuilders = sceneContext.__SCENES__;

const jsonQuestionIds = [];
json.modules.forEach(m => (m.items || []).forEach(q => jsonQuestionIds.push(q.question_id)));

const configIds = Object.keys(configs);
const sceneIds = Object.keys(sceneBuilders);

let failed = 0;
function check(name, fn) {
    try { fn(); console.log("  ok  -", name); }
    catch (e) { console.error("  FAIL -", name, "\n      ", e.message); failed++; }
}

console.log(`JSON has ${jsonQuestionIds.length} questions across ${json.modules.length} modules; INTERACTION_CONFIGS has ${configIds.length} entries.`);

check("every JSON question_id has an interaction config", () => {
    const missing = jsonQuestionIds.filter(id => !configs[id]);
    assert.deepStrictEqual(missing, [], "missing config for: " + missing.join(", "));
});

check("every interaction config key is a real question_id", () => {
    const extra = configIds.filter(id => !jsonQuestionIds.includes(id));
    assert.deepStrictEqual(extra, [], "config keys with no matching question: " + extra.join(", "));
});

check("no duplicate question_ids in the JSON", () => {
    const dupes = jsonQuestionIds.filter((id, i) => jsonQuestionIds.indexOf(id) !== i);
    assert.deepStrictEqual(dupes, []);
});

check("every config's target/object/zone ids are non-empty strings", () => {
    const bad = [];
    Object.entries(configs).forEach(([qid, cfg]) => {
        const collectRefs = (c) => {
            const refs = [c.target, c.object, c.zone, c.distractor, ...(c.objects || []), ...(c.zones || [])];
            (c.steps || []).forEach(s => refs.push(...collectRefs(s)));
            return refs.filter(Boolean);
        };
        collectRefs(cfg).forEach(ref => {
            if (!ref.id || typeof ref.id !== "string") bad.push(qid);
        });
    });
    assert.deepStrictEqual(bad, []);
});

console.log(`SCENE_BUILDERS has ${sceneIds.length} entries.`);

check("every JSON question_id has a scene builder", () => {
    const missing = jsonQuestionIds.filter(id => !sceneBuilders[id]);
    assert.deepStrictEqual(missing, [], "missing scene builder for: " + missing.join(", "));
});

check("every scene builder key is a real question_id", () => {
    const extra = sceneIds.filter(id => !jsonQuestionIds.includes(id));
    assert.deepStrictEqual(extra, [], "scene builder keys with no matching question: " + extra.join(", "));
});

check("every scene builder runs without throwing, against a fake root", () => {
    const errors = [];
    jsonQuestionIds.forEach(id => {
        if (!sceneBuilders[id]) return;
        try {
            sceneBuilders[id](makeFakeEl("a-entity"));
        } catch (e) {
            errors.push(`${id}: ${e.message}`);
        }
    });
    assert.deepStrictEqual(errors, []);
});

console.log(failed ? `\n${failed} check(s) FAILED` : "\nAll consistency checks passed");
process.exit(failed ? 1 : 0);
