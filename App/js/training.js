/**
 * SafeAR — Training screen controller.
 *
 * Wires together every engine module for one module's run:
 *   ScenarioEngine (content) -> EnvironmentManager (camera/scan) ->
 *   ARManager (AR-or-Simulation 3D scene) -> InteractionEngine (controls) ->
 *   EvaluationEngine (CORRECT/INCORRECT/TIMEOUT) -> ScoringManager (points) ->
 *   LoggingService (per-question + session logging) -> SessionManager (ids).
 *
 * Screen flow implemented here: Camera Prep -> Environment Scan ->
 * Environment Detection/Confirm -> per-question Training Loop (Hazard ->
 * Interaction -> Evaluate -> Feedback popup) -> Module Completion.
 *
 * The <a-scene> is mounted ONCE per module run and never torn down between
 * questions (only its #hazardRoot content is swapped) — replacing the whole
 * screen's innerHTML on every question would detach the live scene element
 * (and any in-progress WebXR AR session) from the document. Feedback is
 * therefore shown as a popup overlay on top of the persistent shell, which
 * also matches how the content JSON itself frames outcomes ("Popup: '...'").
 */
(function () {
    if (!SafeAuth.requireAuth()) return;

    const app = document.getElementById("trainingApp");
    const params = new URLSearchParams(window.location.search);
    const requestedModuleId = params.get("module");

    if (!I18n.hasLang()) {
        const here = "training.html" + window.location.search;
        window.location.href = "language.html?next=" + encodeURIComponent(here);
        return;
    }

    const user = SafeAuth.getUser();
    const traineeNameEl = document.getElementById("traineeName");
    if (traineeNameEl) traineeNameEl.textContent = (user && (user.name || user.email)) || "Trainee";
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) logoutBtn.addEventListener("click", () => SafeAuth.logout());

    // ---------------------------------------------------------------- state
    let currentModule = null;
    let questions = [];
    let qIndex = 0;
    let moduleEvents = [];
    let envProfile = { brightness: "unknown", openSpace: true, cameraGranted: false, arSupported: false };
    let envCondition = null;
    let sceneEl = null;
    let currentInteraction = null;
    let timerHandle = null;
    let questionStartedAt = 0;
    let timeLimitMs = 0;
    let currentAttempts = 0;
    let questionLoopStarted = false; // true once renderQuestion() has run for this module attempt

    function render(html) { app.innerHTML = html; }
    function escapeHtml(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }

    const user_id = (user && (user.uid || user.email)) || "anonymous";
    SessionManager.ensureSession(user_id);
    LoggingService.logSessionStart();

    render(`<div class="scenario-panel" style="text-align:center; padding:60px 0;">${I18n.t("common_loading")}</div>`);

    ScenarioEngine.load().then(() => {
        const sequence = ScenarioEngine.getModuleSequence();
        currentModule = ScenarioEngine.getModule(requestedModuleId) || ScenarioEngine.getModule(sequence[0]);
        questions = ScenarioEngine.getQuestions(currentModule.module_id);
        SessionManager.recordModuleStart(currentModule.module_id);
        renderCameraPrep();
    }).catch(err => {
        console.error("[Training] Failed to load content:", err);
        render(`<div class="scenario-panel"><p style="color:#f87171;">Could not load training content. Please verify the backend is running and refresh.</p></div>`);
    });

    // ============================================================ CAMERA PREP
    function renderCameraPrep() {
        render(`
            <div class="scenario-panel prep-card">
                <div class="prep-icon">📷</div>
                <div class="section-label">${escapeHtml(I18n.field(currentModule.module_name))}</div>
                <h2>${I18n.t("scan_title")}</h2>
                <p class="section-intro left" style="margin:0 auto 8px;">${I18n.t("scan_subtitle")}</p>
                <div id="scanStatusHost"></div>
                <div class="prep-actions">
                    <button class="primary-button" id="btnAllowCamera">${I18n.t("scan_allow_camera")}</button>
                    <button class="secondary-button" id="btnSkipCamera">${I18n.t("scan_skip_camera")}</button>
                </div>
            </div>
        `);
        document.getElementById("btnAllowCamera").addEventListener("click", requestCameraFlow);
        document.getElementById("btnSkipCamera").addEventListener("click", () => {
            envProfile.cameraGranted = false;
            finishScanAndGoToConfirm();
        });
    }

    function setScanStatus(text, kind) {
        const host = document.getElementById("scanStatusHost");
        if (!host) return;
        host.innerHTML = `<div class="scan-status-line ${kind || ''}">${escapeHtml(text)}</div>`;
    }

    function requestCameraFlow() {
        setScanStatus(I18n.t("scan_status_requesting"));
        EnvironmentManager.requestCamera().then(stream => {
            if (!stream) {
                envProfile.cameraGranted = false;
                setScanStatus(I18n.t("scan_status_denied"), "warn");
                setTimeout(finishScanAndGoToConfirm, 900);
                return;
            }
            envProfile.cameraGranted = true;
            const video = document.createElement("video");
            video.setAttribute("playsinline", "");
            video.muted = true;
            video.srcObject = stream;
            video.style.cssText = "position:fixed; top:-9999px; left:-9999px; width:2px; height:2px;";
            document.body.appendChild(video);
            video.play().catch(() => {});
            setScanStatus(I18n.t("scan_status_scanning"));

            // Sample a real brightness reading once frames are flowing, then release
            // this getUserMedia stream — ARManager/A-Frame manage their own camera
            // access separately for the actual AR passthrough session.
            setTimeout(() => {
                const avg = EnvironmentManager.sampleBrightness(video);
                envProfile.brightness = EnvironmentManager.classifyBrightness(avg);
                envProfile.openSpace = EnvironmentManager.hasLikelyOpenSpace();
                EnvironmentManager.stopCamera();
                video.remove();
                if (envProfile.brightness === "low") {
                    setScanStatus(I18n.t("scan_status_low_light"), "warn");
                } else {
                    setScanStatus(I18n.t("scan_status_surface_detected"), "ok");
                }
                setTimeout(finishScanAndGoToConfirm, 700);
            }, 1600);
        });
    }

    function finishScanAndGoToConfirm() {
        EnvironmentManager.probeWebXRAR().then(supported => {
            envProfile.arSupported = supported;
            ARManager.setARSupported(supported);
            envCondition = pickEnvironmentCondition(currentModule, envProfile);
            renderEnvConfirm();
        });
    }

    // ============================================================ ENV CONFIRM
    function prettyCondition(code) {
        return String(code).replace(/_/g, " ").toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
    }

    /** Auto-pick a plausible environment_condition for this module run from the
     *  scan profile, using the union of conditions this module's own questions
     *  declare as plausible (see JSON's environment_conditions per question).
     *  The trainee can always override via the "Not correct? Change" fallback —
     *  this is the manual-confirm path EnvironmentManager's docs describe. */
    function pickEnvironmentCondition(mod, profile) {
        const seen = new Set();
        (mod.items || []).forEach(q => (q.environment_conditions || []).forEach(c => seen.add(c.condition)));
        const codes = Array.from(seen);
        if (profile.brightness === "low") {
            const hit = codes.find(c => c.includes("LOW_LIGHT") || c.includes("CONFINED_SPACE"));
            if (hit) return hit;
        }
        if (!profile.openSpace) {
            const hit = codes.find(c => c.includes("NARROW") || c.includes("CONFINED"));
            if (hit) return hit;
        }
        return codes[0] || "OPEN_INDOOR_FLOOR";
    }

    function renderEnvConfirm() {
        const taxonomy = ScenarioEngine.getEnvironmentTaxonomy();
        const allCodes = Object.keys(taxonomy);
        render(`
            <div class="scenario-panel prep-card">
                <div class="section-label">${escapeHtml(I18n.field(currentModule.module_name))}</div>
                <h2>${I18n.t("scan_title")}</h2>
                <div class="env-confirm-box">
                    <div class="env-confirm-row">
                        <div>
                            <div class="env-confirm-label">Detected Environment</div>
                            <div class="env-confirm-value" id="envValueLabel">${escapeHtml(prettyCondition(envCondition))}</div>
                        </div>
                        <button class="env-confirm-change" id="btnChangeEnv" type="button">Not correct? Change</button>
                    </div>
                    <select class="env-confirm-select" id="envSelect" style="display:none;">
                        ${allCodes.map(c => `<option value="${c}" ${c === envCondition ? "selected" : ""}>${escapeHtml(prettyCondition(c))}</option>`).join("")}
                    </select>
                </div>
                <div class="scan-status-line ${envProfile.cameraGranted ? 'ok' : 'warn'}">
                    ${envProfile.cameraGranted ? I18n.t("scan_status_ready") : I18n.t("scan_status_denied")}
                </div>
                ${!envProfile.openSpace ? `<div class="scan-status-line warn">${I18n.t("scan_status_no_space")}</div>` : ""}

                ${envProfile.arSupported ? `
                    <div class="ar-ready-card">
                        <div class="ar-ready-title">${I18n.t("ar_ready_title")}</div>
                        <ul class="ar-check-list">
                            <li class="ar-check-item ${envProfile.cameraGranted ? 'ok' : 'pending'}">
                                <span class="ar-check-mark">${envProfile.cameraGranted ? '✓' : '○'}</span> ${I18n.t("ar_check_camera")}
                            </li>
                            <li class="ar-check-item ok"><span class="ar-check-mark">✓</span> ${I18n.t("ar_check_webxr")}</li>
                            <li class="ar-check-item ok"><span class="ar-check-mark">✓</span> ${I18n.t("ar_check_environment")}</li>
                        </ul>
                        <div class="prep-actions">
                            <button class="primary-button" id="btnStartARTraining">${I18n.t("ar_start_training")}</button>
                            <button class="secondary-button" id="btnUseSimulation">${I18n.t("ar_use_simulation")}</button>
                        </div>
                    </div>
                ` : `
                    <div class="ar-not-available-card">
                        <div class="ar-not-available-title">${I18n.t("ar_not_available_title")}</div>
                        <div class="prep-actions">
                            <button class="primary-button" id="btnContinueSimulation">${I18n.t("ar_continue_simulation")}</button>
                        </div>
                    </div>
                `}
            </div>
        `);
        document.getElementById("btnChangeEnv").addEventListener("click", () => {
            document.getElementById("envSelect").style.display = "block";
        });
        document.getElementById("envSelect").addEventListener("change", (e) => {
            envCondition = e.target.value;
            document.getElementById("envValueLabel").textContent = prettyCondition(envCondition);
        });

        const btnStartAR = document.getElementById("btnStartARTraining");
        if (btnStartAR) btnStartAR.addEventListener("click", startARTrainingFlow);
        const btnUseSim = document.getElementById("btnUseSimulation");
        if (btnUseSim) btnUseSim.addEventListener("click", startSimulationTraining);
        const btnContinueSim = document.getElementById("btnContinueSimulation");
        if (btnContinueSim) btnContinueSim.addEventListener("click", startSimulationTraining);
    }

    // ============================================================ SIMULATION START
    function startSimulationTraining() {
        qIndex = 0;
        moduleEvents = [];
        questionLoopStarted = false;
        renderTrainingShell();
        renderQuestion();
    }

    // ============================================================ REAL AR START
    // The piece that was entirely missing before: actually requesting and
    // starting an immersive-ar WebXR session, then real hit-test placement,
    // rather than just showing an "AR Mode" badge based on the earlier
    // support check. See App/js/engine/arManager.js for the session/hit-test
    // mechanics this drives.
    function startARTrainingFlow() {
        qIndex = 0;
        moduleEvents = [];
        questionLoopStarted = false;
        renderTrainingShell();
        renderArSearchingState();

        const overlay = document.getElementById("trainingOverlay");
        const callbacks = {
            onReticleVisible(found) { updateArSearchStatus(found); },
            onPlaced() {
                hideArPlacementUI();
                updateModeBadge();
                renderQuestion();
            },
            onSessionEnded() {
                updateModeBadge();
                handleArSessionEnded();
            },
            onError(err) { handleArError(err); }
        };

        const begin = () => {
            ARManager.enterAR(overlay, callbacks).then(() => {
                updateModeBadge(); // real session is now active — safe to show AR MODE
            }).catch(() => {
                // enterAR() already invoked callbacks.onError(); nothing further to do.
            });
        };
        if (sceneEl.hasLoaded) begin();
        else sceneEl.addEventListener("loaded", begin, { once: true });
    }

    function renderArSearchingState() {
        const hint = document.getElementById("arPlacementHint");
        if (!hint) return;
        hint.hidden = false;
        hint.innerHTML = `
            <div class="ar-search-status" id="arSearchStatus">${I18n.t("ar_searching_surface")}</div>
            <div class="ar-placement-actions">
                <button class="secondary-button" id="btnPlaceManually">${I18n.t("ar_place_manually")}</button>
                <button class="text-link-btn" id="btnExitAR">${I18n.t("ar_exit_btn")}</button>
            </div>
        `;
        document.getElementById("btnPlaceManually").addEventListener("click", () => ARManager.placeManually());
        document.getElementById("btnExitAR").addEventListener("click", () => ARManager.exitAR());
    }

    function updateArSearchStatus(surfaceFound) {
        const el = document.getElementById("arSearchStatus");
        if (!el) return;
        el.textContent = surfaceFound ? I18n.t("ar_surface_found") : I18n.t("ar_searching_surface");
        el.classList.toggle("found", !!surfaceFound);
    }

    function hideArPlacementUI() {
        const hint = document.getElementById("arPlacementHint");
        if (hint) { hint.hidden = true; hint.innerHTML = ""; }
    }

    /** The AR session ended (user backed out via the browser/OS gesture, a
     *  device/browser error, or our own "Exit AR" button) — return to a
     *  valid state rather than leaving the screen stuck on "AR MODE".
     *  ARManager itself has already reset the shared scene back to its
     *  ordinary Simulation Mode camera/anchor by this point. */
    function handleArSessionEnded() {
        hideArPlacementUI();
        if (!questionLoopStarted) {
            // Backed out during placement search, before anything started —
            // continue this same module attempt in Simulation Mode from Q1.
            renderQuestion();
        }
        // Otherwise a question was already in progress: its timer, attempts,
        // and interaction panel are untouched DOM/state, so the trainee
        // simply continues the same question in Simulation Mode.
    }

    function handleArError(err) {
        console.warn("[Training] WebXR AR session could not start:", err && err.message);
        const hint = document.getElementById("arPlacementHint");
        if (hint) {
            hint.hidden = false;
            hint.innerHTML = `<div class="ar-search-status ar-error">${escapeHtml(I18n.t("ar_error_notice"))}</div>`;
        }
        setTimeout(startSimulationTraining, 1500);
    }

    // ============================================================ TRAINING SHELL
    // Rendered ONCE per module run. Only its inner placeholders are mutated by
    // renderQuestion() from here on — the <a-scene> itself is never detached.
    function renderTrainingShell() {
        render(`
            <div class="scenario-head">
                <div>
                    <span class="id" id="moduleIdLabel"></span>
                    <h2 id="scenarioTitle"></h2>
                </div>
                <span class="badge" id="progressBadge"></span>
            </div>
            <div class="progress-row">
                <span id="scoreLabel"></span>
                <span class="attempt-counter" id="attemptsLabel"></span>
            </div>
            <div class="progress"><i id="progressBar" style="width:0%"></i></div>

            <div class="hazard-stage" id="hazardStage"></div>
        `);

        const stage = document.getElementById("hazardStage");
        // ARManager.ensureScene() wipes mountEl's existing children before
        // inserting the <a-scene> — so #trainingOverlay is appended AFTER, as
        // a sibling of the scene, not baked into the template above.
        //
        // #trainingOverlay is BOTH the visual HUD over the hazard stage AND
        // the WebXR dom-overlay root declared on the scene's `webxr`
        // component (see arManager.js). A real immersive session only ever
        // composites that one designated DOM subtree on top of the camera
        // feed — everything the trainee needs during an actual AR session
        // (mode/timer HUD, placement controls, hazard description,
        // instruction line, and the interaction controls themselves) MUST
        // live inside it, or it would be invisible/unusable in real AR.
        sceneEl = ARManager.ensureScene(stage);

        const overlay = document.createElement("div");
        overlay.id = "trainingOverlay";
        overlay.className = "training-overlay";
        overlay.innerHTML = `
            <div class="overlay-top-row">
                <span class="mode-badge sim" id="modeBadge"></span>
                <span class="timer-pill" id="timerPill">--</span>
            </div>
            <div class="ar-placement-hint" id="arPlacementHint" hidden></div>
            <div class="overlay-bottom-panel">
                <p class="task" id="hazardDescription"></p>
                <p class="instruction-line" id="instructionLine"></p>
                <div class="interaction-panel" id="interactionPanel"></div>
            </div>
        `;
        stage.appendChild(overlay);

        updateModeBadge();
    }

    function updateModeBadge() {
        const badge = document.getElementById("modeBadge");
        if (!badge) return;
        const isAr = ARManager.getMode() === "ar";
        badge.className = "mode-badge " + (isAr ? "ar" : "sim");
        badge.textContent = isAr ? I18n.t("scan_mode_ar") : I18n.t("scan_mode_sim");
    }

    // ============================================================ QUESTION LOOP
    function renderQuestion() {
        questionLoopStarted = true;
        const q = questions[qIndex];
        const config = INTERACTION_CONFIGS[q.question_id];
        // Realistic per-primitive time budget (60-120s) — see
        // ScenarioEngine.getTimeLimitSeconds for why this is no longer
        // parsed directly from the question's in-story countdown text.
        timeLimitMs = ScenarioEngine.getTimeLimitSeconds(q, config, 60) * 1000;
        questionStartedAt = Date.now();
        currentAttempts = 0;

        document.getElementById("moduleIdLabel").textContent = currentModule.module_id.replace(/_/g, " ");
        document.getElementById("scenarioTitle").textContent = I18n.field(q.scenario_title);
        document.getElementById("scenarioTitle").dataset.questionId = q.question_id; // debug/e2e-test hook, not read by the engine itself
        document.getElementById("progressBadge").textContent =
            I18n.t("training_scenario") + " " + (qIndex + 1) + " " + I18n.t("training_of") + " " + questions.length;
        const agg = ScoringManager.aggregate(moduleEvents);
        document.getElementById("scoreLabel").textContent =
            I18n.t("training_score") + ": " + agg.score + " / " + (questions.length * ScoringManager.POINTS_PER_QUESTION);
        document.getElementById("attemptsLabel").textContent = "";
        document.getElementById("progressBar").style.width = Math.round((qIndex / questions.length) * 100) + "%";
        document.getElementById("hazardDescription").textContent = I18n.field(q.hazard_description);
        document.getElementById("instructionLine").textContent = I18n.t("training_instruction");
        updateModeBadge();

        ARManager.renderScene(SCENE_BUILDERS[q.question_id]);

        const panel = document.getElementById("interactionPanel");
        currentInteraction = InteractionEngine.mount(panel, config, {
            onAttempt(count) {
                currentAttempts = count;
                const label = document.getElementById("attemptsLabel");
                if (label) label.textContent = "Attempts: " + count;
            },
            onComplete({ attempts, timeTakenMs }) {
                stopTimer();
                const result = EvaluationEngine.evaluate({ completed: true, attempts, timeTakenMs, timeLimitMs });
                resolveQuestion(q, result, attempts, timeTakenMs);
            }
        });

        startTimer(q);
    }

    function startTimer() {
        stopTimer();
        const pill = document.getElementById("timerPill");
        timerHandle = setInterval(() => {
            const elapsed = Date.now() - questionStartedAt;
            const remaining = Math.max(0, timeLimitMs - elapsed);
            if (pill) {
                pill.textContent = Math.ceil(remaining / 1000) + "s";
                pill.classList.toggle("urgent", remaining <= 3000);
            }
            if (remaining <= 0) {
                stopTimer();
                if (currentInteraction) currentInteraction.destroy();
                const q = questions[qIndex];
                const result = EvaluationEngine.evaluate({ completed: false, attempts: currentAttempts, timeTakenMs: timeLimitMs, timeLimitMs });
                resolveQuestion(q, result, currentAttempts, timeLimitMs);
            }
        }, 200);
    }

    function stopTimer() {
        if (timerHandle) { clearInterval(timerHandle); timerHandle = null; }
    }

    function resolveQuestion(q, result, attempts, timeTakenMs) {
        const event = {
            module_id: currentModule.module_id,
            question_id: q.question_id,
            hazard_type: q.hazard_type,
            action_type: q.action_type,
            environment_detected: envCondition,
            attempt_count: attempts,
            time_taken_ms: timeTakenMs,
            result
        };
        moduleEvents.push(event);
        LoggingService.logQuestionEvent(event);
        showFeedback(q, result);
    }

    // ============================================================ FEEDBACK POPUP
    function showFeedback(q, result) {
        const isCorrect = result === EvaluationEngine.RESULT.CORRECT;
        const titleKey = isCorrect ? "feedback_correct_title" : (result === "TIMEOUT" ? "feedback_timeout_title" : "feedback_incorrect_title");
        const outcomeText = isCorrect ? I18n.field(q.correct_outcome) : I18n.field(q.incorrect_outcome);
        const isLast = qIndex >= questions.length - 1;

        const overlay = document.createElement("div");
        overlay.className = "marker-modal";
        overlay.innerHTML = `
            <div class="marker-modal-content" style="max-width:520px; text-align:left;">
                <div class="feedback ${isCorrect ? 'good' : 'bad'}" style="margin-top:0;">
                    <h3 style="margin:0 0 8px; color:inherit;">${I18n.t(titleKey)}</h3>
                    <p style="margin:0;">${escapeHtml(outcomeText)}</p>
                </div>
                <div style="display:flex; justify-content:flex-end; margin-top:20px;">
                    <button class="primary-button" id="btnFeedbackNext">
                        ${isLast ? I18n.t("training_finishModule") : I18n.t("training_next")} →
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        document.getElementById("btnFeedbackNext").addEventListener("click", () => {
            overlay.remove();
            if (isLast) {
                finishModule();
            } else {
                qIndex++;
                renderQuestion();
            }
        });
    }

    // ============================================================ MODULE COMPLETION
    function finishModule() {
        const stage = document.getElementById("hazardStage");
        // If a real AR session is still active, end it cleanly first —
        // tearing down the scene/overlay DOM while the browser is still
        // mid-immersive-presentation would leave WebXR in a broken state.
        if (ARManager.getMode() === "ar") {
            ARManager.exitAR().then(renderCompletionScreen).catch(renderCompletionScreen);
        } else {
            renderCompletionScreen();
        }

        function renderCompletionScreen() {
            ARManager.destroy(stage);
            LoggingService.logSessionEnd();

            const agg = ScoringManager.aggregate(moduleEvents);
            const ratingClass = agg.ratingCode.toLowerCase().replace(/_/g, "-");

            render(`
                <div class="scenario-panel result">
                    <div class="section-label">${escapeHtml(I18n.field(currentModule.module_name))}</div>
                    <h2>${I18n.t("completion_title")}</h2>
                    <div class="rating-pill ${ratingClass}">${agg.ratingLabel}</div>
                    <div class="score-ring ${ratingClass}">${agg.percentage}%</div>
                    <p class="section-intro" style="margin:0 auto 8px;">
                        ${I18n.t("completion_score")}: ${agg.score} / ${agg.maxScore}
                    </p>
                    <div class="prep-actions">
                        <a href="scenarios.html" class="secondary-button">${I18n.t("completion_viewDashboard")}</a>
                        <a href="results.html" class="primary-button">${I18n.t("completion_viewResults")}</a>
                    </div>
                </div>
            `);
        }
    }
})();
