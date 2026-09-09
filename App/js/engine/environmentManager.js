/**
 * SafeAR — EnvironmentManager
 *
 * Practical (not pretend-perfect) environment detection, per the brief:
 *   1. Try automatic detection where it's actually reliable in a browser
 *      (camera availability, a crude brightness sample from the live video
 *      frame).
 *   2. Decide whether that's enough to proceed.
 *   3. If automatic detection is unreliable/unavailable, let the trainee
 *      confirm/select the environment condition themselves from the current
 *      scenario's own plausible list — exactly the fallback the JSON itself
 *      describes ("The fallback can allow the user to select/confirm the
 *      environment").
 *
 * This does NOT attempt real plane/object computer-vision detection — that
 * is explicitly out of scope for a browser-based demo per the JSON's own
 * technical_dependencies table (TD02/TD03/TD04/TD05 all name a floating/
 * confirm-based fallback as acceptable). What it DOES do reliably: camera
 * permission, a real brightness read, and available floor-space heuristics
 * (viewport size as a very rough proxy) feeding TD06's stated fallback.
 */

const EnvironmentManager = (() => {
    let stream = null;

    function requestCamera() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            return Promise.resolve(null);
        }
        return navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
            .then(s => { stream = s; return s; })
            .catch(() => null);
    }

    function stopCamera() {
        if (stream) {
            stream.getTracks().forEach(t => t.stop());
            stream = null;
        }
    }

    function probeWebXRAR() {
        if (!navigator.xr || !navigator.xr.isSessionSupported) return Promise.resolve(false);
        return navigator.xr.isSessionSupported("immersive-ar").catch(() => false);
    }

    /** Draws one frame of the given <video> to an offscreen canvas and returns
     *  an average luminance 0-255 (a crude but real brightness read). */
    function sampleBrightness(videoEl) {
        try {
            const w = 32, h = 24;
            const canvas = document.createElement("canvas");
            canvas.width = w; canvas.height = h;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(videoEl, 0, 0, w, h);
            const { data } = ctx.getImageData(0, 0, w, h);
            let total = 0;
            for (let i = 0; i < data.length; i += 4) {
                total += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
            }
            return total / (data.length / 4);
        } catch (e) {
            return null; // e.g. tainted canvas / not enough frames yet
        }
    }

    function classifyBrightness(avg) {
        if (avg === null || avg === undefined) return "unknown";
        if (avg < 60) return "low";
        if (avg < 140) return "moderate";
        return "bright";
    }

    /** Very rough "is there enough floor space for a movement task" proxy —
     *  a real check would need world tracking; this uses viewport size as a
     *  stand-in signal (a phone in portrait in a visibly cramped browser
     *  window is treated conservatively) per TD06's own fallback guidance. */
    function hasLikelyOpenSpace() {
        return Math.min(window.innerWidth, window.innerHeight) >= 300;
    }

    return {
        requestCamera,
        stopCamera,
        probeWebXRAR,
        sampleBrightness,
        classifyBrightness,
        hasLikelyOpenSpace
    };
})();
