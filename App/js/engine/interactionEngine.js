/**
 * SafeAR — InteractionEngine
 *
 * ONE reusable engine for every interaction type in the JSON. It knows nothing
 * about individual scenarios — it is handed a config object (from
 * INTERACTION_CONFIGS, keyed by question_id) and a mount point, and renders the
 * actual tap / tap-hold / drag / rotate / swipe controls needed, tracking
 * attempts and elapsed time, and reporting back a single structured result.
 *
 * The 3D scene (App/js/scenes/*.js) is purely the visual hazard backdrop — it
 * never has to know how to be tapped, held, dragged or rotated. This control
 * panel renders separately, below/beside the scene, per the "never cover the
 * hazard with UI" requirement.
 *
 * Primitives implemented: TAP, TAP_HOLD, DRAG, DRAG_MULTI (repeated DRAG),
 * ROTATE (atLeast / toTarget), SWIPE, PHYSICAL_MOVE (a mini floor-map DRAG —
 * the JSON's own stated fallback, TD06, for when true world-position tracking
 * isn't available), and COMPOSITE (an ordered sequence of any of the above).
 */

const InteractionEngine = (() => {
    function label(field) { return I18n.field(field); }

    /**
     * Mount an interaction for one question. Returns a handle with .destroy().
     *
     * @param {HTMLElement} root       container to render controls into (cleared first)
     * @param {Object} config          entry from INTERACTION_CONFIGS
     * @param {Object} callbacks       { onAttempt(count), onComplete({attempts,timeTakenMs}) }
     */
    function mount(root, config, callbacks) {
        root.innerHTML = "";
        root.classList.add("interaction-panel");

        let attempts = 0;
        let finished = false;
        const startedAt = Date.now();
        let cleanupFns = [];

        function bumpAttempt() {
            attempts++;
            if (callbacks.onAttempt) callbacks.onAttempt(attempts);
        }

        function finish() {
            if (finished) return;
            finished = true;
            cleanupFns.forEach(fn => { try { fn(); } catch (e) {} });
            if (callbacks.onComplete) {
                callbacks.onComplete({ attempts, timeTakenMs: Date.now() - startedAt });
            }
        }

        function runSteps(steps, idx) {
            if (idx >= steps.length) { finish(); return; }
            const stepRoot = document.createElement("div");
            stepRoot.className = "interaction-step";
            root.innerHTML = "";
            root.appendChild(stepRoot);
            const stepLabel = document.createElement("div");
            stepLabel.className = "interaction-step-label";
            stepLabel.textContent = "Step " + (idx + 1) + " / " + steps.length;
            stepRoot.appendChild(stepLabel);

            const cleanup = renderPrimitive(stepRoot, steps[idx], bumpAttempt, () => runSteps(steps, idx + 1));
            cleanupFns.push(cleanup);
        }

        if (config.primitive === "COMPOSITE") {
            runSteps(config.steps, 0);
        } else if (config.primitive === "DRAG_MULTI") {
            const cleanup = renderDragMulti(root, config.objects, bumpAttempt, finish);
            cleanupFns.push(cleanup);
        } else {
            const cleanup = renderPrimitive(root, config, bumpAttempt, finish);
            cleanupFns.push(cleanup);
        }

        return {
            destroy() { cleanupFns.forEach(fn => { try { fn(); } catch (e) {} }); }
        };
    }

    function renderPrimitive(root, cfg, onAttempt, onDone) {
        switch (cfg.primitive || cfg.type) {
            case "TAP": return renderTap(root, cfg, onAttempt, onDone);
            case "TAP_HOLD": return renderTapHold(root, cfg, onAttempt, onDone);
            case "DRAG": return renderDrag(root, cfg, onAttempt, onDone);
            case "ROTATE": return renderRotate(root, cfg, onAttempt, onDone);
            case "SWIPE": return renderSwipe(root, cfg, onAttempt, onDone);
            case "PHYSICAL_MOVE": return renderPhysicalMove(root, cfg, onAttempt, onDone);
            default:
                console.warn("[InteractionEngine] Unknown primitive", cfg);
                return () => {};
        }
    }

    function makeBtn(text, extraClass) {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "interaction-btn " + (extraClass || "");
        b.textContent = text;
        return b;
    }

    // ---------------------------------------------------------------- TAP
    function renderTap(root, cfg, onAttempt, onDone) {
        const wrap = document.createElement("div");
        wrap.className = "interaction-tap-row";
        const target = makeBtn(label(cfg.target), "tap-target");
        wrap.appendChild(target);
        let distractorEl = null;
        if (cfg.distractor) {
            distractorEl = makeBtn(label(cfg.distractor), "tap-distractor");
            wrap.appendChild(distractorEl);
        }
        root.appendChild(wrap);

        function onTargetClick() { onDone(); }
        function onDistractorClick() { onAttempt(); wrap.classList.add("shake"); setTimeout(() => wrap.classList.remove("shake"), 350); }

        target.addEventListener("click", onTargetClick);
        if (distractorEl) distractorEl.addEventListener("click", onDistractorClick);

        return () => {
            target.removeEventListener("click", onTargetClick);
            if (distractorEl) distractorEl.removeEventListener("click", onDistractorClick);
        };
    }

    // ---------------------------------------------------------- TAP_HOLD
    function renderTapHold(root, cfg, onAttempt, onDone) {
        const wrap = document.createElement("div");
        wrap.className = "interaction-tap-row";
        const target = makeBtn(label(cfg.target), "tap-hold-target");
        const ring = document.createElement("div");
        ring.className = "hold-progress";
        target.appendChild(ring);
        wrap.appendChild(target);

        let distractorEl = null;
        if (cfg.distractor) {
            distractorEl = makeBtn(label(cfg.distractor), "tap-distractor");
            wrap.appendChild(distractorEl);
        }
        root.appendChild(wrap);

        let holdTimer = null;
        let holdStart = null;
        const holdMs = cfg.holdMs || 2000;

        function startHold(e) {
            e.preventDefault();
            holdStart = Date.now();
            ring.style.transition = "width " + holdMs + "ms linear";
            requestAnimationFrame(() => { ring.style.width = "100%"; });
            holdTimer = setTimeout(() => { onDone(); }, holdMs);
        }
        function cancelHold() {
            if (holdTimer) {
                clearTimeout(holdTimer);
                holdTimer = null;
                const held = holdStart ? (Date.now() - holdStart) : 0;
                ring.style.transition = "none";
                ring.style.width = "0%";
                if (held > 150 && held < holdMs) onAttempt();
            }
        }
        function onDistractorDown() { onAttempt(); wrap.classList.add("shake"); setTimeout(() => wrap.classList.remove("shake"), 350); }

        target.addEventListener("pointerdown", startHold);
        target.addEventListener("pointerup", cancelHold);
        target.addEventListener("pointerleave", cancelHold);
        if (distractorEl) distractorEl.addEventListener("pointerdown", onDistractorDown);

        return () => {
            target.removeEventListener("pointerdown", startHold);
            target.removeEventListener("pointerup", cancelHold);
            target.removeEventListener("pointerleave", cancelHold);
            if (distractorEl) distractorEl.removeEventListener("pointerdown", onDistractorDown);
            if (holdTimer) clearTimeout(holdTimer);
        };
    }

    // -------------------------------------------------------------- DRAG
    function renderDrag(root, cfg, onAttempt, onDone, opts) {
        opts = opts || {};
        const stage = document.createElement("div");
        stage.className = "interaction-drag-stage";

        const zoneEls = [];
        const zones = cfg.zones || [cfg.zone];
        zones.filter(Boolean).forEach(z => {
            const zEl = document.createElement("div");
            zEl.className = "drop-zone";
            zEl.dataset.zoneId = z.id;
            zEl.textContent = label(z);
            stage.appendChild(zEl);
            zoneEls.push(zEl);
        });

        const obj = document.createElement("div");
        obj.className = "drag-object";
        obj.textContent = label(cfg.object);
        stage.appendChild(obj);
        root.appendChild(stage);

        let dragging = false;
        let startX, startY, origLeft, origTop;

        function pointerDown(e) {
            dragging = true;
            obj.classList.add("dragging");
            startX = e.clientX; startY = e.clientY;
            const r = obj.getBoundingClientRect();
            const sr = stage.getBoundingClientRect();
            origLeft = r.left - sr.left; origTop = r.top - sr.top;
            // .drag-object is positioned via CSS `bottom` initially; once we
            // start driving it with an explicit `top`, clear `bottom` too —
            // otherwise an absolutely-positioned, auto-height box with BOTH
            // top and bottom set stretches to fill the gap between them,
            // silently inflating the element's height and throwing off the
            // drop-zone hit test in pointerUp().
            obj.style.bottom = "auto";
            obj.style.left = origLeft + "px";
            obj.style.top = origTop + "px";
            obj.setPointerCapture && obj.setPointerCapture(e.pointerId);
        }
        function pointerMove(e) {
            if (!dragging) return;
            const dx = e.clientX - startX, dy = e.clientY - startY;
            obj.style.left = (origLeft + dx) + "px";
            obj.style.top = (origTop + dy) + "px";
        }
        function pointerUp() {
            if (!dragging) return;
            dragging = false;
            obj.classList.remove("dragging");
            const objRect = obj.getBoundingClientRect();
            const objCx = objRect.left + objRect.width / 2;
            const objCy = objRect.top + objRect.height / 2;

            let hitZone = null;
            for (const zEl of zoneEls) {
                const zr = zEl.getBoundingClientRect();
                if (objCx >= zr.left && objCx <= zr.right && objCy >= zr.top && objCy <= zr.bottom) {
                    hitZone = zEl.dataset.zoneId;
                    break;
                }
            }
            if (hitZone && hitZone === cfg.zoneId) {
                obj.classList.add("placed");
                onDone();
            } else if (hitZone) {
                onAttempt();
                snapBack();
            } else {
                snapBack();
            }
        }
        function snapBack() {
            obj.style.transition = "left 0.25s ease, top 0.25s ease";
            obj.style.left = origLeft + "px";
            obj.style.top = origTop + "px";
            setTimeout(() => { obj.style.transition = ""; }, 260);
        }

        obj.addEventListener("pointerdown", pointerDown);
        window.addEventListener("pointermove", pointerMove);
        window.addEventListener("pointerup", pointerUp);

        // Single-zone convenience: cfg.zone.id is the required destination.
        const requiredZoneId = (cfg.zone && cfg.zone.id) || cfg.zoneId;
        cfg.zoneId = requiredZoneId;

        return () => {
            obj.removeEventListener("pointerdown", pointerDown);
            window.removeEventListener("pointermove", pointerMove);
            window.removeEventListener("pointerup", pointerUp);
        };
    }

    // ------------------------------------------------------- DRAG_MULTI
    function renderDragMulti(root, objects, onAttempt, onAllDone) {
        const stage = document.createElement("div");
        stage.className = "interaction-drag-stage interaction-drag-multi";
        root.appendChild(stage);

        const zoneIds = [...new Set(objects.map(o => o.zone))];
        const zoneEls = {};
        zoneIds.forEach(zid => {
            const zEl = document.createElement("div");
            zEl.className = "drop-zone";
            zEl.dataset.zoneId = zid;
            zEl.textContent = zid;
            stage.appendChild(zEl);
            zoneEls[zid] = zEl;
        });

        let remaining = objects.length;
        const cleanups = [];

        objects.forEach(objCfg => {
            const obj = document.createElement("div");
            obj.className = "drag-object";
            obj.textContent = label(objCfg);
            stage.appendChild(obj);

            let dragging = false, startX, startY, origLeft, origTop, done = false;

            function pointerDown(e) {
                if (done) return;
                dragging = true;
                obj.classList.add("dragging");
                startX = e.clientX; startY = e.clientY;
                const r = obj.getBoundingClientRect(), sr = stage.getBoundingClientRect();
                origLeft = r.left - sr.left; origTop = r.top - sr.top;
                // See renderDrag()'s pointerDown for why `bottom` must be
                // cleared before driving position via an explicit `top`.
                obj.style.bottom = "auto";
                obj.style.left = origLeft + "px";
                obj.style.top = origTop + "px";
            }
            function pointerMove(e) {
                if (!dragging) return;
                obj.style.left = (origLeft + (e.clientX - startX)) + "px";
                obj.style.top = (origTop + (e.clientY - startY)) + "px";
            }
            function pointerUp() {
                if (!dragging) return;
                dragging = false;
                obj.classList.remove("dragging");
                const objRect = obj.getBoundingClientRect();
                const cx = objRect.left + objRect.width / 2, cy = objRect.top + objRect.height / 2;
                const zEl = zoneEls[objCfg.zone];
                const zr = zEl.getBoundingClientRect();
                if (cx >= zr.left && cx <= zr.right && cy >= zr.top && cy <= zr.bottom) {
                    obj.classList.add("placed");
                    done = true;
                    remaining--;
                    if (remaining <= 0) onAllDone();
                } else {
                    obj.style.transition = "left 0.25s ease, top 0.25s ease";
                    obj.style.left = origLeft + "px";
                    obj.style.top = origTop + "px";
                    setTimeout(() => { obj.style.transition = ""; }, 260);
                }
            }

            obj.addEventListener("pointerdown", pointerDown);
            window.addEventListener("pointermove", pointerMove);
            window.addEventListener("pointerup", pointerUp);
            cleanups.push(() => {
                obj.removeEventListener("pointerdown", pointerDown);
                window.removeEventListener("pointermove", pointerMove);
                window.removeEventListener("pointerup", pointerUp);
            });
        });

        return () => cleanups.forEach(fn => fn());
    }

    // ----------------------------------------------------------- ROTATE
    function renderRotate(root, cfg, onAttempt, onDone) {
        const wrap = document.createElement("div");
        wrap.className = "interaction-rotate-wrap";
        const dial = document.createElement("div");
        dial.className = "rotate-dial";
        const handle = document.createElement("div");
        handle.className = "rotate-handle";
        dial.appendChild(handle);
        const labelEl = document.createElement("div");
        labelEl.className = "rotate-label";
        labelEl.textContent = label(cfg.target);
        wrap.appendChild(labelEl);
        wrap.appendChild(dial);
        root.appendChild(wrap);

        let dragging = false;
        let lastAngle = null;
        let cumulative = 0;
        const minDegrees = cfg.minDegrees || 270;
        const targetDegrees = cfg.targetDegrees;
        const tolerance = cfg.toleranceDegrees || 10;

        function angleFor(e) {
            const r = dial.getBoundingClientRect();
            const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
            const dx = e.clientX - cx, dy = e.clientY - cy;
            return Math.atan2(dy, dx) * (180 / Math.PI);
        }
        function setHandleAngle(deg) {
            handle.style.transform = "rotate(" + deg + "deg)";
        }

        let currentAngle = 0;

        function pointerDown(e) {
            dragging = true;
            lastAngle = angleFor(e);
        }
        function pointerMove(e) {
            if (!dragging) return;
            const a = angleFor(e);
            let delta = a - lastAngle;
            if (delta > 180) delta -= 360;
            if (delta < -180) delta += 360;
            cumulative += Math.abs(delta);
            currentAngle = (currentAngle + delta + 360) % 360;
            setHandleAngle(currentAngle);
            lastAngle = a;

            if (cfg.mode === "atLeast" && cumulative >= minDegrees) {
                onDone();
                dragging = false;
            }
        }
        function pointerUp() {
            if (!dragging) return;
            dragging = false;
            if (cfg.mode === "toTarget") {
                const diff = Math.min(Math.abs(currentAngle - targetDegrees), 360 - Math.abs(currentAngle - targetDegrees));
                if (diff <= tolerance) {
                    onDone();
                } else {
                    onAttempt();
                }
            }
        }

        dial.addEventListener("pointerdown", pointerDown);
        window.addEventListener("pointermove", pointerMove);
        window.addEventListener("pointerup", pointerUp);

        return () => {
            dial.removeEventListener("pointerdown", pointerDown);
            window.removeEventListener("pointermove", pointerMove);
            window.removeEventListener("pointerup", pointerUp);
        };
    }

    // ------------------------------------------------------------ SWIPE
    function renderSwipe(root, cfg, onAttempt, onDone) {
        const wrap = document.createElement("div");
        wrap.className = "interaction-swipe-wrap";
        const track = document.createElement("div");
        track.className = "swipe-track";
        const handle = document.createElement("div");
        handle.className = "swipe-handle";
        track.appendChild(handle);
        const labelEl = document.createElement("div");
        labelEl.className = "swipe-label";
        labelEl.textContent = label(cfg.target);
        wrap.appendChild(labelEl);
        wrap.appendChild(track);
        root.appendChild(wrap);

        const threshold = 70;
        let dragging = false, startY = 0;

        function pointerDown(e) { dragging = true; startY = e.clientY; }
        function pointerMove(e) {
            if (!dragging) return;
            let dy = e.clientY - startY;
            dy = Math.max(-100, Math.min(100, dy));
            handle.style.transform = "translateY(" + dy + "px)";
        }
        function pointerUp(e) {
            if (!dragging) return;
            dragging = false;
            const dy = e.clientY - startY;
            const wantUp = cfg.direction === "up";
            const success = wantUp ? (dy <= -threshold) : (dy >= threshold);
            handle.style.transition = "transform 0.2s ease";
            handle.style.transform = "translateY(0px)";
            setTimeout(() => { handle.style.transition = ""; }, 210);
            if (success) onDone(); else onAttempt();
        }

        handle.addEventListener("pointerdown", pointerDown);
        window.addEventListener("pointermove", pointerMove);
        window.addEventListener("pointerup", pointerUp);

        return () => {
            handle.removeEventListener("pointerdown", pointerDown);
            window.removeEventListener("pointermove", pointerMove);
            window.removeEventListener("pointerup", pointerUp);
        };
    }

    // ------------------------------------------------------ PHYSICAL_MOVE
    // JSON's own stated fallback (TD06) for when true world-position tracking
    // is unavailable: a mini floor-map the trainee drags their position on.
    function renderPhysicalMove(root, cfg, onAttempt, onDone) {
        const wrap = document.createElement("div");
        wrap.className = "interaction-move-wrap";
        const hint = document.createElement("div");
        hint.className = "move-hint";
        hint.textContent = label(cfg.zone);
        wrap.appendChild(hint);

        const map = document.createElement("div");
        map.className = "floor-map";
        const zoneEl = document.createElement("div");
        zoneEl.className = "floor-map-zone";
        map.appendChild(zoneEl);
        const dot = document.createElement("div");
        dot.className = "floor-map-avatar";
        dot.style.left = "20%";
        dot.style.top = "50%";
        map.appendChild(dot);
        wrap.appendChild(map);
        root.appendChild(wrap);

        let dragging = false;

        function pointerDown() { dragging = true; }
        function pointerMove(e) {
            if (!dragging) return;
            const r = map.getBoundingClientRect();
            let x = ((e.clientX - r.left) / r.width) * 100;
            let y = ((e.clientY - r.top) / r.height) * 100;
            x = Math.max(2, Math.min(98, x));
            y = Math.max(2, Math.min(98, y));
            dot.style.left = x + "%";
            dot.style.top = y + "%";
        }
        function pointerUp() {
            if (!dragging) return;
            dragging = false;
            const dotRect = dot.getBoundingClientRect();
            const zoneRect = zoneEl.getBoundingClientRect();
            const cx = dotRect.left + dotRect.width / 2, cy = dotRect.top + dotRect.height / 2;
            if (cx >= zoneRect.left && cx <= zoneRect.right && cy >= zoneRect.top && cy <= zoneRect.bottom) {
                onDone();
            } else {
                onAttempt();
            }
        }

        dot.addEventListener("pointerdown", pointerDown);
        window.addEventListener("pointermove", pointerMove);
        window.addEventListener("pointerup", pointerUp);

        return () => {
            dot.removeEventListener("pointerdown", pointerDown);
            window.removeEventListener("pointermove", pointerMove);
            window.removeEventListener("pointerup", pointerUp);
        };
    }

    return { mount };
})();
