import { getLanguage } from "./i18n.js";
import { APP_STRINGS } from "./i18n-app.js";

function patchEntity(entity, bucket) {
 if (getLanguage() !== "en") return entity;

 const patch = APP_STRINGS.en.content?.[bucket]?.[entity.id];
 if (!patch) return entity;

 return { ...entity, ...patch };
}

export function localizeActivity(activity) {
 return patchEntity(activity, "activities");
}

export function localizeChallenge(challenge) {
 return patchEntity(challenge, "challenges");
}

export function localizeMedal(medal) {
 return patchEntity(medal, "medals");
}

export function localizeTip(tip) {
 return patchEntity(tip, "tips");
}
