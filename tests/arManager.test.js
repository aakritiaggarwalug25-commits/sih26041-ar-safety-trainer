/**
 * Headless checks for ARManager (App/js/engine/arManager.js) that DON'T
 * require a real WebXR device or browser — no headless environment
 * (including headless Chromium) can grant a real immersive-ar session, so
 * this deliberately does NOT claim to test actual AR placement/hit-test
 * end-to-end. Per the project brief: never fake a passing AR test.
 *
 * What this DOES verify, against a fake DOM (structure/wiring only):
 *   1. ensureScene() builds a scene with vr-mode-ui disabled (we drive entry
 *      ourselves) and a webxr config that actually requests hit-test +
 *      dom-overlay + the #trainingOverlay root — i.e. the config that was
 *      silently wrong before (dom-overlay was never requested, and the
 *      overlay element it pointed at didn't exist) is now structurally right.
 *   2. getMode()/setMode() behave as plain state, and default to "simulation"
 *      — the badge can never start as "ar" before anything has happened.
 *   3. enterAR() REJECTS (never throws, never silently reports success) when
 *      navigator.xr is unavailable — the most common real case (desktop
 *      browsers, non-AR phones) — and when the A-Frame build doesn't expose
 *      an enterAR() method. Both are exactly the situations that must fall
 *      back to Simulation Mode rather than get stuck.
 *
 * What this does NOT and CANNOT verify here (see DELIVERY_SUMMARY.md /
 * final chat summary for the physical-device test checklist):
 *   - A real immersive-ar session actually starting on a compatible phone.
 *   - Real camera passthrough.
 *   - Real hit-test results / reticle tracking against a real surface.
 *   - The actual "select" tap-to-place gesture on real hardware.
 *   - The WebXR dom-overlay actually compositing #trainingOverlay over the
 *     camera feed in a real browser.
 *
 * Run with: node tests/arManager.test.js
 */
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const assert = require("assert");

const ENGINE_DIR = path.join(__dirname, "..", "App", "js", "engine");

function makeFakeEl(tag) {
    return {
        tagName: tag,
        attrs: {},
        children: [],
        style: {},
        object3D: { visible: true, position: { set() {} }, quaternion: { set() {}, copy() {} } },
        setAttribute(k, v) { this.attrs[k] = v; },
        removeAttribute(k) { delete this.attrs[k]; },
        appendChild(child) { this.children.push(child); return child; },
        addEventListener() {},
        removeEventListener() {},
        is() { return false; }
    };
}

function freshContext(navigatorXr) {
    return vm.createContext({
        document: { createElement: makeFakeEl },
        navigator: { xr: navigatorXr },
        console,
        AFRAME: undefined
    });
}

function loadARManager(context) {
    const code = fs.readFileSync(path.join(ENGINE_DIR, "arManager.js"), "utf8");
    vm.runInContext(code, context, { filename: "arManager.js" });
    vm.runInContext("var __EXPORT__ = ARManager;", context);
    return context.__EXPORT__;
}

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

async function asyncTest(name, fn) {
    try {
        await fn();
        console.log("  ok  -", name);
        passed++;
    } catch (e) {
        console.error("  FAIL -", name, "\n      ", e.message);
        failed++;
    }
}

(async () => {
    console.log("ARManager (structural / defensive-guard checks only — see file header)");

    test("ensureScene() requests hit-test + dom-overlay + #trainingOverlay, and disables A-Frame's own AR button", () => {
        const ctx = freshContext(undefined);
        const ARManager = loadARManager(ctx);
        const mount = makeFakeEl("div");
        const scene = ARManager.ensureScene(mount);
        assert.strictEqual(scene.attrs["vr-mode-ui"], "enabled: false");
        const webxrCfg = scene.attrs["webxr"];
        assert.ok(/hit-test/.test(webxrCfg), "webxr config must request hit-test");
        assert.ok(/dom-overlay/.test(webxrCfg), "webxr config must request dom-overlay");
        assert.ok(/#trainingOverlay/.test(webxrCfg), "webxr config must point overlayElement at #trainingOverlay");
    });

    test("getMode() defaults to simulation and never starts as ar", () => {
        const ctx = freshContext(undefined);
        const ARManager = loadARManager(ctx);
        ARManager.ensureScene(makeFakeEl("div"));
        assert.strictEqual(ARManager.getMode(), "simulation");
    });

    test("setARSupported()/isARSupportedCached() are plain state, independent of getMode()", () => {
        const ctx = freshContext(undefined);
        const ARManager = loadARManager(ctx);
        ARManager.ensureScene(makeFakeEl("div"));
        ARManager.setARSupported(true);
        assert.strictEqual(ARManager.isARSupportedCached(), true);
        // Support being true must NOT flip the mode by itself — that's the
        // exact bug this rebuild fixes (support-check treated as "AR active").
        assert.strictEqual(ARManager.getMode(), "simulation");
    });

    await asyncTest("enterAR() rejects (never resolves, never throws) when navigator.xr is unavailable", async () => {
        const ctx = freshContext(undefined); // no navigator.xr at all
        const ARManager = loadARManager(ctx);
        ARManager.ensureScene(makeFakeEl("div"));
        await assert.rejects(() => ARManager.enterAR(makeFakeEl("div"), {}));
        assert.strictEqual(ARManager.getMode(), "simulation", "must stay/fall back to simulation on rejection");
    });

    await asyncTest("enterAR() rejects cleanly when the A-Frame build has no enterAR() method", async () => {
        const ctx = freshContext({ isSessionSupported: async () => true }); // navigator.xr present...
        const ARManager = loadARManager(ctx);
        const scene = ARManager.ensureScene(makeFakeEl("div"));
        // ...but this fake <a-scene> has no enterAR(), simulating an older/
        // unsupported A-Frame build — must reject, not throw or hang.
        await assert.rejects(() => ARManager.enterAR(makeFakeEl("div"), {}));
        assert.strictEqual(ARManager.getMode(), "simulation");
    });

    test("destroy() resets mode back to simulation", () => {
        const ctx = freshContext(undefined);
        const ARManager = loadARManager(ctx);
        const mount = makeFakeEl("div");
        ARManager.ensureScene(mount);
        ARManager.setMode("ar");
        ARManager.destroy(mount);
        assert.strictEqual(ARManager.getMode(), "simulation");
    });

    console.log(`\n${passed} passed, ${failed} failed`);
    process.exit(failed ? 1 : 0);
})();
