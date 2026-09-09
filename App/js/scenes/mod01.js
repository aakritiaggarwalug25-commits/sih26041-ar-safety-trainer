/**
 * SafeAR — Module 1 scene builders: Fire, Gas & Explosion Hazard Response.
 *
 * Each function takes the shared #hazardRoot entity and composes a scene
 * matching that question's hazard_description in
 * content/ar_safety_training_modules.json, built from the shared Props
 * library (App/js/scenes/props.js). These are pure visual backdrops — the
 * actual tap/hold/drag controls render separately via InteractionEngine
 * (see App/js/engine/interactionConfigs.js for what each one requires).
 */

const Mod01Scenes = (() => {
    // MOD01_Q01 — Open flame beside a heap of coal dust.
    function MOD01_Q01(root) {
        Props.floorPatch(root, { color: "#161616", opacity: "0.4", radius: 0.42 });
        Props.pile(root, { position: "0.18 0.02 0.05", color: "#141414", radius: 0.2 });
        Props.smoke(root, { position: "0.18 0.22 0.05" });
        Props.flame(root, { position: "-0.18 0.02 0" });
    }

    // MOD01_Q02 — Translucent yellow methane cloud with a red-pulsing detector.
    function MOD01_Q02(root) {
        Props.floorPatch(root, { color: "#12202a", opacity: "0.35", radius: 0.45 });
        Props.gasCloud(root, { position: "-0.05 0.15 0", color: "#cdd98a", detectorColor: "#ff1744" });
        Props.wallSurface(root, { position: "0 0.55 -0.4", color: "#1b2530" });
    }

    // MOD01_Q03 — Frayed wall cable sparking above oil-stained rags.
    function MOD01_Q03(root) {
        Props.wallSurface(root, { color: "#22303a" });
        Props.pipe(root, { position: "0.1 0.65 -0.33", radius: 0.025, height: 0.45, color: "#111" });
        Props.sparkParticles(root, { position: "0.1 0.45 -0.28" });
        Props.pile(root, { position: "0.1 0.03 0.05", color: "#3b2b1a", radius: 0.16 });
    }

    // MOD01_Q04 — Welding spark shower beside two open fuel drums.
    function MOD01_Q04(root) {
        Props.floorPatch(root, { color: "#1c1c1c", opacity: "0.35" });
        const drum1 = Props.el("a-cylinder", { position: "-0.28 0.13 0.05", radius: 0.11, height: 0.26, color: "#8d4a2b" });
        const drum2 = Props.el("a-cylinder", { position: "-0.28 0.13 -0.22", radius: 0.11, height: 0.26, color: "#7a4024" });
        root.appendChild(drum1); root.appendChild(drum2);
        Props.sparkParticles(root, { position: "0.15 0.3 0" });
        Props.workerFigure(root, { position: "0.25 0 0", color: "#37474f" });
    }

    // MOD01_Q05 — Crates and loose material blocking a marked exit + hidden extinguisher.
    function MOD01_Q05(root) {
        Props.wallSurface(root, { color: "#1e2a33" });
        const ext = Props.el("a-box", { position: "0.32 0.55 -0.32", width: 0.14, height: 0.28, depth: 0.08, color: "#c62828" });
        root.appendChild(ext);
        Props.crate(root, { position: "-0.15 0.13 0.05", color: "#8d6e63" });
        Props.crate(root, { position: "0.05 0.13 0.12", color: "#6d4c41" });
        Props.crate(root, { position: "0.28 0.13 0.1", color: "#795548" });
    }

    // MOD01_Q06 — Heat-shimmer and smoke at an overheating conveyor motor, gauge rising.
    function MOD01_Q06(root) {
        Props.machine(root, { position: "0 0.2 0", width: 0.7, height: 0.32, color: "#455a64" });
        Props.heatShimmer(root, { position: "0.15 0.42 0" });
        Props.smoke(root, { position: "0.15 0.45 0" });
        Props.gaugeDial(root, { position: "-0.35 0.55 0", durMs: 1600 });
    }

    // MOD01_Q07 — Static spark arcing between two containers during a powder transfer.
    function MOD01_Q07(root) {
        const c1 = Props.el("a-cylinder", { position: "-0.18 0.22 0", radius: 0.09, height: 0.32, color: "#78909c" });
        const c2 = Props.el("a-cylinder", { position: "0.18 0.22 0", radius: 0.09, height: 0.32, color: "#607d8b" });
        root.appendChild(c1); root.appendChild(c2);
        Props.sparkParticles(root, { position: "0 0.36 0" });
        Props.gasCloud(root, { position: "0 0.3 0", color: "#e0d9c0", detectorColor: null });
    }

    // MOD01_Q08 — Worker smoking beside a coal stockpile, fallen no-smoking sign.
    function MOD01_Q08(root) {
        Props.floorPatch(root, { color: "#151515", opacity: "0.3", radius: 0.5 });
        Props.pile(root, { position: "0.25 0.05 -0.05", color: "#0c0c0c", radius: 0.3 });
        Props.workerFigure(root, { position: "-0.15 0 0.1", color: "#455a64" });
        const cig = Props.el("a-sphere", { position: "-0.08 0.78 0.16", radius: 0.012, color: "#ff8a65",
            material: "emissive: #ff5722; emissiveIntensity: 0.8" });
        root.appendChild(cig);
        Props.smoke(root, { position: "-0.08 0.85 0.16", radius: 0.06 });
        Props.signBoard(root, { position: "0.05 0.05 0.2", rotation: "0 0 78", text: "NO SMOKING" });
    }

    // MOD01_Q09 — LPG cylinder hissing gas at the valve, haze near the floor.
    function MOD01_Q09(root) {
        const cyl = Props.el("a-cylinder", { position: "0 0.2 0", radius: 0.13, height: 0.4, color: "#c0392b" });
        root.appendChild(cyl);
        Props.valve(root, { position: "0 0.42 0.1" });
        Props.gasCloud(root, { position: "0.1 0.05 0.1", color: "#d8d0b8", detectorColor: null });
        Props.wallSurface(root, { position: "0 0.5 -0.4", color: "#2a2320" });
    }

    // MOD01_Q10 — Detonator box close to a heat source (idle engine/exhaust) at a blast site.
    function MOD01_Q10(root) {
        Props.floorPatch(root, { color: "#3a3020", opacity: "0.3", radius: 0.5 });
        Props.crate(root, { position: "-0.2 0.13 0", color: "#b71c1c" });
        Props.vehicle(root, { position: "0.22 0 0", color: "#8d6e40" });
        Props.heatShimmer(root, { position: "0.22 0.35 -0.15" });
    }

    return {
        MOD01_Q01, MOD01_Q02, MOD01_Q03, MOD01_Q04, MOD01_Q05,
        MOD01_Q06, MOD01_Q07, MOD01_Q08, MOD01_Q09, MOD01_Q10
    };
})();
