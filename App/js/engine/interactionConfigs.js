/**
 * SafeAR — Interaction Configuration Table
 *
 * ar_safety_training_modules.json describes each scenario's required action in
 * free-text English (the `interaction` field) plus a stable `action_type` code.
 * That text is precise enough for a human trainer to build a scene from, but not
 * machine-structured — so this table is the hand-authored bridge: for each of the
 * 30 question_ids it names which reusable InteractionEngine primitive(s) apply,
 * and which target/zone ids the scene for that question must render.
 *
 * This is the ONLY place scenario-specific interaction wiring lives. The engine
 * itself (interactionEngine.js) knows nothing about individual scenarios — it only
 * knows how to run a TAP, TAP_HOLD, DRAG, DRAG_MULTI, ROTATE, SWIPE, PHYSICAL_MOVE,
 * or a COMPOSITE sequence of those, generically.
 *
 * Every target/zone id referenced here must be rendered by the matching scene
 * builder in App/js/scenes/ with the same id, so InteractionEngine can attach
 * listeners to it by id alone.
 */

const INTERACTION_CONFIGS = {
    // ===================== MODULE 1 — FIRE, GAS & EXPLOSION =====================
    MOD01_Q01: { primitive: "TAP_HOLD", holdMs: 2000,
        target: { id: "flame", en: "Flame", hi: "लौ" },
        distractor: { id: "dustPile", en: "Dust Pile — do not tap", hi: "धूल का ढेर — टैप न करें" } },

    MOD01_Q02: { primitive: "PHYSICAL_MOVE",
        zone: { id: "safeZone", en: "Safe Zone (3m clear of gas cloud)", hi: "सुरक्षित क्षेत्र (गैस बादल से 3 मी दूर)" },
        minDistanceM: 3 },

    MOD01_Q03: { primitive: "TAP_HOLD", holdMs: 3000,
        target: { id: "isolatorSwitch", en: "Isolator / Breaker Switch", hi: "आइसोलेटर/ब्रेकर स्विच" },
        distractor: { id: "ragsPile", en: "Oil-soaked Rags — do not tap", hi: "तेल में भीगे कपड़े — टैप न करें" } },

    MOD01_Q04: { primitive: "DRAG_MULTI", objects: [
        { id: "drum1", zone: "safeStorage", en: "Fuel Drum 1", hi: "ईंधन ड्रम 1" },
        { id: "drum2", zone: "safeStorage", en: "Fuel Drum 2", hi: "ईंधन ड्रम 2" },
        { id: "blanket", zone: "sparkZone", en: "Fire Blanket", hi: "अग्नि कंबल" }
    ] },

    MOD01_Q05: { primitive: "DRAG_MULTI", objects: [
        { id: "crate1", zone: "clearArea", en: "Crate", hi: "क्रेट" },
        { id: "crate2", zone: "clearArea", en: "Loose Material", hi: "ढीला सामान" },
        { id: "crate3", zone: "clearArea", en: "Box", hi: "बॉक्स" }
    ] },

    MOD01_Q06: { primitive: "SWIPE", direction: "down",
        target: { id: "eStopCord", en: "Emergency Stop Cord", hi: "आपातकालीन स्टॉप कॉर्ड" } },

    MOD01_Q07: { primitive: "DRAG",
        object: { id: "bondingClamp", en: "Bonding Clamp", hi: "बॉन्डिंग क्लैंप" },
        zone: { id: "containers", en: "Both Containers", hi: "दोनों कंटेनर" } },

    MOD01_Q08: { primitive: "COMPOSITE", steps: [
        { type: "TAP", target: { id: "cigarette", en: "Lit Cigarette", hi: "जलती सिगरेट" } },
        { type: "DRAG", object: { id: "sign", en: "Fallen Sign", hi: "गिरा हुआ बोर्ड" }, zone: { id: "signPost", en: "Sign Post", hi: "बोर्ड पोस्ट" } }
    ] },

    MOD01_Q09: { primitive: "COMPOSITE", steps: [
        { type: "ROTATE", mode: "atLeast", minDegrees: 270, target: { id: "valve", en: "Gas Valve", hi: "गैस वाल्व" } },
        { type: "SWIPE", direction: "up", target: { id: "vent", en: "Window / Vent", hi: "खिड़की/वेंट" } }
    ] },

    MOD01_Q10: { primitive: "DRAG",
        object: { id: "detonatorBox", en: "Detonator Box", hi: "डेटोनेटर बॉक्स" },
        zone: { id: "magazine", en: "Authorised Magazine (Safe Storage)", hi: "अधिकृत मैगज़ीन (सुरक्षित भंडारण)" } },

    // ===================== MODULE 2 — FALL, COLLAPSE & HEIGHT =====================
    MOD02_Q01: { primitive: "TAP_HOLD", holdMs: 3000,
        target: { id: "weakPoint", en: "Weak Point — install roof bolt", hi: "कमज़ोर बिंदु — रूफ बोल्ट लगाएं" } },

    MOD02_Q02: { primitive: "DRAG",
        object: { id: "cover", en: "Floor Cover", hi: "फर्श कवर" },
        zone: { id: "opening", en: "Open Shaft", hi: "खुला शाफ्ट" } },

    MOD02_Q03: { primitive: "DRAG",
        object: { id: "lanyardHook", en: "Lanyard Hook", hi: "लैनयार्ड हुक" },
        zone: { id: "anchorPoint", en: "Anchor Point", hi: "एंकर पॉइंट" } },

    MOD02_Q04: { primitive: "ROTATE", mode: "toTarget", targetDegrees: 75, toleranceDegrees: 12,
        target: { id: "ladder", en: "Ladder Base", hi: "सीढ़ी का आधार" } },

    MOD02_Q05: { primitive: "PHYSICAL_MOVE",
        zone: { id: "safeLine", en: "Safe Distance Line (2m from edge)", hi: "सुरक्षित दूरी रेखा (किनारे से 2 मी)" },
        minDistanceM: 2 },

    MOD02_Q06: { primitive: "DRAG",
        object: { id: "gratingCover", en: "Grating Cover", hi: "जाली कवर" },
        zone: { id: "opening", en: "Floor Opening", hi: "फर्श का छिद्र" } },

    MOD02_Q07: { primitive: "TAP_HOLD", holdMs: 3000,
        target: { id: "edgeZone", en: "Platform Edge — install toe-board", hi: "प्लेटफ़ॉर्म किनारा — टो-बोर्ड लगाएं" } },

    MOD02_Q08: { primitive: "DRAG",
        object: { id: "ladder", en: "Proper Ladder", hi: "उचित सीढ़ी" },
        zone: { id: "workerLocation", en: "Beside Worker", hi: "कर्मचारी के पास" } },

    MOD02_Q09: { primitive: "DRAG_MULTI", objects: [
        { id: "wetSign", zone: "wetPatch", en: "Wet Floor Sign", hi: "गीला फर्श संकेत" },
        { id: "mat", zone: "wetPatch", en: "Absorbent Mat", hi: "शोषक मैट" }
    ] },

    MOD02_Q10: { primitive: "COMPOSITE", steps: [
        { type: "SWIPE", direction: "up", target: { id: "stopSignal", en: "Stop-Signal Icon", hi: "स्टॉप-सिग्नल आइकन" } },
        { type: "DRAG", object: { id: "worker", en: "Worker Figure", hi: "कर्मचारी आकृति" }, zone: { id: "safeStrip", en: "Safe Strip", hi: "सुरक्षित पट्टी" } }
    ] },

    // ===================== MODULE 3 — MACHINE, VEHICLE & ELECTRICAL =====================
    MOD03_Q01: { primitive: "DRAG",
        object: { id: "guardPanel", en: "Guard Panel", hi: "गार्ड पैनल" },
        zone: { id: "pulley", en: "Exposed Pulley", hi: "उजागर पुली" } },

    MOD03_Q02: { primitive: "TAP_HOLD", holdMs: 3000,
        target: { id: "isolatorSwitch", en: "Isolator Switch", hi: "आइसोलेटर स्विच" } },

    MOD03_Q03: { primitive: "DRAG",
        object: { id: "worker", en: "Worker Figure", hi: "कर्मचारी आकृति" },
        zone: { id: "safeZone", en: "Safe Zone", hi: "सुरक्षित क्षेत्र" } },

    MOD03_Q04: { primitive: "TAP_HOLD", holdMs: 3000,
        target: { id: "distributionBoard", en: "Distribution Board Isolator", hi: "डिस्ट्रीब्यूशन बोर्ड आइसोलेटर" } },

    MOD03_Q05: { primitive: "DRAG",
        object: { id: "faceShield", en: "Face Shield", hi: "फेस शील्ड" },
        zone: { id: "workerHead", en: "Worker's Head", hi: "कर्मचारी का सिर" } },

    MOD03_Q06: { primitive: "COMPOSITE", steps: [
        { type: "TAP_HOLD", holdMs: 2000, target: { id: "bypassWire", en: "Bypass Wire", hi: "बायपास तार" } },
        { type: "DRAG", object: { id: "guardDoor", en: "Guard Door", hi: "गार्ड दरवाज़ा" }, zone: { id: "closedPosition", en: "Closed Position", hi: "बंद स्थिति" } }
    ] },

    MOD03_Q07: { primitive: "DRAG_MULTI", objects: [
        { id: "barrierRope", zone: "arcFlashZone", en: "Barrier Rope", hi: "बैरियर रस्सी" },
        { id: "arcPpe", zone: "workerBody", en: "Arc-Rated PPE", hi: "आर्क-रेटेड पीपीई" }
    ] },

    MOD03_Q08: { primitive: "TAP",
        target: { id: "ignitionSwitch", en: "Ignition Switch", hi: "इग्निशन स्विच" } },

    MOD03_Q09: { primitive: "COMPOSITE", steps: [
        { type: "TAP_HOLD", holdMs: 2000, target: { id: "frayedRope", en: "Frayed Rope Point", hi: "घिसा हुआ रस्सा बिंदु" } },
        { type: "DRAG", object: { id: "tag", en: "Out-of-Service Tag", hi: "आउट-ऑफ़-सर्विस टैग" }, zone: { id: "controlPanel", en: "Haulage Control Panel", hi: "हॉलेज नियंत्रण पैनल" } }
    ] },

    MOD03_Q10: { primitive: "COMPOSITE", steps: [
        { type: "TAP_HOLD", holdMs: 2000, target: { id: "eStop", en: "Emergency Stop", hi: "आपातकालीन स्टॉप" } },
        { type: "DRAG", object: { id: "clearingTool", en: "Jam-Clearing Tool", hi: "जाम-हटाने का औज़ार" }, zone: { id: "nipPoint", en: "Nip Point", hi: "निप पॉइंट" } }
    ] }
};
