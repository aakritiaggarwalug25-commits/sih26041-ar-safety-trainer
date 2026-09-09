/**
 * SafeAR — Module 2 scene builders: Fall, Roof Collapse & Working-at-Height
 * Hazard Response. See mod01.js header for the shared conventions.
 */

const Mod02Scenes = (() => {
    // MOD02_Q01 — Cracked, unsupported roof with falling debris in an underground gallery.
    function MOD02_Q01(root) {
        Props.ceilingSurface(root, { color: "#2b2620" });
        Props.crackLines(root, { position: "0.05 1.1 0", rotation: "0 0 0" });
        for (let i = 0; i < 3; i++) {
            const chip = Props.el("a-box", {
                position: `${(Math.random() - 0.5) * 0.3} 1.0 ${(Math.random() - 0.5) * 0.2}`,
                width: 0.02, height: 0.02, depth: 0.02, color: "#3e3428",
                animation: `property: position; to: ${(Math.random() - 0.5) * 0.3} 0.05 ${(Math.random() - 0.5) * 0.2}; dur: ${1400 + i * 200}; loop: true; easing: easeInSine`
            });
            root.appendChild(chip);
        }
    }

    // MOD02_Q02 — Dark open shaft/floor opening with no barricade.
    function MOD02_Q02(root) {
        Props.floorPatch(root, { color: "#050505", opacity: "0.9", radius: 0.24 });
        Props.floorPatch(root, { color: "#1a1a1a", opacity: "0.5", radius: 0.34 });
    }

    // MOD02_Q03 — Worker at a platform edge with an unattached harness lanyard.
    function MOD02_Q03(root) {
        Props.floorPatch(root, { color: "#33404a", opacity: "0.3", radius: 0.5 });
        Props.workerFigure(root, { position: "0 0 0", color: "#37474f" });
        Props.rope(root, { position: "0.12 0.55 0", height: 0.35, rotation: "0 0 15", color: "#c9a227" });
        const anchor = Props.el("a-torus", { position: "-0.2 0.7 -0.2", radius: 0.04, "radius-tubular": 0.008, color: "#ffca28" });
        root.appendChild(anchor);
        Props.edgeMarker(root, { position: "0 0.01 -0.35", width: 1.0 });
    }

    // MOD02_Q04 — Ladder leaning against a wall at an unstable angle.
    function MOD02_Q04(root) {
        Props.wallSurface(root, { color: "#2a3339" });
        Props.ladder(root, { position: "0 0 -0.15", rotation: "0 0 32" });
    }

    // MOD02_Q05 — Crumbling bench edge at an opencast mine face.
    function MOD02_Q05(root) {
        Props.floorPatch(root, { color: "#8a6d3b", opacity: "0.4", radius: 0.5 });
        Props.edgeMarker(root, { position: "0 0.01 -0.3", width: 1.2 });
        Props.crackLines(root, { position: "0 0.02 -0.28", rotation: "90 0 0" });
    }

    // MOD02_Q06 — Uncovered floor grating during maintenance, cover leaning aside.
    function MOD02_Q06(root) {
        Props.floorPatch(root, { color: "#0a0a0a", opacity: "0.85", radius: 0.22 });
        const cover = Props.el("a-box", { position: "0.32 0.1 0", rotation: "0 0 70",
            width: 0.4, height: 0.02, depth: 0.4, color: "#607d8b" });
        root.appendChild(cover);
    }

    // MOD02_Q07 — Stacked material teetering at an edge with no toe-board.
    function MOD02_Q07(root) {
        Props.floorPatch(root, { color: "#3a3a3a", opacity: "0.3", radius: 0.5 });
        Props.edgeMarker(root, { position: "0 0.01 -0.3", width: 1.1 });
        Props.crate(root, { position: "0.1 0.13 -0.15", color: "#8d6e63" });
        const teeter = Props.crate(root, { position: "0.05 0.4 -0.22", color: "#a1887f" });
        teeter.setAttribute("animation", "property: rotation; from: 0 0 -6; to: 0 0 6; dur: 500; dir: alternate; loop: true");
    }

    // MOD02_Q08 — Worker climbing stacked crates instead of using a nearby ladder.
    function MOD02_Q08(root) {
        Props.crate(root, { position: "-0.1 0.13 0", color: "#8d6e63" });
        Props.crate(root, { position: "-0.1 0.36 0", color: "#795548" });
        Props.workerFigure(root, { position: "-0.05 0.15 0.05", color: "#455a64" });
        Props.ladder(root, { position: "0.3 0 0.1", rotation: "0 0 82" });
    }

    // MOD02_Q09 — Reflective wet patch, worker approaching, no warning signage.
    function MOD02_Q09(root) {
        Props.floorPatch(root, { color: "#4fc3f7", opacity: "0.4", radius: 0.3 });
        Props.workerFigure(root, { position: "0.4 0 0.05", color: "#455a64" });
    }

    // MOD02_Q10 — Suspended crane load swinging over a walkway with a worker beneath.
    function MOD02_Q10(root) {
        Props.hangingLoad(root, { position: "0 0.95 0" });
        Props.warnZone(root, { position: "0 0.02 0", radius: 0.3, color: "#ffab00" });
        Props.workerFigure(root, { position: "0.05 0 0.1", color: "#37474f" });
    }

    return {
        MOD02_Q01, MOD02_Q02, MOD02_Q03, MOD02_Q04, MOD02_Q05,
        MOD02_Q06, MOD02_Q07, MOD02_Q08, MOD02_Q09, MOD02_Q10
    };
})();
