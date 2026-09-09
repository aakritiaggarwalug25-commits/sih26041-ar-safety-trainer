/**
 * SafeAR — i18n Helper
 *
 * Two kinds of text in this app:
 *  1. CONTENT text — comes from ar_safety_training_modules.json as {en, hi} objects
 *     (module names, scan instructions, hazard descriptions, feedback popups, etc).
 *     Use I18n.field(obj) to resolve these.
 *  2. CHROME text — fixed UI strings that are NOT in the JSON (button labels, screen
 *     headings, status messages for scanning/camera/etc). Use I18n.t(key) for these.
 *
 * Language is a SESSION-LEVEL preference: selected once on the Language Selection
 * screen, stored under LANG_STORAGE_KEY, and used for the rest of the session
 * without asking again. hazard_type / action_type / module_id / question_id are
 * NEVER translated — they are stable internal codes used for logging only.
 */

const I18n = (() => {
    const DEFAULT_LANG = "en";

    const CHROME = {
        en: {
            appName: "SafeAR",
            langSelect_title: "Choose Your Language",
            langSelect_subtitle: "This will be used throughout your training session — scan instructions, hazards, feedback and results.",
            langSelect_english: "English",
            langSelect_hindi: "हिन्दी (Hindi)",
            langSelect_continue: "Continue",
            moduleSelect_title: "Choose a Safety Training Module",
            moduleSelect_subtitle: "Select a module to begin. Your language and progress carry over automatically.",
            moduleSelect_start: "Start Module",
            moduleSelect_resume: "Resume Module",
            moduleSelect_questions: "Scenarios",
            moduleSelect_completed: "Completed",
            scan_title: "Prepare Your Environment",
            scan_subtitle: "We'll use your camera to try to place hazards in your real surroundings. If that isn't possible on this device, a 3D Simulation Mode will be used instead — the training is identical either way.",
            scan_allow_camera: "Allow Camera Access",
            scan_skip_camera: "Skip — Use Simulation Mode",
            scan_status_requesting: "Requesting camera permission…",
            scan_status_denied: "Camera unavailable on this device/browser. Switching to Simulation Mode.",
            scan_status_scanning: "Move your phone slowly to scan your surroundings…",
            scan_status_surface_detected: "Surface detected.",
            scan_status_ready: "Environment ready.",
            scan_status_low_light: "Insufficient lighting — move to a brighter area, or continue in Simulation Mode.",
            scan_status_no_space: "This space looks tight for a movement-based task — we'll use a tap-to-move alternative instead.",
            scan_continue: "Continue to Training",
            scan_mode_ar: "AR Mode (camera)",
            scan_mode_sim: "Simulation Mode (3D)",
            ar_ready_title: "AR Ready",
            ar_check_camera: "Camera",
            ar_check_webxr: "WebXR",
            ar_check_environment: "Environment",
            ar_start_training: "Start AR Training",
            ar_use_simulation: "Use Simulation",
            ar_not_available_title: "AR Not Available On This Device",
            ar_continue_simulation: "Continue In Simulation",
            ar_searching_surface: "Point your camera at a flat surface…",
            ar_surface_found: "Surface found — tap to place",
            ar_place_manually: "Place Here Manually",
            ar_exit_btn: "Exit AR",
            ar_error_notice: "Couldn't start AR — switching to Simulation Mode.",
            training_scenario: "Scenario",
            training_of: "of",
            training_timeLeft: "Time left",
            training_score: "Score",
            training_instruction: "What should you do?",
            training_confirm: "Confirm Action",
            training_next: "Next Scenario",
            training_finishModule: "Finish Module",
            training_retry: "Retry",
            feedback_correct_title: "Correct — Safe Outcome",
            feedback_incorrect_title: "Incorrect — Unsafe Outcome",
            feedback_timeout_title: "Time's Up",
            feedback_whyMatters: "Why this matters",
            completion_title: "Module Complete",
            completion_score: "Your Score",
            completion_rating: "Rating",
            completion_viewDashboard: "Back to Modules",
            completion_viewResults: "View My Results",
            rating_excellent: "Excellent",
            rating_good: "Good",
            rating_needsImprovement: "Needs Improvement",
            rating_failed: "Needs Retraining",
            common_back: "Back",
            common_loading: "Loading…"
        },
        hi: {
            appName: "SafeAR",
            langSelect_title: "अपनी भाषा चुनें",
            langSelect_subtitle: "यह आपके पूरे प्रशिक्षण सत्र में उपयोग होगी — स्कैन निर्देश, खतरे, फीडबैक और परिणाम।",
            langSelect_english: "English (अंग्रेज़ी)",
            langSelect_hindi: "हिन्दी",
            langSelect_continue: "जारी रखें",
            moduleSelect_title: "एक सुरक्षा प्रशिक्षण मॉड्यूल चुनें",
            moduleSelect_subtitle: "शुरू करने के लिए एक मॉड्यूल चुनें। आपकी भाषा और प्रगति स्वतः बनी रहेगी।",
            moduleSelect_start: "मॉड्यूल शुरू करें",
            moduleSelect_resume: "मॉड्यूल जारी रखें",
            moduleSelect_questions: "परिदृश्य",
            moduleSelect_completed: "पूर्ण",
            scan_title: "अपना परिवेश तैयार करें",
            scan_subtitle: "हम आपके वास्तविक परिवेश में खतरे दिखाने के लिए कैमरे का उपयोग करेंगे। यदि यह इस डिवाइस पर संभव नहीं है, तो इसके बजाय 3D सिमुलेशन मोड उपयोग होगा — प्रशिक्षण दोनों में समान है।",
            scan_allow_camera: "कैमरा एक्सेस दें",
            scan_skip_camera: "छोड़ें — सिमुलेशन मोड उपयोग करें",
            scan_status_requesting: "कैमरा अनुमति का अनुरोध किया जा रहा है…",
            scan_status_denied: "इस डिवाइस/ब्राउज़र पर कैमरा उपलब्ध नहीं है। सिमुलेशन मोड में बदल रहे हैं।",
            scan_status_scanning: "अपने आस-पास को स्कैन करने के लिए फ़ोन को धीरे-धीरे घुमाएं…",
            scan_status_surface_detected: "सतह मिल गई।",
            scan_status_ready: "परिवेश तैयार है।",
            scan_status_low_light: "अपर्याप्त रोशनी — किसी उजाले वाले क्षेत्र में जाएं, या सिमुलेशन मोड में जारी रखें।",
            scan_status_no_space: "यह जगह मूवमेंट-आधारित कार्य के लिए संकरी लग रही है — इसके बजाय हम टैप-टू-मूव विकल्प उपयोग करेंगे।",
            scan_continue: "प्रशिक्षण जारी रखें",
            scan_mode_ar: "एआर मोड (कैमरा)",
            scan_mode_sim: "सिमुलेशन मोड (3D)",
            ar_ready_title: "एआर तैयार है",
            ar_check_camera: "कैमरा",
            ar_check_webxr: "वेबएक्सआर",
            ar_check_environment: "परिवेश",
            ar_start_training: "एआर प्रशिक्षण शुरू करें",
            ar_use_simulation: "सिमुलेशन उपयोग करें",
            ar_not_available_title: "इस डिवाइस पर एआर उपलब्ध नहीं है",
            ar_continue_simulation: "सिमुलेशन में जारी रखें",
            ar_searching_surface: "अपने कैमरे को किसी समतल सतह की ओर इंगित करें…",
            ar_surface_found: "सतह मिल गई — रखने के लिए टैप करें",
            ar_place_manually: "यहां मैन्युअल रूप से रखें",
            ar_exit_btn: "एआर से बाहर निकलें",
            ar_error_notice: "एआर शुरू नहीं हो सका — सिमुलेशन मोड में जा रहे हैं।",
            training_scenario: "परिदृश्य",
            training_of: "में से",
            training_timeLeft: "शेष समय",
            training_score: "स्कोर",
            training_instruction: "आपको क्या करना चाहिए?",
            training_confirm: "कार्रवाई की पुष्टि करें",
            training_next: "अगला परिदृश्य",
            training_finishModule: "मॉड्यूल समाप्त करें",
            training_retry: "पुनः प्रयास करें",
            feedback_correct_title: "सही — सुरक्षित परिणाम",
            feedback_incorrect_title: "गलत — असुरक्षित परिणाम",
            feedback_timeout_title: "समय समाप्त",
            feedback_whyMatters: "यह क्यों महत्वपूर्ण है",
            completion_title: "मॉड्यूल पूर्ण",
            completion_score: "आपका स्कोर",
            completion_rating: "रेटिंग",
            completion_viewDashboard: "मॉड्यूल पर वापस जाएं",
            completion_viewResults: "मेरे परिणाम देखें",
            rating_excellent: "उत्कृष्ट",
            rating_good: "अच्छा",
            rating_needsImprovement: "सुधार आवश्यक",
            rating_failed: "पुनः प्रशिक्षण आवश्यक",
            common_back: "वापस",
            common_loading: "लोड हो रहा है…"
        }
    };

    function getLang() {
        try {
            return sessionStorage.getItem(LANG_STORAGE_KEY) || localStorage.getItem(LANG_STORAGE_KEY) || DEFAULT_LANG;
        } catch (e) {
            return DEFAULT_LANG;
        }
    }

    function setLang(lang) {
        const val = (lang === "hi") ? "hi" : "en";
        try {
            sessionStorage.setItem(LANG_STORAGE_KEY, val);
            localStorage.setItem(LANG_STORAGE_KEY, val);
        } catch (e) {}
    }

    function hasLang() {
        try {
            return !!(sessionStorage.getItem(LANG_STORAGE_KEY) || localStorage.getItem(LANG_STORAGE_KEY));
        } catch (e) {
            return false;
        }
    }

    /** Resolve a fixed UI chrome string by key, in the current session language. */
    function t(key) {
        const lang = getLang();
        return (CHROME[lang] && CHROME[lang][key]) || CHROME[DEFAULT_LANG][key] || key;
    }

    /** Resolve a bilingual content field object {en, hi} from the JSON. */
    function field(obj) {
        if (!obj) return "";
        const lang = getLang();
        return obj[lang] || obj[DEFAULT_LANG] || "";
    }

    return { getLang, setLang, hasLang, t, field };
})();
