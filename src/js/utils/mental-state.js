import { dateStr } from "../data/utils.js";
import { t } from "../data/i18n.js";

const DAY_KEYS = ["dom", "seg", "ter", "qua", "qui", "sex", "sab"];

export function getLast7Days() {
 const days = [];
 for (let i = 6; i >= 0; i--) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - i);
  days.push({
   date: dateStr(d),
   label: t(`mental.${DAY_KEYS[d.getDay()]}`),
  });
 }
 return days;
}

export function resolveMentalState(moodLogs) {
 const moodByDate = new Map(
  moodLogs.map((entry) => [entry.date, Number(entry.mood)]),
 );
 const weekDays = getLast7Days();
 let values = weekDays
  .map((d) => moodByDate.get(d.date))
  .filter((v) => v != null && !Number.isNaN(v));

 if (!values.length && moodLogs.length > 0) {
  values = [...moodLogs]
   .sort((a, b) => a.date.localeCompare(b.date))
   .slice(-7)
   .map((entry) => Number(entry.mood))
   .filter((v) => !Number.isNaN(v));
 }

 if (!values.length) {
  return {
   title: t("mental.noData"),
   message: t("mental.noDataMsg"),
   score: null,
   trend: "stable",
   trendLabel: t("mental.trendStable"),
   face: "empty",
  };
 }

 const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
 const split = Math.max(1, Math.floor(values.length / 2));
 const firstAvg = values.slice(0, split).reduce((sum, v) => sum + v, 0) / split;
 const secondSlice = values.slice(split);
 const secondAvg =
  secondSlice.length ?
   secondSlice.reduce((sum, v) => sum + v, 0) / secondSlice.length
  : firstAvg;

 let trend = "stable";
 let trendLabel = t("mental.trendStable");
 if (secondAvg - firstAvg > 0.15) {
  trend = "up";
  trendLabel = t("mental.trendUp");
 } else if (firstAvg - secondAvg > 0.15) {
  trend = "down";
  trendLabel = t("mental.trendDown");
 }

 let title = t("mental.sensitive");
 let message = t("mental.sensitiveMsg");
 let face = "low";

 if (avg >= 4) {
  title = t("mental.radiant");
  message = t("mental.radiantMsg");
  face = "balanced";
 } else if (avg >= 3.2) {
  title = t("mental.balanced");
  message = t("mental.balancedMsg");
  face = "balanced";
 } else if (avg >= 2.5) {
  title = t("mental.stable");
  message = t("mental.stableMsg");
  face = "calm";
 }

 return { title, message, score: avg, trend, trendLabel, face };
}
