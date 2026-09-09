/**
 * SafeAR — combines the three per-module scene-builder tables into one map
 * keyed by question_id, mirroring INTERACTION_CONFIGS
 * (App/js/engine/interactionConfigs.js) so the training screen can look up
 * "what does this question look like" and "what does this question need me
 * to do" from the same key. tests/content-consistency.test.js cross-checks
 * this map against both the JSON and INTERACTION_CONFIGS.
 */

const SCENE_BUILDERS = Object.assign({}, Mod01Scenes, Mod02Scenes, Mod03Scenes);
