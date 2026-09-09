/**
 * SafeAR — Reusable 3D Prop Library (A-Frame primitives)
 *
 * Every one of the 30 scenarios gets its own distinct visual composition
 * (see scenes/mod01.js, mod02.js, mod03.js), but they're all built from this
 * shared, parameterised set of prop builders rather than 30 one-off blocks of
 * unrelated markup — same spirit as the rest of this engine (one reusable
 * system, many configurations).
 *
 * Every function takes a parent <a-entity> and an options object, appends
 * its 3D content to that parent, and returns the root element it created
 * (handy for the caller to further tweak position/rotation).
 */

const Props = (() => {
    function el(tag, attrs) {
        const e = document.createElement(tag);
        Object.entries(attrs || {}).forEach(([k, v]) => e.setAttribute(k, v));
        return e;
    }

    function label3d(parent, text, opts) {
        opts = opts || {};
        const t = el("a-text", {
            value: text,
            align: "center",
            width: opts.width || 2.4,
            color: opts.color || "#ffffff",
            position: opts.position || "0 0.9 0"
        });
        parent.appendChild(t);
        return t;
    }

    function flame(parent, opts) {
        opts = opts || {};
        const pos = opts.position || "0 0.3 0";
        const group = el("a-entity", { position: pos });
        const outer = el("a-sphere", {
            radius: 0.16, color: "#ff6a00",
            material: "emissive: #ff4500; emissiveIntensity: 0.6",
            animation: "property: scale; from: 0.85 0.85 0.85; to: 1.2 1.2 1.2; dur: 380; dir: alternate; loop: true"
        });
        const core = el("a-sphere", {
            radius: 0.08, color: "#ffd400",
            position: "0 0.05 0.02",
            material: "emissive: #ffee00; emissiveIntensity: 0.9",
            animation: "property: scale; from: 0.8 0.8 0.8; to: 1.25 1.25 1.25; dur: 250; dir: alternate; loop: true"
        });
        const glow = el("a-light", { type: "point", color: "#ff8c00", intensity: "0.8", distance: "2", position: "0 0.2 0.1" });
        group.appendChild(outer); group.appendChild(core); group.appendChild(glow);
        group.appendChild(smoke(group, { position: "0 0.4 0" }));
        parent.appendChild(group);
        return group;
    }

    function smoke(parent, opts) {
        opts = opts || {};
        const wisp = el("a-sphere", {
            radius: opts.radius || 0.14, color: "#5a5a5a", opacity: "0.35",
            position: opts.position || "0 0.6 0",
            animation: "property: position; to: 0.06 1.1 0; dur: 1600; loop: true; easing: easeOutSine",
            "animation__fade": "property: opacity; from: 0.35; to: 0; dur: 1600; loop: true"
        });
        parent.appendChild(wisp);
        return wisp;
    }

    function gasCloud(parent, opts) {
        opts = opts || {};
        const color = opts.color || "#c8d9a0";
        const group = el("a-entity", { position: opts.position || "0 0.4 0" });
        [0, 1, 2].forEach(i => {
            const puff = el("a-sphere", {
                radius: 0.14 + i * 0.05, color, opacity: (0.35 - i * 0.06).toFixed(2),
                position: `${i * 0.05} ${i * 0.18} 0`,
                animation: `property: position; to: ${0.08 + i * 0.05} ${0.5 + i * 0.22} 0; dur: ${1400 + i * 250}; loop: true; easing: easeOutSine`,
                "animation__fade": `property: opacity; from: ${(0.35 - i * 0.06).toFixed(2)}; to: 0; dur: ${1400 + i * 250}; loop: true`
            });
            group.appendChild(puff);
        });
        if (opts.detectorColor) {
            const det = el("a-box", { position: "0.3 0.7 0", width: 0.1, height: 0.14, depth: 0.05, color: "#222" });
            const led = el("a-sphere", { radius: 0.02, position: "0 0.04 0.03", color: opts.detectorColor,
                material: `emissive: ${opts.detectorColor}; emissiveIntensity: 0.9`,
                animation: "property: material.emissiveIntensity; from: 0.3; to: 1; dur: 500; dir: alternate; loop: true" });
            det.appendChild(led);
            group.appendChild(det);
        }
        parent.appendChild(group);
        return group;
    }

    function machine(parent, opts) {
        opts = opts || {};
        const box = el("a-box", {
            position: opts.position || "0 0.2 0",
            width: opts.width || 0.6, height: opts.height || 0.4, depth: opts.depth || 0.4,
            color: opts.color || "#546e7a"
        });
        parent.appendChild(box);
        return box;
    }

    function pipe(parent, opts) {
        opts = opts || {};
        const p = el("a-cylinder", {
            position: opts.position || "0 0.4 0",
            radius: opts.radius || 0.05, height: opts.height || 0.3,
            color: opts.color || "#37474f"
        });
        parent.appendChild(p);
        return p;
    }

    function valve(parent, opts) {
        opts = opts || {};
        const group = el("a-entity", { position: opts.position || "0 0.4 0" });
        const body = el("a-cylinder", { radius: 0.05, height: 0.12, color: "#78909c", rotation: "0 0 90" });
        const wheel = el("a-torus", { radius: 0.09, "radius-tubular": 0.012, color: "#ffca28", rotation: "0 0 0", position: "0.08 0 0" });
        group.appendChild(body); group.appendChild(wheel);
        parent.appendChild(group);
        return group;
    }

    function crate(parent, opts) {
        opts = opts || {};
        const c = el("a-box", {
            position: opts.position || "0 0.15 0",
            width: 0.25, height: 0.25, depth: 0.25,
            color: opts.color || "#8d6e63"
        });
        parent.appendChild(c);
        return c;
    }

    function ladder(parent, opts) {
        opts = opts || {};
        const group = el("a-entity", { position: opts.position || "0 0 0", rotation: opts.rotation || "0 0 0" });
        const rail1 = el("a-box", { position: "-0.12 0.5 0", width: 0.03, height: 1.0, depth: 0.03, color: "#ffb300" });
        const rail2 = el("a-box", { position: "0.12 0.5 0", width: 0.03, height: 1.0, depth: 0.03, color: "#ffb300" });
        group.appendChild(rail1); group.appendChild(rail2);
        for (let i = 0; i < 5; i++) {
            const rung = el("a-box", { position: `0 ${0.15 + i * 0.2} 0`, width: 0.24, height: 0.02, depth: 0.03, color: "#ffb300" });
            group.appendChild(rung);
        }
        parent.appendChild(group);
        return group;
    }

    function workerFigure(parent, opts) {
        opts = opts || {};
        const group = el("a-entity", { position: opts.position || "0 0 0" });
        const body = el("a-capsule", { radius: 0.09, height: 0.5, position: "0 0.45 0", color: opts.color || "#455a64" });
        const head = el("a-sphere", { radius: 0.08, position: "0 0.78 0", color: "#e0b088" });
        const helmet = el("a-cone", { "radius-bottom": 0.09, "radius-top": 0.02, height: 0.06, position: "0 0.86 0", color: opts.helmetColor || "#fdd835" });
        group.appendChild(body); group.appendChild(head); group.appendChild(helmet);
        parent.appendChild(group);
        return group;
    }

    function panel(parent, opts) {
        opts = opts || {};
        const p = el("a-box", {
            position: opts.position || "0 0.35 0",
            width: 0.35, height: 0.5, depth: 0.08,
            color: opts.color || "#37474f"
        });
        parent.appendChild(p);
        return p;
    }

    function vehicle(parent, opts) {
        opts = opts || {};
        const group = el("a-entity", { position: opts.position || "0 0 0" });
        const body = el("a-box", { position: "0 0.2 0", width: 0.7, height: 0.28, depth: 0.35, color: opts.color || "#8d6e40" });
        const cab = el("a-box", { position: "-0.15 0.42 0", width: 0.3, height: 0.16, depth: 0.32, color: "#5d4037" });
        [[-0.25, -0.15], [0.25, -0.15], [-0.25, 0.15], [0.25, 0.15]].forEach(([x, z]) => {
            group.appendChild(el("a-cylinder", { position: `${x} 0.08 ${z}`, radius: 0.09, height: 0.06, color: "#222", rotation: "0 0 90" }));
        });
        group.appendChild(body); group.appendChild(cab);
        parent.appendChild(group);
        return group;
    }

    function sparkParticles(parent, opts) {
        opts = opts || {};
        const group = el("a-entity", { position: opts.position || "0 0.3 0" });
        for (let i = 0; i < 4; i++) {
            group.appendChild(el("a-sphere", {
                radius: 0.012, color: "#fff176",
                position: `${(Math.random() - 0.5) * 0.2} 0 ${(Math.random() - 0.5) * 0.2}`,
                material: "emissive: #ffee00; emissiveIntensity: 1",
                animation: `property: position; to: ${(Math.random() - 0.5) * 0.3} ${-0.2 - Math.random() * 0.2} ${(Math.random() - 0.5) * 0.3}; dur: ${300 + i * 80}; loop: true`
            }));
        }
        parent.appendChild(group);
        return group;
    }

    function heatShimmer(parent, opts) {
        opts = opts || {};
        const s = el("a-sphere", {
            radius: 0.13, color: "#ff8a50", opacity: "0.28",
            position: opts.position || "0 0.35 0",
            material: "emissive: #ff7043; emissiveIntensity: 0.3",
            animation: "property: opacity; from: 0.15; to: 0.4; dur: 700; dir: alternate; loop: true"
        });
        parent.appendChild(s);
        return s;
    }

    function signBoard(parent, opts) {
        opts = opts || {};
        const group = el("a-entity", { position: opts.position || "0 0.25 0", rotation: opts.rotation || "0 0 0" });
        const board = el("a-box", { width: 0.3, height: 0.2, depth: 0.02, color: opts.color || "#fdd835" });
        const text = el("a-text", { value: opts.text || "!", align: "center", width: 2, color: "#111", position: "0 0 0.02" });
        group.appendChild(board); group.appendChild(text);
        parent.appendChild(group);
        return group;
    }

    function rope(parent, opts) {
        opts = opts || {};
        const r = el("a-cylinder", {
            position: opts.position || "0 0.4 0",
            radius: 0.02, height: opts.height || 0.8,
            rotation: opts.rotation || "0 0 90",
            color: opts.color || "#795548"
        });
        parent.appendChild(r);
        return r;
    }

    function floorPatch(parent, opts) {
        opts = opts || {};
        const patch = el("a-circle", {
            position: opts.position || "0 0.01 0",
            rotation: "-90 0 0",
            radius: opts.radius || 0.3,
            color: opts.color || "#0d47a1",
            opacity: opts.opacity || "0.55"
        });
        parent.appendChild(patch);
        return patch;
    }

    /** A heap of loose material (coal dust, oily rags, spilled soil) — a
     *  flattened, slightly irregular-looking mound. */
    function pile(parent, opts) {
        opts = opts || {};
        const p = el("a-sphere", {
            position: opts.position || "0 0.05 0",
            radius: opts.radius || 0.16,
            scale: "1.3 0.32 1.1",
            color: opts.color || "#181818",
            material: "roughness: 1; metalness: 0"
        });
        parent.appendChild(p);
        return p;
    }

    /** A vertical backdrop plane standing in for a wall — used whenever a
     *  scenario's environment_conditions call for a vertical surface (wiring,
     *  panels, ladders leant against something, transformer enclosures). */
    function wallSurface(parent, opts) {
        opts = opts || {};
        const wall = el("a-plane", {
            position: opts.position || "0 0.6 -0.35",
            rotation: opts.rotation || "0 0 0",
            width: opts.width || 1.6,
            height: opts.height || 1.3,
            color: opts.color || "#25313a",
            material: "roughness: 1; side: double"
        });
        parent.appendChild(wall);
        return wall;
    }

    /** An overhead plane standing in for a roof/ceiling — for the roof-fall
     *  scenario, where TD04 explicitly names "highest detected surface" as
     *  the practical AR fallback for true ceiling detection. */
    function ceilingSurface(parent, opts) {
        opts = opts || {};
        const ceil = el("a-plane", {
            position: opts.position || "0 1.15 0",
            rotation: "90 0 0",
            width: opts.width || 1.4,
            height: opts.height || 1.4,
            color: opts.color || "#2e2a26",
            material: "roughness: 1; side: double"
        });
        parent.appendChild(ceil);
        return ceil;
    }

    /** A jagged crack decoration (a short chain of thin dark boxes) laid onto
     *  a wall/ceiling/edge to sell "structural failure in progress". */
    function crackLines(parent, opts) {
        opts = opts || {};
        const group = el("a-entity", { position: opts.position || "0 0 0.01", rotation: opts.rotation || "0 0 0" });
        let x = 0, y = 0;
        for (let i = 0; i < 5; i++) {
            const seg = el("a-box", {
                position: `${x} ${y} 0`,
                width: 0.02, height: 0.09 + Math.random() * 0.05, depth: 0.005,
                rotation: `0 0 ${(Math.random() - 0.5) * 50}`,
                color: "#050505"
            });
            group.appendChild(seg);
            x += (Math.random() - 0.5) * 0.08;
            y -= 0.07;
        }
        parent.appendChild(group);
        return group;
    }

    /** A drop-off/edge indicator — a bright guide line plus a few crumbling
     *  debris particles — for bench/platform/shaft-edge hazards where TD05
     *  says a virtual edge marker substitutes for true edge detection. */
    function edgeMarker(parent, opts) {
        opts = opts || {};
        const group = el("a-entity", { position: opts.position || "0 0.01 -0.3" });
        const line = el("a-box", {
            width: opts.width || 1.2, height: 0.01, depth: 0.03,
            color: "#ff6d00", opacity: "0.85",
            animation: "property: material.opacity; from: 0.5; to: 0.95; dur: 650; dir: alternate; loop: true"
        });
        group.appendChild(line);
        for (let i = 0; i < 3; i++) {
            group.appendChild(el("a-sphere", {
                radius: 0.015, color: "#8d6e63",
                position: `${(Math.random() - 0.5) * 0.6} 0 0.05`,
                animation: `property: position; to: ${(Math.random() - 0.5) * 0.6} -0.5 ${0.1 + Math.random() * 0.2}; dur: ${900 + i * 150}; loop: true; easing: easeInSine`
            }));
        }
        parent.appendChild(group);
        return group;
    }

    /** A small analogue dial with a sweeping needle — used as a rising
     *  temperature/pressure/gas-concentration gauge counting toward danger. */
    function gaugeDial(parent, opts) {
        opts = opts || {};
        const group = el("a-entity", { position: opts.position || "0 0.55 0" });
        const face = el("a-cylinder", { radius: 0.09, height: 0.015, color: "#111", rotation: "90 0 0" });
        const needle = el("a-box", {
            width: 0.075, height: 0.008, depth: 0.008, color: opts.needleColor || "#ff3d00",
            position: "0.03 0 0.01",
            animation: "property: rotation; from: 0 0 -70; to: 0 0 70; dur: " + (opts.durMs || 3000) + "; loop: true; easing: easeInOutSine"
        });
        group.appendChild(face); group.appendChild(needle);
        parent.appendChild(group);
        return group;
    }

    /** A striped caution barrier looped around a hazard zone — approximated
     *  as short alternating-colour segments rather than one continuous mesh. */
    function tapeBarrier(parent, opts) {
        opts = opts || {};
        const group = el("a-entity", { position: opts.position || "0 0.35 0" });
        const radius = opts.radius || 0.28;
        const segs = opts.segments || 10;
        for (let i = 0; i < segs; i++) {
            const angle = (i / segs) * Math.PI * 2;
            group.appendChild(el("a-box", {
                position: `${Math.cos(angle) * radius} 0 ${Math.sin(angle) * radius}`,
                rotation: `0 ${-angle * (180 / Math.PI)} 0`,
                width: 0.06, height: 0.02, depth: 0.02,
                color: i % 2 === 0 ? "#fdd835" : "#111"
            }));
        }
        parent.appendChild(group);
        return group;
    }

    /** Two close-set cylinders forming an in-running nip point between rollers. */
    function rollerPair(parent, opts) {
        opts = opts || {};
        const group = el("a-entity", { position: opts.position || "0 0.3 0" });
        const r1 = el("a-cylinder", { position: "-0.09 0 0", radius: 0.09, height: 0.3, color: "#455a64", rotation: "0 0 90",
            animation: "property: rotation; to: 360 0 90; dur: 900; loop: true; easing: linear" });
        const r2 = el("a-cylinder", { position: "0.09 0 0", radius: 0.09, height: 0.3, color: "#546e7a", rotation: "0 0 90",
            animation: "property: rotation; to: -360 0 90; dur: 900; loop: true; easing: linear" });
        group.appendChild(r1); group.appendChild(r2);
        parent.appendChild(group);
        return group;
    }

    /** A load box swinging on a cable — overhead crane / suspended-load hazard. */
    function hangingLoad(parent, opts) {
        opts = opts || {};
        const group = el("a-entity", { position: opts.position || "0 0.95 0",
            animation: "property: rotation; from: 0 0 -12; to: 0 0 12; dur: 1400; dir: alternate; loop: true" });
        const cable = el("a-cylinder", { radius: 0.008, height: 0.5, position: "0 -0.25 0", color: "#333" });
        const load = el("a-box", { position: "0 -0.55 0", width: 0.22, height: 0.16, depth: 0.22, color: "#78909c" });
        group.appendChild(cable); group.appendChild(load);
        parent.appendChild(group);
        return group;
    }

    /** A pulsing translucent warning-zone disc — arc-flash zones, blind-spot
     *  cones, and similar "danger radius" overlays. */
    function warnZone(parent, opts) {
        opts = opts || {};
        const zone = el("a-cylinder", {
            position: opts.position || "0 0.02 0",
            radius: opts.radius || 0.35, height: 0.01,
            color: opts.color || "#ff1744",
            opacity: "0.3",
            animation: "property: opacity; from: 0.18; to: 0.4; dur: 700; dir: alternate; loop: true"
        });
        parent.appendChild(zone);
        return zone;
    }

    return {
        el, label3d, flame, smoke, gasCloud, machine, pipe, valve, crate, ladder,
        workerFigure, panel, vehicle, sparkParticles, heatShimmer, signBoard, rope, floorPatch,
        pile, wallSurface, ceilingSurface, crackLines, edgeMarker, gaugeDial, tapeBarrier,
        rollerPair, hangingLoad, warnZone
    };
})();
