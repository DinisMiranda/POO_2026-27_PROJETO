import { getLanguage } from "./i18n.js";

export const LEVEL_TIERS = [
 { minLevel: 1, maxLevel: 2, name: "Despertar", nameEn: "Awakening" },
 { minLevel: 3, maxLevel: 5, name: "Explorador", nameEn: "Explorer" },
 { minLevel: 6, maxLevel: 9, name: "Equilíbrio", nameEn: "Balance" },
 { minLevel: 10, maxLevel: 14, name: "Resiliência", nameEn: "Resilience" },
 { minLevel: 15, maxLevel: 19, name: "Maestria Zen", nameEn: "Zen Mastery" },
 { minLevel: 20, maxLevel: Infinity, name: "Zenith", nameEn: "Zenith" },
];

export function getLevelTierName(level, locale = getLanguage()) {
 const tier = LEVEL_TIERS.find(
  (t) => level >= t.minLevel && level <= t.maxLevel,
 );
 if (!tier) return locale === "en" ? "Awakening" : "Despertar";
 return locale === "en" ? tier.nameEn : tier.name;
}
