/**
 * SafeAR — ARManager
 *
 * ONE A-Frame scene, two ways of looking at it:
 *
 *   AR MODE        — a REAL WebXR immersive-ar session, started only on an
 *                     explicit user action (the trainee's own "Start AR
 *                     Training" button — see App/js/training.js), and only
 *                     ever reported as active once navigator.xr has actually
 *                     granted and started that session. Checking
 *                     `isSessionSupported("immersive-ar")` earlier in the flow
 *                     (EnvironmentManager.probeWebXRAR) only decides whether
 *                     the AR option is OFFERED — it is never treated as if AR
 *                     were already running.
 *
 *   SIMULATION MODE — the same scene rendered as an ordinary orbit-able 3D
 *                     view (look-controls), no camera required. This is the
 *                     reliable, always-available path — every browser/device
 *                     can complete training this way.
 *
 * The per-question 3D content itself (App/js/scenes/*.js) is identical in
 * both modes — it's just handed a root <a-entity> to populate; scene builders
 * are never touched by anything in this file.
 *
 * Real-surface placement: once an AR session is active, this module opens a
 * WebXR hit-test source and drives a placement reticle every frame (via a
 * tiny A-Frame tick component — A-Frame has no built-in high-level hit-test
 * API, so this part is hand-rolled against the raw WebXR Device API). The
 * trainee taps the detected surface (the session's native "select" input
 * event) to anchor #hazardRoot there. If hit-test genuinely isn't available
 * (feature not granted, or no surface ever found), the documented fallback
 * from the JSON's own technical_dependencies table applies: anchor to a
 * "floating marker" a fixed distance in front of wherever the trainee is
 * currently looking, computed from the session's own live viewer pose (never
 * a static scene-local coordinate) — never presented as real surface
 * placement, only ever offered as an explicit, separately-labelled manual
 * fallback button.
 */

const ARManager = (() => {
    let sceneEl = null;
    let rootEl = null;
    let reticleEl = null;
    let mode = "simulation"; // "simulation" | "ar"

    let arSupported = false;
    let xrSession = null;
    let hitTestSource = null;
    let lastHitPose = null;
    let lastViewerPose = null;
    let placementCallbacks = null; // { onReticleVisible, onPlaced, onSessionEnded, onError }

    const TICK_COMPONENT = "safear-xr-tick";

    function ensureTickComponentRegistered() {
        if (typeof AFRAME === "undefined" || AFRAME.components[TICK_COMPONENT]) return;
        AFRAME.registerComponent(TICK_COMPONENT, {
            tick: function () {
                pollHitTest();
            }
        });
    }

    function ensureScene(mountEl) {
        if (sceneEl) return sceneEl;

        mountEl.innerHTML = "";
        const scene = document.createElement("a-scene");
        scene.setAttribute("embedded", "");
        // We drive session entry/exit ourselves via ARManager.enterAR()/exitAR()
        // from the trainee's own "Start AR Training" button — A-Frame's default
        // corner enter-AR button is disabled so there is exactly one way in.
        scene.setAttribute("vr-mode-ui", "enabled: false");
        scene.setAttribute("renderer", "colorManagement: true; logarithmicDepthBuffer: true;");
        scene.setAttribute("webxr", "optionalFeatures: hit-test, dom-overlay, local-floor; overlayElement: #trainingOverlay;");
        scene.setAttribute("background", "color: #05131f");

        // Simulation-mode "room" — a simple floor + ambient light, invisible/
        // irrelevant once a real AR session takes over the camera feed.
        const floor = document.createElement("a-plane");
        floor.setAttribute("id", "simFloor");
        floor.setAttribute("rotation", "-90 0 0");
        floor.setAttribute("width", "10");
        floor.setAttribute("height", "10");
        floor.setAttribute("color", "#0b1b2b");
        floor.setAttribute("material", "roughness: 1; metalness: 0;");
        scene.appendChild(floor);

        const light = document.createElement("a-light");
        light.setAttribute("type", "ambient");
        light.setAttribute("color", "#8ea9c9");
        light.setAttribute("intensity", "0.9");
        scene.appendChild(light);
        const dirLight = document.createElement("a-light");
        dirLight.setAttribute("type", "directional");
        dirLight.setAttribute("position", "1 3 1");
        dirLight.setAttribute("intensity", "0.6");
        scene.appendChild(dirLight);

        const rig = document.createElement("a-entity");
        rig.setAttribute("id", "cameraRig");
        rig.setAttribute("position", "0 1.2 2.2");
        const camera = document.createElement("a-camera");
        camera.setAttribute("look-controls", "reverseMouseDrag: false");
        camera.setAttribute("wasd-controls", "enabled: false");
        rig.appendChild(camera);
        scene.appendChild(rig);

        const root = document.createElement("a-entity");
        root.setAttribute("id", "hazardRoot");
        root.setAttribute("position", "0 0.4 0");
        scene.appendChild(root);

        // Placement reticle — only ever shown while AR hit-test is actively
        // searching for a surface (see startPlacementSearch()).
        const reticle = document.createElement("a-ring");
        reticle.setAttribute("id", "placementReticle");
        reticle.setAttribute("radius-inner", "0.06");
        reticle.setAttribute("radius-outer", "0.09");
        reticle.setAttribute("rotation", "-90 0 0");
        reticle.setAttribute("material", "color: #22c8ff; shader: flat; side: double; opacity: 0.9;");
        reticle.setAttribute("visible", "false");
        scene.appendChild(reticle);

        const cursor = document.createElement("a-cursor");
        cursor.setAttribute("fuse", "false");
        camera.appendChild(cursor);

        mountEl.appendChild(scene);
        sceneEl = scene;
        rootEl = root;
        reticleEl = reticle;
        return scene;
    }

    function clearRoot() {
        if (!rootEl) return;
        while (rootEl.firstChild) rootEl.removeChild(rootEl.firstChild);
    }

    /** @param {(root:HTMLElement)=>void} builderFn populates the shared hazard root */
    function renderScene(builderFn) {
        clearRoot();
        if (builderFn) builderFn(rootEl);
    }

    function getMode() { return mode; }
    function setMode(m) { mode = m === "ar" ? "ar" : "simulation"; }
    function isARSupportedCached() { return arSupported; }
    function setARSupported(v) { arSupported = !!v; }

    // ======================================================================
    // REAL WebXR immersive-ar SESSION LIFECYCLE
    // ======================================================================

    /**
     * Actually request and start an immersive-ar WebXR session — the piece
     * that was entirely missing before: a support check alone never starts
     * anything. Must be called from within a user-activation event handler
     * (a click), which is a WebXR requirement, not a choice made here.
     *
     * Resolves once the session has genuinely started (mode is set to "ar"
     * and the hit-test search loop is already running); the caller is
     * responsible for putting up its own "searching for a surface" UI at
     * that point. Rejects if the browser refuses/cancels the request, in
     * which case the caller should fall back to Simulation Mode.
     *
     * @param {HTMLElement} overlayEl   the #trainingOverlay DOM element —
     *                                  must already exist in the document.
     * @param {Object} callbacks        { onReticleVisible(bool), onPlaced(),
     *                                    onSessionEnded(), onError(err) }
     */
    function enterAR(overlayEl, callbacks) {
        placementCallbacks = callbacks || {};
        if (!sceneEl) return Promise.reject(new Error("ARManager.ensureScene() must run before enterAR()"));
        if (!navigator.xr) return Promise.reject(new Error("navigator.xr is not available in this browser"));
        if (typeof sceneEl.enterAR !== "function") {
            return Promise.reject(new Error("This build of A-Frame does not expose enterAR()"));
        }

        return sceneEl.enterAR().then(() => {
            // A-Frame's own enterAR() has, by this point, already called
            // navigator.xr.requestSession("immersive-ar", ...) using the
            // requiredFeatures/optionalFeatures/overlayElement declared on the
            // <a-scene> webxr component above, and attached the resulting
            // XRSession to the renderer — this IS the real session, not a
            // simulated one. We only hook into it from here.
            xrSession = sceneEl.renderer.xr.getSession();
            setMode("ar");
            if (rootEl) rootEl.object3D.visible = false; // hidden until placed
            wireSessionLifecycle(xrSession);
            startPlacementSearch();
            return xrSession;
        }).catch(err => {
            setMode("simulation");
            if (placementCallbacks.onError) placementCallbacks.onError(err);
            throw err;
        });
    }

    /** User-facing "Exit AR" control — ends the session programmatically.
     *  Returns the session's own end Promise so callers (e.g. finishModule()
     *  tearing down the scene/overlay DOM) can wait for the browser to
     *  actually finish leaving immersive presentation first. */
    function exitAR() {
        if (xrSession) {
            try { return xrSession.end(); } catch (e) { return Promise.resolve(); }
        }
        return Promise.resolve();
    }

    function wireSessionLifecycle(session) {
        session.addEventListener("end", onSessionEnd, { once: true });
        session.addEventListener("select", onSelect);
    }

    function onSessionEnd() {
        stopPlacementSearch();
        setMode("simulation");
        xrSession = null;
        // Reset to the plain Simulation Mode anchor — the AR placement pose
        // was expressed in the XR session's own tracking space, which no
        // longer means anything once that session has ended, and the
        // ordinary look-controls camera resumes at its fixed simulation rig
        // position (see ensureScene()) — this keeps Simulation Mode looking
        // correct immediately after an AR session ends, with the trainee's
        // current question/timer/score state left completely untouched.
        if (rootEl) {
            rootEl.setAttribute("position", "0 0.4 0");
            rootEl.object3D.visible = true;
        }
        if (placementCallbacks && placementCallbacks.onSessionEnded) placementCallbacks.onSessionEnded();
    }

    function onSelect() {
        if (!lastHitPose) return; // ignore taps until a real surface is found
        applyPlacement(lastHitPose.transform.position, lastHitPose.transform.orientation);
        confirmPlacement();
    }

    // ---------------------------------------------------------- hit-test
    function startPlacementSearch() {
        ensureTickComponentRegistered();
        lastHitPose = null;
        lastViewerPose = null;

        const session = xrSession;
        if (!session || typeof session.requestHitTestSource !== "function") {
            // Feature not granted on this device/browser — hit-test is simply
            // unavailable; the caller's UI should offer the manual "Place
            // Here" fallback immediately (placeManually()) rather than a
            // reticle that will never appear.
            if (placementCallbacks.onReticleVisible) placementCallbacks.onReticleVisible(false);
            sceneEl.setAttribute(TICK_COMPONENT, ""); // still poll viewer pose for the manual fallback
            return;
        }

        session.requestReferenceSpace("viewer").then(viewerSpace => {
            return session.requestHitTestSource({ space: viewerSpace });
        }).then(source => {
            hitTestSource = source;
            sceneEl.setAttribute(TICK_COMPONENT, "");
        }).catch(() => {
            hitTestSource = null;
            sceneEl.setAttribute(TICK_COMPONENT, ""); // keep viewer-pose polling for manual fallback
        });
    }

    function stopPlacementSearch() {
        if (sceneEl) sceneEl.removeAttribute(TICK_COMPONENT);
        if (hitTestSource) {
            try { hitTestSource.cancel(); } catch (e) { /* already gone */ }
        }
        hitTestSource = null;
        lastHitPose = null;
        lastViewerPose = null;
        if (reticleEl) reticleEl.setAttribute("visible", "false");
    }

    /** Runs once per XR frame while AR is active (see ensureTickComponentRegistered). */
    function pollHitTest() {
        const frame = sceneEl && sceneEl.frame;
        if (!frame || !sceneEl.renderer || !sceneEl.renderer.xr) return;
        const refSpace = sceneEl.renderer.xr.getReferenceSpace();
        if (!refSpace) return;

        const viewerPose = frame.getViewerPose(refSpace);
        if (viewerPose) lastViewerPose = viewerPose;

        if (!hitTestSource) return;
        const results = frame.getHitTestResults(hitTestSource);
        if (results.length > 0) {
            const pose = results[0].getPose(refSpace);
            if (pose) {
                lastHitPose = pose;
                if (reticleEl) {
                    reticleEl.setAttribute("visible", "true");
                    reticleEl.object3D.position.set(pose.transform.position.x, pose.transform.position.y, pose.transform.position.z);
                    reticleEl.object3D.quaternion.set(pose.transform.orientation.x, pose.transform.orientation.y, pose.transform.orientation.z, pose.transform.orientation.w);
                }
                if (placementCallbacks.onReticleVisible) placementCallbacks.onReticleVisible(true);
                return;
            }
        }
        lastHitPose = null;
        if (reticleEl) reticleEl.setAttribute("visible", "false");
        if (placementCallbacks.onReticleVisible) placementCallbacks.onReticleVisible(false);
    }

    function applyPlacement(pos, quat) {
        if (!rootEl) return;
        rootEl.object3D.position.set(pos.x, pos.y, pos.z);
        rootEl.object3D.quaternion.set(quat.x, quat.y, quat.z, quat.w);
        rootEl.object3D.visible = true;
    }

    /** The documented fallback for when true hit-test surface detection is
     *  unavailable (JSON technical_dependencies TD02/TD04/TD05's "floating
     *  marker" degradation): anchor a fixed ~1.1m in front of wherever the
     *  trainee is currently looking, computed from the session's own live
     *  viewer pose — never a static, pre-session scene coordinate. Only ever
     *  triggered by an explicit, separately-labelled "Place Here" action, so
     *  it is never mistaken for real surface placement. */
    function placeManually() {
        if (!rootEl) return;
        if (lastViewerPose && typeof AFRAME !== "undefined" && AFRAME.THREE) {
            const THREE = AFRAME.THREE;
            const p = lastViewerPose.transform.position;
            const o = lastViewerPose.transform.orientation;
            const viewerPos = new THREE.Vector3(p.x, p.y, p.z);
            const viewerQuat = new THREE.Quaternion(o.x, o.y, o.z, o.w);
            const forward = new THREE.Vector3(0, -0.15, -1.1).applyQuaternion(viewerQuat);
            const finalPos = viewerPos.add(forward);
            rootEl.object3D.position.copy(finalPos);
            rootEl.object3D.quaternion.copy(viewerQuat);
        }
        // No frame/viewer pose yet (shouldn't normally happen once the
        // session is running) — leave the root at its scene-default local
        // transform rather than guessing.
        rootEl.object3D.visible = true;
        confirmPlacement();
    }

    function confirmPlacement() {
        if (reticleEl) reticleEl.setAttribute("visible", "false");
        if (hitTestSource) {
            try { hitTestSource.cancel(); } catch (e) {}
            hitTestSource = null;
        }
        if (sceneEl) sceneEl.removeAttribute(TICK_COMPONENT);
        if (placementCallbacks && placementCallbacks.onPlaced) placementCallbacks.onPlaced();
    }

    function destroy(mountEl) {
        stopPlacementSearch();
        if (xrSession) {
            try { xrSession.removeEventListener("select", onSelect); } catch (e) {}
            xrSession = null;
        }
        placementCallbacks = null;
        if (mountEl) mountEl.innerHTML = "";
        sceneEl = null;
        rootEl = null;
        reticleEl = null;
        mode = "simulation";
    }

    return {
        ensureScene,
        renderScene,
        clearRoot,
        getMode,
        setMode,
        isARSupportedCached,
        setARSupported,
        enterAR,
        exitAR,
        placeManually,
        destroy
    };
})();
