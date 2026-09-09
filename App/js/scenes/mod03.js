/**
 * SafeAR — Module 3 scene builders: Machine, Vehicle & Electrical Hazard
 * Response. See mod01.js header for the shared conventions.
 */

const Mod03Scenes = (() => {
    // MOD03_Q01 — Exposed rotating conveyor pulley, worker sleeve drifting near it.
    function MOD03_Q01(root) {
        Props.machine(root, { position: "-0.15 0.2 0", width: 0.4, height: 0.3, color: "#455a64" });
        const pulley = Props.el("a-cylinder", { position: "0.15 0.25 0", radius: 0.11, height: 0.12, rotation: "0 0 90", color: "#607d8b",
            animation: "property: rotation; to: 360 0 90; dur: 800; loop: true; easing: linear" });
        root.appendChild(pulley);
        Props.workerFigure(root, { position: "0.4 0 0", color: "#37474f" });
    }

    // MOD03_Q02 — Worker reaching toward a running machine, isolator still ON.
    function MOD03_Q02(root) {
        Props.machine(root, { position: "0.1 0.2 0", width: 0.5, height: 0.35, color: "#546e7a" });
        Props.workerFigure(root, { position: "-0.25 0 0.05", color: "#455a64" });
        const isolator = Props.el("a-box", { position: "-0.35 0.5 0", width: 0.12, height: 0.16, depth: 0.05, color: "#2e7d32" });
        const led = Props.el("a-text", { value: "ON", align: "center", width: 1.4, color: "#a5d6a7", position: "-0.35 0.5 0.03" });
        root.appendChild(isolator); root.appendChild(led);
    }

    // MOD03_Q03 — Reversing dumper truck with a worker in its blind spot.
    function MOD03_Q03(root) {
        Props.floorPatch(root, { color: "#8a6d3b", opacity: "0.35", radius: 0.5 });
        Props.vehicle(root, { position: "-0.15 0 0", color: "#8d6e40" });
        Props.warnZone(root, { position: "0.15 0.02 0", radius: 0.28, color: "#ff1744" });
        Props.workerFigure(root, { position: "0.25 0 0", color: "#37474f" });
    }

    // MOD03_Q04 — Damaged exposed cable near a wet pump-house floor.
    function MOD03_Q04(root) {
        Props.wallSurface(root, { color: "#20292f" });
        Props.pipe(root, { position: "0 0.55 -0.32", radius: 0.02, height: 0.4, color: "#111" });
        Props.sparkParticles(root, { position: "0 0.35 -0.28" });
        Props.floorPatch(root, { color: "#4fc3f7", opacity: "0.35", radius: 0.28 });
        Props.machine(root, { position: "-0.3 0.15 -0.1", width: 0.22, height: 0.24, color: "#455a64" });
    }

    // MOD03_Q05 — Grinding machine without guard/face shield, sparks flying.
    function MOD03_Q05(root) {
        Props.machine(root, { position: "0.15 0.2 0", width: 0.35, height: 0.3, color: "#546e7a" });
        Props.sparkParticles(root, { position: "0.25 0.35 0" });
        Props.workerFigure(root, { position: "-0.15 0 0.05", color: "#455a64" });
        const shield = Props.el("a-box", { position: "-0.05 0.03 0.15", rotation: "90 0 0",
            width: 0.14, height: 0.16, depth: 0.01, color: "#b0bec5", opacity: "0.6" });
        root.appendChild(shield);
    }

    // MOD03_Q06 — Bypassed safety interlock: guard door wedged open, bypass wire visible.
    function MOD03_Q06(root) {
        Props.machine(root, { position: "0 0.2 0", width: 0.55, height: 0.35, color: "#546e7a" });
        const door = Props.el("a-box", { position: "0.28 0.3 0.05", rotation: "0 35 0",
            width: 0.02, height: 0.3, depth: 0.2, color: "#37474f" });
        root.appendChild(door);
        const wire = Props.el("a-cylinder", { position: "0.15 0.42 0.05", radius: 0.006, height: 0.22,
            rotation: "0 0 60", color: "#d32f2f" });
        root.appendChild(wire);
    }

    // MOD03_Q07 — Unauthorised approach to an HT substation/transformer, no barrier or PPE.
    function MOD03_Q07(root) {
        Props.wallSurface(root, { color: "#1c262c" });
        Props.panel(root, { position: "0.05 0.4 -0.3", color: "#37474f" });
        Props.warnZone(root, { position: "0.05 0.02 0", radius: 0.35, color: "#ff9100" });
        Props.workerFigure(root, { position: "0.35 0 0.15", color: "#455a64" });
    }

    // MOD03_Q08 — Vehicle refuelling with the engine still running.
    function MOD03_Q08(root) {
        Props.vehicle(root, { position: "0 0 0", color: "#5d7a40" });
        Props.heatShimmer(root, { position: "-0.18 0.42 0" });
        const nozzle = Props.el("a-cylinder", { position: "0.3 0.2 0", radius: 0.015, height: 0.22,
            rotation: "0 0 60", color: "#455a64" });
        root.appendChild(nozzle);
    }

    // MOD03_Q09 — Frayed haulage wire rope on an underground incline, tub about to attach.
    function MOD03_Q09(root) {
        Props.wallSurface(root, { color: "#211d18" });
        Props.rope(root, { position: "0 0.4 0", height: 0.9, rotation: "0 0 90", color: "#795548" });
        for (let i = 0; i < 5; i++) {
            root.appendChild(Props.el("a-cylinder", {
                position: `${(Math.random() - 0.5) * 0.06} ${0.4 + (Math.random() - 0.5) * 0.05} 0.01`,
                radius: 0.002, height: 0.05, color: "#d7ccc8",
                rotation: `0 0 ${Math.random() * 60 - 30}`
            }));
        }
        const tub = Props.el("a-box", { position: "-0.3 0.08 0", width: 0.16, height: 0.12, depth: 0.14, color: "#546e7a" });
        root.appendChild(tub);
    }

    // MOD03_Q10 — Worker's hand reaching into a running roller nip point to clear a jam.
    function MOD03_Q10(root) {
        Props.rollerPair(root, { position: "0 0.3 0" });
        Props.pile(root, { position: "0 0.02 0.12", color: "#3e3e3e", radius: 0.1 });
        Props.workerFigure(root, { position: "-0.32 0 0.05", color: "#455a64" });
    }

    return {
        MOD03_Q01, MOD03_Q02, MOD03_Q03, MOD03_Q04, MOD03_Q05,
        MOD03_Q06, MOD03_Q07, MOD03_Q08, MOD03_Q09, MOD03_Q10
    };
})();
