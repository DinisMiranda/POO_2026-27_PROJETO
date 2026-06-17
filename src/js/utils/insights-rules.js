import { t } from "../data/i18n.js";

export function buildInsightsRecommendations(avgMood, streak) {
 if (avgMood < 3.2) {
  return [
   {
    title: t("insights.recLow1Title"),
    text: t("insights.recLow1Text"),
   },
   {
    title: t("insights.recLow2Title"),
    text: t("insights.recLow2Text"),
   },
  ];
 }

 if (streak >= 7) {
  return [
   {
    title: t("insights.recHigh1Title"),
    text: t("insights.recHigh1Text"),
   },
   {
    title: t("insights.recHigh2Title"),
    text: t("insights.recHigh2Text"),
   },
  ];
 }

 return [
  {
   title: t("insights.recDefault1Title"),
   text: t("insights.recDefault1Text"),
  },
  {
   title: t("insights.recDefault2Title"),
   text: t("insights.recDefault2Text"),
  },
 ];
}
